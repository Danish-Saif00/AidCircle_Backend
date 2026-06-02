import { Router, type Request, type Response } from "express";

import type { ApiSuccessResponse } from "../../types/api.types.js";

type NotificationsModuleInfo = {
  module: "notifications";
  status: "scaffolded";
  plannedEndpoints: string[];
};

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  (
    _req: Request,
    res: Response<ApiSuccessResponse<NotificationsModuleInfo>>,
  ) => {
    res.status(200).json({
      success: true,
      message: "Notifications module is available",
      data: {
        module: "notifications",
        status: "scaffolded",
        plannedEndpoints: [
          "POST /api/v1/notifications/devices",
          "DELETE /api/v1/notifications/devices/:deviceId",
          "GET /api/v1/notifications/me",
          "PATCH /api/v1/notifications/:notificationId/read",
          "POST /api/v1/notifications/test-push",
        ],
      },
    });
  },
);