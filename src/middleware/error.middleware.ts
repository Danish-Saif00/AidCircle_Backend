import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import type { ApiErrorDetail, ApiErrorResponse } from "../types/api.types.js";

type AppErrorParams = {
  message: string;
  statusCode: number;
  code: string;
  details?: ApiErrorDetail[];
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];

  public constructor(params: AppErrorParams) {
    super(params.message);

    this.name = "AppError";
    this.statusCode = params.statusCode;
    this.code = params.code;

    if (params.details !== undefined) {
      this.details = params.details;
    }

    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(
    message = "Bad request",
    details?: ApiErrorDetail[],
  ): AppError {
    if (details !== undefined) {
      return new AppError({
        message,
        statusCode: 400,
        code: "BAD_REQUEST",
        details,
      });
    }

    return new AppError({
      message,
      statusCode: 400,
      code: "BAD_REQUEST",
    });
  }

  public static unauthorized(message = "Unauthorized"): AppError {
    return new AppError({
      message,
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }

  public static forbidden(message = "Forbidden"): AppError {
    return new AppError({
      message,
      statusCode: 403,
      code: "FORBIDDEN",
    });
  }

  public static notFound(message = "Resource not found"): AppError {
    return new AppError({
      message,
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  public static conflict(
    message = "Conflict",
    details?: ApiErrorDetail[],
  ): AppError {
    if (details !== undefined) {
      return new AppError({
        message,
        statusCode: 409,
        code: "CONFLICT",
        details,
      });
    }

    return new AppError({
      message,
      statusCode: 409,
      code: "CONFLICT",
    });
  }

  public static tooManyRequests(message = "Too many requests"): AppError {
    return new AppError({
      message,
      statusCode: 429,
      code: "TOO_MANY_REQUESTS",
    });
  }

  public static internal(message = "Internal server error"): AppError {
    return new AppError({
      message,
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

function mapZodError(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => {
    const fieldPath = issue.path.join(".");

    const detail: ApiErrorDetail = {
      message: issue.message,
      code: issue.code,
    };

    if (fieldPath.length > 0) {
      detail.field = fieldPath;
    }

    return detail;
  });
}

function buildErrorResponse(error: AppError): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    message: error.message,
    error: {
      code: error.code,
    },
  };

  if (error.details !== undefined) {
    response.error.details = error.details;
  }

  return response;
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    const validationError = AppError.badRequest(
      "Validation failed",
      mapZodError(error),
    );

    res.status(validationError.statusCode).json(buildErrorResponse(validationError));
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json(buildErrorResponse(error));
    return;
  }

  const internalError = AppError.internal();

  console.error(
    JSON.stringify({
      level: "error",
      event: "UNHANDLED_APP_ERROR",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }),
  );

  res.status(internalError.statusCode).json(buildErrorResponse(internalError));
}