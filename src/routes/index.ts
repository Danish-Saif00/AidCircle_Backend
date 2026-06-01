import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "AidCircle API v1",
    data: {
      service: "AidCircle Emergency Response API",
      version: "1.0.0",
      modules: [
        "auth",
        "users",
        "locations",
        "emergencies",
        "responders",
        "notifications",
        "reports",
      ],
      documentation: {
        swagger: "/api-docs",
        openApiJson: "/api-docs.json",
      },
    },
  });
});

export const apiRouter = router;