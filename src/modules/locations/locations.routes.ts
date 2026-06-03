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
  status: "active";
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

type NearbyUser = {
  userId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  isHelperAvailable: boolean;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  lastUpdatedAt: string;
  distanceMeters: number;
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

type NearbyEmergency = {
  id: string;
  requesterId: string;
  categoryId: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radiusKm: number;
  status: string;
  priority: string;
  resolvedAt: string | null;
  cancelledAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  distanceMeters: number;
};

type NearbyEmergencyRow = {
  emergency_id: string;
  requester_id: string;
  category_id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radius_km: number;
  status: string;
  priority: string;
  resolved_at: string | null;
  cancelled_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  distance_meters: number;
};

type UserLocationResponse = {
  location: UserLocation;
};

type NearbyUsersResponse = {
  users: NearbyUser[];
};

type NearbyEmergenciesResponse = {
  emergencies: NearbyEmergency[];
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

const nearbyQuerySchema = z
  .object({
    latitude: z.coerce.number().gte(-90).lte(90),
    longitude: z.coerce.number().gte(-180).lte(180),
    radiusKm: z.coerce.number().positive().max(50).optional(),
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

function mapNearbyUser(row: NearbyUserRow): NearbyUser {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    avatarUrl: row.avatar_url,
    role: row.role,
    isVerified: row.is_verified,
    isHelperAvailable: row.is_helper_available,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracyMeters: row.accuracy_meters,
    lastUpdatedAt: row.last_updated_at,
    distanceMeters: row.distance_meters,
  };
}

function mapNearbyEmergency(row: NearbyEmergencyRow): NearbyEmergency {
  return {
    id: row.emergency_id,
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
    distanceMeters: row.distance_meters,
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
        status: "active",
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

locationsRouter.get(
  "/nearby-users",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<NearbyUsersResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const parsedQuery = nearbyQuerySchema.parse(req.query);

    const { data, error } = await supabaseAdmin.rpc("find_nearby_users", {
      origin_latitude: parsedQuery.latitude,
      origin_longitude: parsedQuery.longitude,
      radius_km: parsedQuery.radiusKm ?? 5,
      excluded_user_id: user.id,
    });

    if (error) {
      throw AppError.internal("Failed to fetch nearby users");
    }

    const nearbyUsers = (data ?? []) as unknown as NearbyUserRow[];

    res.status(200).json({
      success: true,
      message: "Nearby users returned successfully",
      data: {
        users: nearbyUsers.map(mapNearbyUser),
      },
    });
  },
);

locationsRouter.get(
  "/nearby-emergencies",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<NearbyEmergenciesResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const parsedQuery = nearbyQuerySchema.parse(req.query);

    const { data, error } = await supabaseAdmin.rpc(
      "find_nearby_active_emergencies",
      {
        origin_latitude: parsedQuery.latitude,
        origin_longitude: parsedQuery.longitude,
        radius_km: parsedQuery.radiusKm ?? 5,
        excluded_requester_id: user.id,
      },
    );

    if (error) {
      throw AppError.internal("Failed to fetch nearby emergencies");
    }

    const nearbyEmergencies = (data ?? []) as unknown as NearbyEmergencyRow[];

    res.status(200).json({
      success: true,
      message: "Nearby emergencies returned successfully",
      data: {
        emergencies: nearbyEmergencies.map(mapNearbyEmergency),
      },
    });
  },
);