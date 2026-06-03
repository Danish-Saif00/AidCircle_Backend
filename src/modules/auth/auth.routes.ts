import type { Session, User } from "@supabase/supabase-js";
import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { supabaseAdmin, supabaseAnon } from "../../lib/supabase.js";
import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type AuthModuleInfo = {
  module: "auth";
  status: "active";
  plannedEndpoints: string[];
};

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number | null;
};

type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  role: string | null;
};

type AuthUserProfile = {
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

type CreateUserProfilePayload = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "user";
  is_helper_available: true;
};

type AuthResponse = {
  user: AuthUser;
  profile: AuthUserProfile;
  session: AuthSession;
};

type AuthMeResponse = {
  user: AuthUser;
  profile: AuthUserProfile;
};

type AuthLogoutResponse = {
  userId: string;
};

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z
      .string()
      .trim()
      .email()
      .transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(72),
    phone: z.string().trim().min(5).max(30).nullable().optional(),
  })
  .strict();

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(72),
  })
  .strict();

const refreshSchema = z
  .object({
    refreshToken: z.string().trim().min(10),
  })
  .strict();

export const authRouter = Router();

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

function mapAuthUser(user: User): AuthUser {
  const role = user.app_metadata?.role;

  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    role: typeof role === "string" ? role : null,
  };
}

function mapAuthSession(session: Session): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    tokenType: session.token_type,
    expiresIn: session.expires_in,
    expiresAt: session.expires_at ?? null,
  };
}

function mapUserProfile(row: UserProfileRow): AuthUserProfile {
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

function extractBearerToken(req: Request): string {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw AppError.unauthorized("Authorization header is required");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw AppError.unauthorized(
      "Authorization header must use Bearer token format",
    );
  }

  return token;
}

function buildCreateUserProfilePayload(params: {
  userId: string;
  fullName: string;
  email: string;
  phone?: string | null;
}): CreateUserProfilePayload {
  return {
    id: params.userId,
    full_name: params.fullName,
    email: params.email,
    phone: params.phone ?? null,
    role: "user",
    is_helper_available: true,
  };
}

function isDuplicateAuthUserError(errorMessage: string): boolean {
  const normalizedMessage = errorMessage.toLowerCase();

  return (
    normalizedMessage.includes("already") ||
    normalizedMessage.includes("registered") ||
    normalizedMessage.includes("exists")
  );
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

async function createUserProfileOrRollback(params: {
  userId: string;
  fullName: string;
  email: string;
  phone?: string | null;
}): Promise<UserProfileRow> {
  const profilePayload = buildCreateUserProfilePayload(params);

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .upsert(profilePayload, {
      onConflict: "id",
    })
    .select(getUserProfileSelectColumns())
    .maybeSingle<UserProfileRow>();

  if (error || !data) {
    await supabaseAdmin.auth.admin.deleteUser(params.userId);

    throw AppError.internal("Failed to create user profile");
  }

  return data;
}

function assertUserIsAllowed(profile: UserProfileRow): void {
  if (profile.is_blocked) {
    throw AppError.forbidden("User account is blocked");
  }
}

async function buildAuthResponse(params: {
  user: User;
  session: Session;
}): Promise<AuthResponse> {
  const profile = await getUserProfileOrThrow(params.user.id);

  assertUserIsAllowed(profile);

  return {
    user: mapAuthUser(params.user),
    profile: mapUserProfile(profile),
    session: mapAuthSession(params.session),
  };
}

authRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<AuthModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Auth module is available",
      data: {
        module: "auth",
        status: "active",
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

authRouter.post(
  "/signup",
  async (req: Request, res: Response<ApiSuccessResponse<AuthResponse>>) => {
    const parsedBody = signupSchema.parse(req.body);

    const { data: createdUserData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: parsedBody.email,
        password: parsedBody.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsedBody.fullName,
        },
        app_metadata: {
          role: "user",
        },
      });

    if (createUserError || !createdUserData.user) {
      if (
        createUserError &&
        isDuplicateAuthUserError(createUserError.message)
      ) {
        throw AppError.conflict("Email is already registered");
      }

      throw AppError.internal("Failed to create auth user");
    }

    const createProfileParams: {
      userId: string;
      fullName: string;
      email: string;
      phone?: string | null;
    } = {
      userId: createdUserData.user.id,
      fullName: parsedBody.fullName,
      email: parsedBody.email,
    };

    if (parsedBody.phone !== undefined) {
      createProfileParams.phone = parsedBody.phone;
    }

    await createUserProfileOrRollback(createProfileParams);

    const { data: loginData, error: loginError } =
      await supabaseAnon.auth.signInWithPassword({
        email: parsedBody.email,
        password: parsedBody.password,
      });

    if (loginError || !loginData.user || !loginData.session) {
      throw AppError.internal("User created but automatic login failed");
    }

    const authResponse = await buildAuthResponse({
      user: loginData.user,
      session: loginData.session,
    });

    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      data: authResponse,
    });
  },
);

authRouter.post(
  "/login",
  async (req: Request, res: Response<ApiSuccessResponse<AuthResponse>>) => {
    const parsedBody = loginSchema.parse(req.body);

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: parsedBody.email,
      password: parsedBody.password,
    });

    if (error || !data.user || !data.session) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const authResponse = await buildAuthResponse({
      user: data.user,
      session: data.session,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: authResponse,
    });
  },
);

authRouter.post(
  "/refresh",
  async (req: Request, res: Response<ApiSuccessResponse<AuthResponse>>) => {
    const parsedBody = refreshSchema.parse(req.body);

    const { data, error } = await supabaseAnon.auth.refreshSession({
      refresh_token: parsedBody.refreshToken,
    });

    if (error || !data.user || !data.session) {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    const authResponse = await buildAuthResponse({
      user: data.user,
      session: data.session,
    });

    res.status(200).json({
      success: true,
      message: "Session refreshed successfully",
      data: authResponse,
    });
  },
);

authRouter.post(
  "/logout",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<AuthLogoutResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const token = extractBearerToken(req);

    const { error } = await supabaseAdmin.auth.admin.signOut(token, "global");

    if (error) {
      throw AppError.internal("Failed to log out user");
    }

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
      data: {
        userId: user.id,
      },
    });
  },
);

authRouter.get(
  "/me",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<AuthMeResponse>>) => {
    const user = getAuthenticatedUser(req);
    const profile = await getUserProfileOrThrow(user.id);

    assertUserIsAllowed(profile);

    res.status(200).json({
      success: true,
      message: "Authenticated user returned successfully",
      data: {
        user: {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
          role: user.role ?? null,
        },
        profile: mapUserProfile(profile),
      },
    });
  },
);