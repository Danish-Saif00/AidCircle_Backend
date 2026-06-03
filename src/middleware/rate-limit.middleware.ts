import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { AppError } from "./error.middleware.js";

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

let nextCleanupAt = Date.now() + 60_000;

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function getRateLimitKey(req: Request, keyPrefix: string): string {
  return `${keyPrefix}:${getClientIp(req)}`;
}

function cleanupExpiredRecords(now: number): void {
  if (now < nextCleanupAt) {
    return;
  }

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  nextCleanupAt = now + 60_000;
}

function setRateLimitHeaders(params: {
  res: Response;
  limit: number;
  remaining: number;
  resetAt: number;
}): void {
  const resetSeconds = Math.ceil(params.resetAt / 1000);

  params.res.setHeader("X-RateLimit-Limit", String(params.limit));
  params.res.setHeader("X-RateLimit-Remaining", String(params.remaining));
  params.res.setHeader("X-RateLimit-Reset", String(resetSeconds));
}

function createRateLimitMiddleware(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();

    cleanupExpiredRecords(now);

    const key = getRateLimitKey(req, options.keyPrefix);
    const existingRecord = rateLimitStore.get(key);

    if (!existingRecord || existingRecord.resetAt <= now) {
      const resetAt = now + options.windowMs;

      rateLimitStore.set(key, {
        count: 1,
        resetAt,
      });

      setRateLimitHeaders({
        res,
        limit: options.maxRequests,
        remaining: options.maxRequests - 1,
        resetAt,
      });

      next();
      return;
    }

    if (existingRecord.count >= options.maxRequests) {
      const retryAfterSeconds = Math.ceil((existingRecord.resetAt - now) / 1000);

      res.setHeader("Retry-After", String(retryAfterSeconds));

      setRateLimitHeaders({
        res,
        limit: options.maxRequests,
        remaining: 0,
        resetAt: existingRecord.resetAt,
      });

      next(AppError.tooManyRequests("Too many requests. Please try again later."));
      return;
    }

    existingRecord.count += 1;

    setRateLimitHeaders({
      res,
      limit: options.maxRequests,
      remaining: Math.max(options.maxRequests - existingRecord.count, 0),
      resetAt: existingRecord.resetAt,
    });

    next();
  };
}

export const generalRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: env.rateLimit.generalWindowMs,
  maxRequests: env.rateLimit.generalMaxRequests,
  keyPrefix: "general",
});

export const authRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: env.rateLimit.authWindowMs,
  maxRequests: env.rateLimit.authMaxRequests,
  keyPrefix: "auth",
});