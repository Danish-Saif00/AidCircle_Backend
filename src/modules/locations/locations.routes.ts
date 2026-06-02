import { Router, type Request, type Response } from "express";
import { z } from "zod";

import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type LocationsModuleInfo = {
  module: "locations";
  status: "scaffolded";
  plannedEndpoints: string[];
};

type UserLocation = {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  lastUpdatedAt: string;
  createdAt: string;
};

type UserLocationRow = {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  last_updated_at: string;
  created_at: string;
};

type UserLocationResponse = {
  location: UserLocation;
};

type UpsertUserLocationPayload = {
  user_id: string;
  latitude: number;
  longitude: number;
  last_updated_at: string;
  accuracy_meters?: number | null;
};

const upsertUserLocationSchema = z
  .object({
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
    accuracyMeters: z.number().positive().nullable().optional(),
  })
  .strict();

export const locationsRouter = Router();

function getUserLocationSelectColumns(): string {
  return [
    "id",
    "user_id",
    "latitude",
    "longitude",
    "accuracy_meters",
    "last_updated_at",
    "created_at",
  ].join(",");
}

function mapUserLocation(row: UserLocationRow): UserLocation {
  return {
    id: row.id,
    userId: row.user_id,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracyMeters: row.accuracy_meters,
    lastUpdatedAt: row.last_updated_at,
    createdAt: row.created_at,
  };
}

function buildUpsertLocationPayload(
  userId: string,
  input: z.infer<typeof upsertUserLocationSchema>,
): UpsertUserLocationPayload {
  const payload: UpsertUserLocationPayload = {
    user_id: userId,
    latitude: input.latitude,
    longitude: input.longitude,
    last_updated_at: new Date().toISOString(),
  };

  if (input.accuracyMeters !== undefined) {
    payload.accuracy_meters = input.accuracyMeters;
  }

  return payload;
}

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

locationsRouter.get(
  "/me",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<UserLocationResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);

    const { data, error } = await supabaseAdmin
      .from("user_locations")
      .select(getUserLocationSelectColumns())
      .eq("user_id", user.id)
      .maybeSingle<UserLocationRow>();

    if (error) {
      throw AppError.internal("Failed to fetch user location");
    }

    if (!data) {
      throw AppError.notFound("User location not found");
    }

    res.status(200).json({
      success: true,
      message: "User location returned successfully",
      data: {
        location: mapUserLocation(data),
      },
    });
  },
);

locationsRouter.post(
  "/me",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<UserLocationResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const parsedBody = upsertUserLocationSchema.parse(req.body);
    const locationPayload = buildUpsertLocationPayload(user.id, parsedBody);

    const { data, error } = await supabaseAdmin
      .from("user_locations")
      .upsert(locationPayload, {
        onConflict: "user_id",
      })
      .select(getUserLocationSelectColumns())
      .maybeSingle<UserLocationRow>();

    if (error) {
      throw AppError.internal("Failed to update user location");
    }

    if (!data) {
      throw AppError.internal("Updated user location was not returned");
    }

    res.status(200).json({
      success: true,
      message: "User location updated successfully",
      data: {
        location: mapUserLocation(data),
      },
    });
  },
);