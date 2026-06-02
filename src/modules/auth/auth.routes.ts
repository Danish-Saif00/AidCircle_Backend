import { Router, type Request, type Response } from "express";

import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type AuthModuleInfo = {
  module: "auth";
  status: "scaffolded";
  plannedEndpoints: string[];
};

type AuthMeResponse = {
  user: {
    id: string;
    email?: string;
    phone?: string;
    role?: string;
  };
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
          "GET /api/v1/auth/me",
        ],
      },
    });
  },
);

authRouter.get(
  "/me",
  authMiddleware,
  (req: Request, res: Response<ApiSuccessResponse<AuthMeResponse>>) => {
    const user = getAuthenticatedUser(req);

    res.status(200).json({
      success: true,
      message: "Authenticated user returned successfully",
      data: {
        user,
      },
    });
  },
);