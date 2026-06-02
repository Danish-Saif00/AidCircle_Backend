import { Router, type Request, type Response } from "express";

import type { ApiSuccessResponse } from "../../types/api.types.js";

type UsersModuleInfo = {
  module: "users";
  status: "scaffolded";
  plannedEndpoints: string[];
};

export const usersRouter = Router();

usersRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<UsersModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Users module is available",
      data: {
        module: "users",
        status: "scaffolded",
        plannedEndpoints: [
          "GET /api/v1/users/me",
          "PATCH /api/v1/users/me",
          "DELETE /api/v1/users/me",
          "GET /api/v1/users/:userId",
        ],
      },
    });
  },
);