import { Router, type Request, type Response } from "express";

import type { ApiSuccessResponse } from "../../types/api.types.js";

type AuthModuleInfo = {
  module: "auth";
  status: "scaffolded";
  plannedEndpoints: string[];
};

export const authRouter = Router();

authRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<AuthModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Auth module is available",
      data: {
        module: "auth",
        status: "scaffolded",
        plannedEndpoints: [
          "POST /api/v1/auth/signup",
          "POST /api/v1/auth/login",
          "POST /api/v1/auth/logout",
          "POST /api/v1/auth/refresh",
          "GET /api/v1/auth/me"
        ],
      },
    });
  },
);