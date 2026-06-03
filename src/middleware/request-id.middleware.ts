import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const REQUEST_ID_HEADER = "x-request-id";
const RESPONSE_REQUEST_ID_HEADER = "X-Request-Id";

function normalizeRequestId(value: string | string[] | undefined): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return null;
  }

  const requestId = rawValue.trim();

  if (requestId.length === 0 || requestId.length > 128) {
    return null;
  }

  if (!/^[a-zA-Z0-9._:-]+$/.test(requestId)) {
    return null;
  }

  return requestId;
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incomingRequestId = normalizeRequestId(req.headers[REQUEST_ID_HEADER]);
  const requestId = incomingRequestId ?? randomUUID();

  res.locals.requestId = requestId;
  res.setHeader(RESPONSE_REQUEST_ID_HEADER, requestId);

  next();
}