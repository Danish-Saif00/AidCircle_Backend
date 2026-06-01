import type { Request, Response } from "express";

import type { ApiErrorResponse } from "../types/api.types.js";

export function notFoundMiddleware(
  req: Request,
  res: Response<ApiErrorResponse>,
): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: {
      code: "ROUTE_NOT_FOUND",
    },
  });
}