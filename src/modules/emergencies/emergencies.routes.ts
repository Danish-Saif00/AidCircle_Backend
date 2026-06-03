import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { env } from "../../config/env.js";
import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

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

type EmergencyPriority = "low" | "medium" | "high" | "critical";

type EmergencyStatus = "active" | "resolved" | "cancelled" | "expired";

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