import compression from "compression";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
    }),
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  if (env.nodeEnv !== "test") {
    app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  }

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: `${env.app.name} backend is running`,
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/v1", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: `${env.app.name} API v1`,
    });
  });

  return app;
}

export const app = createApp();