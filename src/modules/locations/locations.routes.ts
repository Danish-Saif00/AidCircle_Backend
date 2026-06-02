import { Router, type Request, type Response } from "express";

import type { ApiSuccessResponse } from "../../types/api.types.js";

type LocationsModuleInfo = {
  module: "locations";
  status: "scaffolded";
  plannedEndpoints: string[];
};

export const locationsRouter = Router();

locationsRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<LocationsModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Locations module is available",
      data: {
        module: "locations",
        status: "scaffolded",
        plannedEndpoints: [
          "POST /api/v1/locations/me",
          "GET /api/v1/locations/me",
          "GET /api/v1/locations/nearby-users",
          "GET /api/v1/locations/nearby-emergencies",
        ],
      },
    });
  },
);