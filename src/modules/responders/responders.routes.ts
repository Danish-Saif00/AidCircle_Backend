import { Router, type Request, type Response } from "express";

import type { ApiSuccessResponse } from "../../types/api.types.js";

type RespondersModuleInfo = {
  module: "responders";
  status: "scaffolded";
  plannedEndpoints: string[];
};

export const respondersRouter = Router();

respondersRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<RespondersModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Responders module is available",
      data: {
        module: "responders",
        status: "scaffolded",
        plannedEndpoints: [
          "POST /api/v1/responders/emergencies/:emergencyId/accept",
          "PATCH /api/v1/responders/emergencies/:emergencyId/status",
          "DELETE /api/v1/responders/emergencies/:emergencyId/leave",
          "GET /api/v1/responders/me/active",
          "GET /api/v1/responders/me/history",
        ],
      },
    });
  },
);