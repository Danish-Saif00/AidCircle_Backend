import type { NextFunction, Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import type { AuthenticatedUser } from "../types/api.types.js";
import { AppError } from "./error.middleware.js";

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

function extractBearerToken(req: Request): string {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw AppError.unauthorized("Authorization header is required");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw AppError.unauthorized(
      "Authorization header must use Bearer token format",
    );
  }

  return token;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearerToken(req);

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      throw AppError.unauthorized("Invalid or expired authentication token");
    }

    const authenticatedUser: AuthenticatedUser = {
      id: data.user.id,
    };

    if (data.user.email) {
      authenticatedUser.email = data.user.email;
    }

    if (data.user.phone) {
      authenticatedUser.phone = data.user.phone;
    }

    const role = data.user.app_metadata?.role;

    if (typeof role === "string" && role.length > 0) {
      authenticatedUser.role = role;
    }

    (req as RequestWithUser).user = authenticatedUser;

    next();
  } catch (error) {
    next(error);
  }
}

export function getAuthenticatedUser(req: Request): AuthenticatedUser {
  const user = (req as RequestWithUser).user;

  if (!user) {
    throw AppError.unauthorized("Authenticated user context is missing");
  }

  return user;
}