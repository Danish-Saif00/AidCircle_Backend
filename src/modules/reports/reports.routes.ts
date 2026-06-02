import { Router, type Request, type Response } from "express";

import type { ApiSuccessResponse } from "../../types/api.types.js";

type ReportsModuleInfo = {
  module: "reports";
  status: "scaffolded";
  plannedEndpoints: string[];
};

export const reportsRouter = Router();

reportsRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<ReportsModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Reports module is available",
      data: {
        module: "reports",
        status: "scaffolded",
        plannedEndpoints: [
          "POST /api/v1/reports/emergencies/:emergencyId",
          "POST /api/v1/reports/users/:userId",
          "GET /api/v1/reports/me",
          "GET /api/v1/reports/admin",
          "PATCH /api/v1/reports/admin/:reportId/status",
        ],
      },
    });
  },
);