import type { NextFunction, Request, Response } from "express";

function getResponseRequestId(res: Response): string | undefined {
  const requestId = res.locals.requestId;

  if (typeof requestId !== "string" || requestId.length === 0) {
    return undefined;
  }

  return requestId;
}

function getRequestDurationMs(startedAt: bigint): number {
  const durationNs = process.hrtime.bigint() - startedAt;

  return Number(durationNs / 1_000_000n);
}

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const requestId = getResponseRequestId(res);
    const durationMs = getRequestDurationMs(startedAt);

    console.log(
      JSON.stringify({
        level: "info",
        event: "HTTP_REQUEST_COMPLETED",
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
      }),
    );
  });

  next();
}