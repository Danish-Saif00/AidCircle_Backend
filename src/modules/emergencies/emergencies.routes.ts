import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { env } from "../../config/env.js";
import { firebaseMessaging } from "../../lib/firebase-admin.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type EmergencyPriority = "low" | "medium" | "high" | "critical";

type EmergencyStatus = "active" | "resolved" | "cancelled" | "expired";

type EmergencyCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priority: EmergencyPriority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type EmergencyCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priority: EmergencyPriority;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Emergency = {
  id: string;
  requesterId: string;
  categoryId: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radiusKm: number;
  status: EmergencyStatus;
  priority: EmergencyPriority;
  resolvedAt: string | null;
  cancelledAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

type EmergencyRow = {
  id: string;
  requester_id: string;
  category_id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radius_km: number;
  status: EmergencyStatus;
  priority: EmergencyPriority;
  resolved_at: string | null;
  cancelled_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

type NearbyUserRow = {
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  is_helper_available: boolean;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  last_updated_at: string;
  distance_meters: number;
};

type UserDeviceTokenRow = {
  user_id: string;
  device_token: string;
};

type NotificationIdRow = {
  id: string;
};

type CreateNotificationPayload = {
  user_id: string;
  emergency_id: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  status: "pending";
};

type NotificationDeliveryUpdatePayload = {
  status: "sent" | "failed";
  sent_at?: string;
  error_message?: string | null;
};

type EmergencyCategoriesResponse = {
  categories: EmergencyCategory[];
};

type EmergencyResponse = {
  emergency: Emergency;
};

type EmergenciesResponse = {
  emergencies: Emergency[];
};

type CreateEmergencyPayload = {
  requester_id: string;
  category_id: string;
  title: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  radius_km: number;
  priority: EmergencyPriority;
  expires_at: string;
};

type EmergencyStatusUpdatePayload = {
  status: EmergencyStatus;
  resolved_at?: string;
  cancelled_at?: string;
};

const emergencyPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

const createEmergencySchema = z
  .object({
    categoryId: z.string().uuid(),
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().max(1000).nullable().optional(),
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
    radiusKm: z.number().positive().max(50).optional(),
    priority: emergencyPrioritySchema.optional(),
  })
  .strict();

export const emergenciesRouter = Router();

function getEmergencyCategorySelectColumns(): string {
  return [
    "id",
    "name",
    "slug",
    "description",
    "priority",
    "is_active",
    "created_at",
    "updated_at",
  ].join(",");
}

function getEmergencySelectColumns(): string {
  return [
    "id",
    "requester_id",
    "category_id",
    "title",
    "description",
    "latitude",
    "longitude",
    "radius_km",
    "status",
    "priority",
    "resolved_at",
    "cancelled_at",
    "expires_at",
    "created_at",
    "updated_at",
  ].join(",");
}

function mapEmergencyCategory(row: EmergencyCategoryRow): EmergencyCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priority: row.priority,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEmergency(row: EmergencyRow): Emergency {
  return {
    id: row.id,
    requesterId: row.requester_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusKm: row.radius_km,
    status: row.status,
    priority: row.priority,
    resolvedAt: row.resolved_at,
    cancelledAt: row.cancelled_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildCreateEmergencyPayload(params: {
  requesterId: string;
  input: z.infer<typeof createEmergencySchema>;
  categoryPriority: EmergencyPriority;
}): CreateEmergencyPayload {
  const radiusKm = params.input.radiusKm ?? env.app.defaultAlertRadiusKm;
  const expiresAt = new Date(
    Date.now() + env.app.sosAutoExpireMinutes * 60 * 1000,
  ).toISOString();

  const payload: CreateEmergencyPayload = {
    requester_id: params.requesterId,
    category_id: params.input.categoryId,
    title: params.input.title,
    latitude: params.input.latitude,
    longitude: params.input.longitude,
    radius_km: radiusKm,
    priority: params.input.priority ?? params.categoryPriority,
    expires_at: expiresAt,
  };

  if (params.input.description !== undefined) {
    payload.description = params.input.description;
  }

  return payload;
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

function buildEmergencyNotificationPayload(params: {
  recipientId: string;
  emergency: EmergencyRow;
}): CreateNotificationPayload {
  return {
    user_id: params.recipientId,
    emergency_id: params.emergency.id,
    title: `SOS Alert: ${params.emergency.title}`,
    body:
      params.emergency.description ??
      "Someone nearby needs urgent help. Open AidCircle for details.",
    payload: {
      type: "emergency_created",
      emergencyId: params.emergency.id,
      requesterId: params.emergency.requester_id,
      categoryId: params.emergency.category_id,
      priority: params.emergency.priority,
      latitude: params.emergency.latitude,
      longitude: params.emergency.longitude,
      radiusKm: params.emergency.radius_km,
    },
    status: "pending",
  };
}

function buildNotificationDeliveryUpdate(params: {
  status: "sent" | "failed";
  errorMessage?: string;
}): NotificationDeliveryUpdatePayload {
  const payload: NotificationDeliveryUpdatePayload = {
    status: params.status,
  };

  if (params.status === "sent") {
    payload.sent_at = new Date().toISOString();
    payload.error_message = null;
  }

  if (params.status === "failed") {
    payload.error_message =
      params.errorMessage ?? "Push notification delivery failed";
  }

  return payload;
}

function logEmergencyNotificationFailure(error: unknown): void {
  console.error(
    JSON.stringify({
      level: "error",
      event: "EMERGENCY_NOTIFICATION_FANOUT_FAILED",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }),
  );
}

async function updateNotificationDeliveryStatus(params: {
  notificationIds: string[];
  status: "sent" | "failed";
  errorMessage?: string;
}): Promise<void> {
  if (params.notificationIds.length === 0) {
    return;
  }

  const deliveryUpdateParams: {
    status: "sent" | "failed";
    errorMessage?: string;
  } = {
    status: params.status,
  };

  if (params.errorMessage !== undefined) {
    deliveryUpdateParams.errorMessage = params.errorMessage;
  }

  const updatePayload = buildNotificationDeliveryUpdate(deliveryUpdateParams);

  const { error } = await supabaseAdmin
    .from("notifications")
    .update(updatePayload)
    .in("id", params.notificationIds);

  if (error) {
    throw AppError.internal("Failed to update notification delivery status");
  }
}

async function notifyNearbyUsersAboutEmergency(
  emergency: EmergencyRow,
): Promise<void> {
  try {
    const { data: nearbyUsersData, error: nearbyUsersError } =
      await supabaseAdmin.rpc("find_nearby_users", {
        origin_latitude: emergency.latitude,
        origin_longitude: emergency.longitude,
        radius_km: emergency.radius_km,
        excluded_user_id: emergency.requester_id,
      });

    if (nearbyUsersError) {
      throw nearbyUsersError;
    }

    const nearbyUsers = (nearbyUsersData ?? []) as unknown as NearbyUserRow[];

    if (nearbyUsers.length === 0) {
      return;
    }

    const recipientIds = nearbyUsers.map((nearbyUser) => nearbyUser.user_id);

    const notificationPayloads = recipientIds.map((recipientId) =>
      buildEmergencyNotificationPayload({
        recipientId,
        emergency,
      }),
    );

    const { data: createdNotifications, error: notificationCreateError } =
      await supabaseAdmin
        .from("notifications")
        .insert(notificationPayloads)
        .select("id")
        .returns<NotificationIdRow[]>();

    if (notificationCreateError) {
      throw notificationCreateError;
    }

    const notificationIds = createdNotifications.map(
      (notification) => notification.id,
    );

    const { data: devices, error: devicesError } = await supabaseAdmin
      .from("user_devices")
      .select("user_id,device_token")
      .in("user_id", recipientIds)
      .eq("is_active", true)
      .returns<UserDeviceTokenRow[]>();

    if (devicesError) {
      throw devicesError;
    }

    if (!firebaseMessaging || devices.length === 0) {
      return;
    }

    const pushResult = await firebaseMessaging.sendEachForMulticast({
      tokens: devices.map((device) => device.device_token),
      notification: {
        title: `SOS Alert: ${emergency.title}`,
        body:
          emergency.description ??
          "Someone nearby needs urgent help. Open AidCircle for details.",
      },
      data: stringifyPushPayload({
        type: "emergency_created",
        emergencyId: emergency.id,
        requesterId: emergency.requester_id,
        categoryId: emergency.category_id,
        priority: emergency.priority,
        latitude: emergency.latitude,
        longitude: emergency.longitude,
        radiusKm: emergency.radius_km,
      }),
    });

    const deliveryStatusParams: {
      notificationIds: string[];
      status: "sent" | "failed";
      errorMessage?: string;
    } = {
      notificationIds,
      status: pushResult.successCount > 0 ? "sent" : "failed",
    };

    if (pushResult.failureCount > 0) {
      deliveryStatusParams.errorMessage =
        "One or more push notifications failed";
    }

    await updateNotificationDeliveryStatus(deliveryStatusParams);
  } catch (error) {
    logEmergencyNotificationFailure(error);
  }
}

async function updateOwnedActiveEmergencyStatus(params: {
  emergencyId: string;
  requesterId: string;
  status: "resolved" | "cancelled";
}): Promise<EmergencyRow> {
  const now = new Date().toISOString();

  const updatePayload: EmergencyStatusUpdatePayload = {
    status: params.status,
  };

  if (params.status === "resolved") {
    updatePayload.resolved_at = now;
  }

  if (params.status === "cancelled") {
    updatePayload.cancelled_at = now;
  }

  const { data, error } = await supabaseAdmin
    .from("emergencies")
    .update(updatePayload)
    .eq("id", params.emergencyId)
    .eq("requester_id", params.requesterId)
    .eq("status", "active")
    .select(getEmergencySelectColumns())
    .maybeSingle<EmergencyRow>();

  if (error) {
    throw AppError.internal(`Failed to ${params.status} emergency`);
  }

  if (!data) {
    throw AppError.notFound(
      "Active emergency not found or you are not allowed to update it",
    );
  }

  return data;
}

emergenciesRouter.get(
  "/categories",
  async (
    _req: Request,
    res: Response<ApiSuccessResponse<EmergencyCategoriesResponse>>,
  ) => {
    const { data, error } = await supabaseAdmin
      .from("emergency_categories")
      .select(getEmergencyCategorySelectColumns())
      .eq("is_active", true)
      .order("name", { ascending: true })
      .returns<EmergencyCategoryRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch emergency categories");
    }

    res.status(200).json({
      success: true,
      message: "Emergency categories returned successfully",
      data: {
        categories: data.map(mapEmergencyCategory),
      },
    });
  },
);

emergenciesRouter.get(
  "/",
  authMiddleware,
  async (
    _req: Request,
    res: Response<ApiSuccessResponse<EmergenciesResponse>>,
  ) => {
    const { data, error } = await supabaseAdmin
      .from("emergencies")
      .select(getEmergencySelectColumns())
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<EmergencyRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch active emergencies");
    }

    res.status(200).json({
      success: true,
      message: "Active emergencies returned successfully",
      data: {
        emergencies: data.map(mapEmergency),
      },
    });
  },
);

emergenciesRouter.post(
  "/",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<EmergencyResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const parsedBody = createEmergencySchema.parse(req.body);

    const { data: category, error: categoryError } = await supabaseAdmin
      .from("emergency_categories")
      .select(getEmergencyCategorySelectColumns())
      .eq("id", parsedBody.categoryId)
      .eq("is_active", true)
      .maybeSingle<EmergencyCategoryRow>();

    if (categoryError) {
      throw AppError.internal("Failed to validate emergency category");
    }

    if (!category) {
      throw AppError.badRequest("Emergency category is invalid or inactive");
    }

    const emergencyPayload = buildCreateEmergencyPayload({
      requesterId: user.id,
      input: parsedBody,
      categoryPriority: category.priority,
    });

    const { data, error } = await supabaseAdmin
      .from("emergencies")
      .insert(emergencyPayload)
      .select(getEmergencySelectColumns())
      .maybeSingle<EmergencyRow>();

    if (error) {
      throw AppError.internal("Failed to create emergency");
    }

    if (!data) {
      throw AppError.internal("Created emergency was not returned");
    }

    await notifyNearbyUsersAboutEmergency(data);

    res.status(201).json({
      success: true,
      message: "Emergency created successfully",
      data: {
        emergency: mapEmergency(data),
      },
    });
  },
);

emergenciesRouter.get(
  "/me/history",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<EmergenciesResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);

    const { data, error } = await supabaseAdmin
      .from("emergencies")
      .select(getEmergencySelectColumns())
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<EmergencyRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch emergency history");
    }

    res.status(200).json({
      success: true,
      message: "Emergency history returned successfully",
      data: {
        emergencies: data.map(mapEmergency),
      },
    });
  },
);

