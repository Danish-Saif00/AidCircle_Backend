import { Router, type Request, type Response } from "express";

import type { ApiSuccessResponse } from "../../types/api.types.js";

type EmergenciesModuleInfo = {
  module: "emergencies";
  status: "scaffolded";
  plannedEndpoints: string[];
};

export const emergenciesRouter = Router();

emergenciesRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<EmergenciesModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Emergencies module is available",
      data: {
        module: "emergencies",
        status: "scaffolded",
        plannedEndpoints: [
          "POST /api/v1/emergencies",
          "GET /api/v1/emergencies",
          "GET /api/v1/emergencies/:emergencyId",
          "PATCH /api/v1/emergencies/:emergencyId/cancel",
          "PATCH /api/v1/emergencies/:emergencyId/resolve",
          "GET /api/v1/emergencies/me/history",
        ],
      },
    });
  },
);