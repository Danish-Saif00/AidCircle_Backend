import type { Request, Response } from "express";

import type { ApiErrorResponse } from "../types/api.types.js";

function getResponseRequestId(res: Response): string | undefined {
  const requestId = res.locals.requestId;

  if (typeof requestId !== "string" || requestId.length === 0) {
    return undefined;
  }

  return requestId;
}

export function notFoundMiddleware(
  req: Request,
  res: Response<ApiErrorResponse>,
): void {
  const requestId = getResponseRequestId(res);

  const response: ApiErrorResponse = {
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: {
      code: "ROUTE_NOT_FOUND",
    },
  };

  if (requestId !== undefined) {
    response.requestId = requestId;
  }

  res.status(404).json(response);
}