emergenciesRouter.get(
  "/:emergencyId",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<EmergencyResponse>>,
  ) => {
    const emergencyId = z.string().uuid().parse(req.params.emergencyId);

    const { data, error } = await supabaseAdmin
      .from("emergencies")
      .select(getEmergencySelectColumns())
      .eq("id", emergencyId)
      .maybeSingle<EmergencyRow>();

    if (error) {
      throw AppError.internal("Failed to fetch emergency");
    }

    if (!data) {
      throw AppError.notFound("Emergency not found");
    }

    res.status(200).json({
      success: true,
      message: "Emergency returned successfully",
      data: {
        emergency: mapEmergency(data),
      },
    });
  },
);

emergenciesRouter.patch(
  "/:emergencyId/cancel",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<EmergencyResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const emergencyId = z.string().uuid().parse(req.params.emergencyId);

    const emergency = await updateOwnedActiveEmergencyStatus({
      emergencyId,
      requesterId: user.id,
      status: "cancelled",
    });

    res.status(200).json({
      success: true,
      message: "Emergency cancelled successfully",
      data: {
        emergency: mapEmergency(emergency),
      },
    });
  },
);

emergenciesRouter.patch(
  "/:emergencyId/resolve",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<EmergencyResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const emergencyId = z.string().uuid().parse(req.params.emergencyId);

    const emergency = await updateOwnedActiveEmergencyStatus({
      emergencyId,
      requesterId: user.id,
      status: "resolved",
    });

    res.status(200).json({
      success: true,
      message: "Emergency resolved successfully",
      data: {
        emergency: mapEmergency(emergency),
      },
    });
  },
);