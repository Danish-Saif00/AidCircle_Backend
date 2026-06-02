import { Router, type Request, type Response } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";
import { emergenciesRouter } from "../modules/emergencies/emergencies.routes.js";
import { locationsRouter } from "../modules/locations/locations.routes.js";
import { respondersRouter } from "../modules/responders/responders.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";

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

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/locations", locationsRouter);
router.use("/emergencies", emergenciesRouter);
router.use("/responders", respondersRouter);

export const apiRouter = router;