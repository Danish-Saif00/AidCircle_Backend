import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { firebaseMessaging } from "../../lib/firebase-admin.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type DevicePlatform = "android" | "ios";

type NotificationStatus = "pending" | "sent" | "failed" | "read";

type UserDevice = {
  id: string;
  userId: string;
  platform: DevicePlatform;
  deviceToken: string;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserDeviceRow = {
  id: string;
  user_id: string;
  platform: DevicePlatform;
  device_token: string;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

type UserNotification = {
  id: string;
  userId: string;
  emergencyId: string | null;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  sentAt: string | null;
  readAt: string | null;
  errorMessage: string | null;
  createdAt: string;
};

type UserNotificationRow = {
  id: string;
  user_id: string;
  emergency_id: string | null;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  sent_at: string | null;
  read_at: string | null;
  error_message: string | null;
  created_at: string;
};

type RegisterDevicePayload = {
  user_id: string;
  platform: DevicePlatform;
  device_token: string;
  is_active: true;
  last_seen_at: string;
};

type CreateNotificationPayload = {
  user_id: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  status: "pending";
};

type UpdateNotificationDeliveryPayload = {
  status: NotificationStatus;
  sent_at?: string;
  error_message?: string | null;
};

type DeviceResponse = {
  device: UserDevice;
};

type NotificationsResponse = {
  notifications: UserNotification[];
};

type NotificationResponse = {
  notification: UserNotification;
};

type TestPushResponse = {
  notification: UserNotification;
  push: {
    requestedDevices: number;
    successCount: number;
    failureCount: number;
  };
};

type NotificationsModuleInfo = {
  module: "notifications";
  status: "active";
  plannedEndpoints: string[];
};

const deviceIdParamSchema = z.string().uuid();
const notificationIdParamSchema = z.string().uuid();

const registerDeviceSchema = z
  .object({
    platform: z.enum(["android", "ios"]),
    deviceToken: z.string().trim().min(10).max(4096),
  })
  .strict();

const testPushSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    body: z.string().trim().min(1).max(500).optional(),
    payload: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const notificationsRouter = Router();

function getUserDeviceSelectColumns(): string {
  return [
    "id",
    "user_id",
    "platform",
    "device_token",
    "is_active",
    "last_seen_at",
    "created_at",
    "updated_at",
  ].join(",");
}

function getNotificationSelectColumns(): string {
  return [
    "id",
    "user_id",
    "emergency_id",
    "title",
    "body",
    "payload",
    "status",
    "sent_at",
    "read_at",
    "error_message",
    "created_at",
  ].join(",");
}

function mapUserDevice(row: UserDeviceRow): UserDevice {
  return {
    id: row.id,
    userId: row.user_id,
    platform: row.platform,
    deviceToken: row.device_token,
    isActive: row.is_active,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapNotification(row: UserNotificationRow): UserNotification {
  return {
    id: row.id,
    userId: row.user_id,
    emergencyId: row.emergency_id,
    title: row.title,
    body: row.body,
    payload: row.payload,
    status: row.status,
    sentAt: row.sent_at,
    readAt: row.read_at,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  };
}

function buildRegisterDevicePayload(params: {
  userId: string;
  input: z.infer<typeof registerDeviceSchema>;
}): RegisterDevicePayload {
  return {
    user_id: params.userId,
    platform: params.input.platform,
    device_token: params.input.deviceToken,
    is_active: true,
    last_seen_at: new Date().toISOString(),
  };
}

function stringifyPushPayload(
  payload: Record<string, unknown>,
): Record<string, string> {
  const data: Record<string, string> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      data[key] = value;
      continue;
    }

    data[key] = JSON.stringify(value);
  }

  return data;
}

async function updateNotificationDeliveryStatus(params: {
  notificationId: string;
  status: NotificationStatus;
  errorMessage?: string;
}): Promise<UserNotificationRow> {
  const updatePayload: UpdateNotificationDeliveryPayload = {
    status: params.status,
  };

  if (params.status === "sent") {
    updatePayload.sent_at = new Date().toISOString();
    updatePayload.error_message = null;
  }

  if (params.status === "failed") {
    updatePayload.error_message =
      params.errorMessage ?? "Push notification delivery failed";
  }

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .update(updatePayload)
    .eq("id", params.notificationId)
    .select(getNotificationSelectColumns())
    .maybeSingle<UserNotificationRow>();

  if (error) {
    throw AppError.internal("Failed to update notification delivery status");
  }

  if (!data) {
    throw AppError.internal("Updated notification was not returned");
  }

  return data;
}

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
        status: "active",
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

notificationsRouter.post(
  "/devices",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<DeviceResponse>>) => {
    const user = getAuthenticatedUser(req);
    const parsedBody = registerDeviceSchema.parse(req.body);

    const devicePayload = buildRegisterDevicePayload({
      userId: user.id,
      input: parsedBody,
    });

    const { data, error } = await supabaseAdmin
      .from("user_devices")
      .upsert(devicePayload, {
        onConflict: "device_token",
      })
      .select(getUserDeviceSelectColumns())
      .maybeSingle<UserDeviceRow>();

    if (error) {
      throw AppError.internal("Failed to register device");
    }

    if (!data) {
      throw AppError.internal("Registered device was not returned");
    }

    res.status(200).json({
      success: true,
      message: "Device registered successfully",
      data: {
        device: mapUserDevice(data),
      },
    });
  },
);

notificationsRouter.delete(
  "/devices/:deviceId",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<DeviceResponse>>) => {
    const user = getAuthenticatedUser(req);
    const deviceId = deviceIdParamSchema.parse(req.params.deviceId);

    const { data, error } = await supabaseAdmin
      .from("user_devices")
      .update({
        is_active: false,
      })
      .eq("id", deviceId)
      .eq("user_id", user.id)
      .select(getUserDeviceSelectColumns())
      .maybeSingle<UserDeviceRow>();

    if (error) {
      throw AppError.internal("Failed to deactivate device");
    }

    if (!data) {
      throw AppError.notFound("Device not found");
    }

    res.status(200).json({
      success: true,
      message: "Device deactivated successfully",
      data: {
        device: mapUserDevice(data),
      },
    });
  },
);

