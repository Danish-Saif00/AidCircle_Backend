import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { supabaseAdmin } from "../../lib/supabase.js";
import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type UserRole = "user" | "helper" | "admin";

type UsersModuleInfo = {
  module: "users";
  status: "active";
  plannedEndpoints: string[];
};

type UserProfile = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  isHelperAvailable: boolean;
  isBlocked: boolean;
  bloodGroup: string | null;
  medicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type PublicUserProfile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  isHelperAvailable: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
};

type UserProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
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

type PublicUserProfileResponse = {
  profile: PublicUserProfile;
};

type UserProfilesResponse = {
  profiles: UserProfile[];
};

type DeleteAccountResponse = {
  userId: string;
};

type UpdateUserProfilePayload = {
  full_name?: string;
  avatar_url?: string | null;
  is_helper_available?: boolean;
  blood_group?: string | null;
  medical_notes?: string | null;
};

type AdminUpdateUserPayload = {
  role?: UserRole;
  is_verified?: boolean;
  is_blocked?: boolean;
  is_helper_available?: boolean;
};

const userIdParamSchema = z.string().uuid();

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

const adminUpdateUserSchema = z
  .object({
    role: z.enum(["user", "helper", "admin"]).optional(),
    isVerified: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
    isHelperAvailable: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one admin user field is required",
  });

export const usersRouter = Router();

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

function mapPublicUserProfile(row: UserProfileRow): PublicUserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    isVerified: row.is_verified,
    isHelperAvailable: row.is_helper_available,
    isBlocked: row.is_blocked,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

function buildAdminUpdatePayload(
  input: z.infer<typeof adminUpdateUserSchema>,
): AdminUpdateUserPayload {
  const payload: AdminUpdateUserPayload = {};

  if (input.role !== undefined) {
    payload.role = input.role;
  }

  if (input.isVerified !== undefined) {
    payload.is_verified = input.isVerified;
  }

  if (input.isBlocked !== undefined) {
    payload.is_blocked = input.isBlocked;
  }

  if (input.isHelperAvailable !== undefined) {
    payload.is_helper_available = input.isHelperAvailable;
  }

  return payload;
}

async function getUserProfileOrThrow(userId: string): Promise<UserProfileRow> {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select(getUserProfileSelectColumns())
    .eq("id", userId)
    .maybeSingle<UserProfileRow>();

  if (error) {
    throw AppError.internal("Failed to fetch user profile");
  }

  if (!data) {
    throw AppError.notFound("User profile not found");
  }

  return data;
}

async function assertAdminUser(userId: string): Promise<void> {
  const profile = await getUserProfileOrThrow(userId);

  if (profile.role !== "admin") {
    throw AppError.forbidden("Admin access is required");
  }
}

usersRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<UsersModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Users module is available",
      data: {
        module: "users",
        status: "active",
        plannedEndpoints: [
          "GET /api/v1/users/me",
          "PATCH /api/v1/users/me",
          "DELETE /api/v1/users/me",
          "GET /api/v1/users/:userId",
          "GET /api/v1/users/admin",
          "PATCH /api/v1/users/admin/:userId",
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
    const profile = await getUserProfileOrThrow(user.id);

    res.status(200).json({
      success: true,
      message: "User profile returned successfully",
      data: {
        profile: mapUserProfile(profile),
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

usersRouter.delete(
  "/me",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<DeleteAccountResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
      throw AppError.internal("Failed to delete user account");
    }

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
      data: {
        userId: user.id,
      },
    });
  },
);

usersRouter.get(
  "/admin",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<UserProfilesResponse>>) => {
    const user = getAuthenticatedUser(req);

    await assertAdminUser(user.id);

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select(getUserProfileSelectColumns())
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<UserProfileRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch admin users");
    }

    res.status(200).json({
      success: true,
      message: "Admin users returned successfully",
      data: {
        profiles: data.map(mapUserProfile),
      },
    });
  },
);

usersRouter.patch(
  "/admin/:userId",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<UserProfileResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const targetUserId = userIdParamSchema.parse(req.params.userId);
    const parsedBody = adminUpdateUserSchema.parse(req.body);

    await assertAdminUser(user.id);

    if (targetUserId === user.id && parsedBody.isBlocked === true) {
      throw AppError.badRequest("Admin cannot block their own account");
    }

    const updatePayload = buildAdminUpdatePayload(parsedBody);

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update(updatePayload)
      .eq("id", targetUserId)
      .select(getUserProfileSelectColumns())
      .maybeSingle<UserProfileRow>();

    if (error) {
      throw AppError.internal("Failed to update user admin fields");
    }

    if (!data) {
      throw AppError.notFound("User profile not found");
    }

    if (parsedBody.role !== undefined) {
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        app_metadata: {
          role: parsedBody.role,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "User admin fields updated successfully",
      data: {
        profile: mapUserProfile(data),
      },
    });
  },
);

usersRouter.get(
  "/:userId",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<PublicUserProfileResponse>>,
  ) => {
    const userId = userIdParamSchema.parse(req.params.userId);
    const profile = await getUserProfileOrThrow(userId);

    res.status(200).json({
      success: true,
      message: "Public user profile returned successfully",
      data: {
        profile: mapPublicUserProfile(profile),
      },
    });
  },
);