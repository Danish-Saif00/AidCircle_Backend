import compression from "compression";
import cors, { type CorsOptions } from "cors";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import { openApiDocument } from "./config/openapi.js";
import { AppError, errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware.js";
import { apiRouter } from "./routes/index.js";

function buildCorsOptions(): CorsOptions {
  const allowedOrigins = env.cors.allowedOrigins;

  if (env.nodeEnv !== "production" && allowedOrigins.length === 0) {
    return {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id"],
    };
  }

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(AppError.forbidden("CORS origin is not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
  };
}

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
    }),
  );

  app.use(cors(buildCorsOptions()));

  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: `${env.app.name} backend is running`,
      environment: env.nodeEnv,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.status(200).json(openApiDocument);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "AidCircle API Docs",
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  app.use("/api/v1", apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();