notificationsRouter.get(
  "/me",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<NotificationsResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select(getNotificationSelectColumns())
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<UserNotificationRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch notifications");
    }

    res.status(200).json({
      success: true,
      message: "Notifications returned successfully",
      data: {
        notifications: data.map(mapNotification),
      },
    });
  },
);

notificationsRouter.patch(
  "/:notificationId/read",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<NotificationResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const notificationId = notificationIdParamSchema.parse(
      req.params.notificationId,
    );

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({
        status: "read",
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id)
      .select(getNotificationSelectColumns())
      .maybeSingle<UserNotificationRow>();

    if (error) {
      throw AppError.internal("Failed to mark notification as read");
    }

    if (!data) {
      throw AppError.notFound("Notification not found");
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
      data: {
        notification: mapNotification(data),
      },
    });
  },
);

notificationsRouter.post(
  "/test-push",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<TestPushResponse>>) => {
    if (!firebaseMessaging) {
      throw AppError.internal("Firebase push messaging is not configured");
    }

    const user = getAuthenticatedUser(req);
    const parsedBody = testPushSchema.parse(req.body);

    const title = parsedBody.title ?? "AidCircle test notification";
    const body = parsedBody.body ?? "Push notification delivery is working.";
    const payload = parsedBody.payload ?? {};

    const { data: devices, error: devicesError } = await supabaseAdmin
      .from("user_devices")
      .select(getUserDeviceSelectColumns())
      .eq("user_id", user.id)
      .eq("is_active", true)
      .returns<UserDeviceRow[]>();

    if (devicesError) {
      throw AppError.internal("Failed to fetch active devices");
    }

    if (devices.length === 0) {
      throw AppError.badRequest("No active device tokens found for this user");
    }

    const notificationPayload: CreateNotificationPayload = {
      user_id: user.id,
      title,
      body,
      payload,
      status: "pending",
    };

    const { data: notification, error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert(notificationPayload)
      .select(getNotificationSelectColumns())
      .maybeSingle<UserNotificationRow>();

    if (notificationError) {
      throw AppError.internal("Failed to create test notification");
    }

    if (!notification) {
      throw AppError.internal("Created test notification was not returned");
    }

    try {
      const pushResult = await firebaseMessaging.sendEachForMulticast({
        tokens: devices.map((device) => device.device_token),
        notification: {
          title,
          body,
        },
        data: stringifyPushPayload(payload),
      });

      const deliveryStatusPayload: {
        notificationId: string;
        status: NotificationStatus;
        errorMessage?: string;
      } = {
        notificationId: notification.id,
        status: pushResult.successCount > 0 ? "sent" : "failed",
      };

      if (pushResult.failureCount > 0) {
        deliveryStatusPayload.errorMessage =
          "One or more push notifications failed";
      }

      const finalNotification = await updateNotificationDeliveryStatus(
        deliveryStatusPayload,
      );

      res.status(200).json({
        success: true,
        message: "Test push notification processed successfully",
        data: {
          notification: mapNotification(finalNotification),
          push: {
            requestedDevices: devices.length,
            successCount: pushResult.successCount,
            failureCount: pushResult.failureCount,
          },
        },
      });
    } catch (error) {
      await updateNotificationDeliveryStatus({
        notificationId: notification.id,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      throw AppError.internal("Failed to send test push notification");
    }
  },
);