import { Router, type Request, type Response } from "express";
import { z } from "zod";

import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type UsersModuleInfo = {
  module: "users";
  status: "scaffolded";
  plannedEndpoints: string[];
};

type UserProfile = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  isHelperAvailable: boolean;
  isBlocked: boolean;
  bloodGroup: string | null;
  medicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
  is_helper_available: boolean;
  is_blocked: boolean;
  blood_group: string | null;
  medical_notes: string | null;
  created_at: string;
  updated_at: string;
};

type UserProfileResponse = {
  profile: UserProfile;
};

type UpdateUserProfilePayload = {
  full_name?: string;
  avatar_url?: string | null;
  is_helper_available?: boolean;
  blood_group?: string | null;
  medical_notes?: string | null;
};

const updateUserProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    avatarUrl: z.string().trim().url().nullable().optional(),
    isHelperAvailable: z.boolean().optional(),
    bloodGroup: z.string().trim().min(1).max(10).nullable().optional(),
    medicalNotes: z.string().trim().max(500).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required",
  });

export const usersRouter = Router();

function mapUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    avatarUrl: row.avatar_url,
    role: row.role,
    isVerified: row.is_verified,
    isHelperAvailable: row.is_helper_available,
    isBlocked: row.is_blocked,
    bloodGroup: row.blood_group,
    medicalNotes: row.medical_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getUserProfileSelectColumns(): string {
  return [
    "id",
    "full_name",
    "phone",
    "email",
    "avatar_url",
    "role",
    "is_verified",
    "is_helper_available",
    "is_blocked",
    "blood_group",
    "medical_notes",
    "created_at",
    "updated_at",
  ].join(",");
}

function buildUpdatePayload(
  input: z.infer<typeof updateUserProfileSchema>,
): UpdateUserProfilePayload {
  const payload: UpdateUserProfilePayload = {};

  if (input.fullName !== undefined) {
    payload.full_name = input.fullName;
  }

  if (input.avatarUrl !== undefined) {
    payload.avatar_url = input.avatarUrl;
  }

  if (input.isHelperAvailable !== undefined) {
    payload.is_helper_available = input.isHelperAvailable;
  }

  if (input.bloodGroup !== undefined) {
    payload.blood_group = input.bloodGroup;
  }

  if (input.medicalNotes !== undefined) {
    payload.medical_notes = input.medicalNotes;
  }

  return payload;
}

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

usersRouter.get(
  "/me",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<UserProfileResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select(getUserProfileSelectColumns())
      .eq("id", user.id)
      .maybeSingle<UserProfileRow>();

    if (error) {
      throw AppError.internal("Failed to fetch user profile");
    }

    if (!data) {
      throw AppError.notFound("User profile not found");
    }

    res.status(200).json({
      success: true,
      message: "User profile returned successfully",
      data: {
        profile: mapUserProfile(data),
      },
    });
  },
);

usersRouter.patch(
  "/me",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<UserProfileResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const parsedBody = updateUserProfileSchema.parse(req.body);
    const updatePayload = buildUpdatePayload(parsedBody);

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select(getUserProfileSelectColumns())
      .maybeSingle<UserProfileRow>();

    if (error) {
      throw AppError.internal("Failed to update user profile");
    }

    if (!data) {
      throw AppError.notFound("User profile not found");
    }

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: {
        profile: mapUserProfile(data),
      },
    });
  },
);