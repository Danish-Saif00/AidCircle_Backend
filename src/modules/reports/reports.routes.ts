import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { supabaseAdmin } from "../../lib/supabase.js";
import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type ReportStatus = "pending" | "reviewed" | "dismissed" | "action_taken";

type UserRole = "user" | "helper" | "admin";

type ReportsModuleInfo = {
  module: "reports";
  status: "active";
  plannedEndpoints: string[];
};

type Report = {
  id: string;
  reporterId: string;
  emergencyId: string | null;
  reportedUserId: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

type ReportRow = {
  id: string;
  reporter_id: string;
  emergency_id: string | null;
  reported_user_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type UserProfileRoleRow = {
  id: string;
  role: UserRole;
};

type ReportResponse = {
  report: Report;
};

type ReportsResponse = {
  reports: Report[];
};

type CreateEmergencyReportPayload = {
  reporter_id: string;
  emergency_id: string;
  reason: string;
  description?: string | null;
};

type CreateUserReportPayload = {
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description?: string | null;
};

type UpdateReportStatusPayload = {
  status: ReportStatus;
  reviewed_by: string;
  reviewed_at: string;
};

const reportIdParamSchema = z.string().uuid();
const emergencyIdParamSchema = z.string().uuid();
const reportedUserIdParamSchema = z.string().uuid();

const createReportSchema = z
  .object({
    reason: z.string().trim().min(3).max(160),
    description: z.string().trim().max(1000).nullable().optional(),
  })
  .strict();

const updateReportStatusSchema = z
  .object({
    status: z.enum(["reviewed", "dismissed", "action_taken"]),
  })
  .strict();

export const reportsRouter = Router();

function getReportSelectColumns(): string {
  return [
    "id",
    "reporter_id",
    "emergency_id",
    "reported_user_id",
    "reason",
    "description",
    "status",
    "reviewed_by",
    "reviewed_at",
    "created_at",
  ].join(",");
}

function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    emergencyId: row.emergency_id,
    reportedUserId: row.reported_user_id,
    reason: row.reason,
    description: row.description,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

function buildEmergencyReportPayload(params: {
  reporterId: string;
  emergencyId: string;
  input: z.infer<typeof createReportSchema>;
}): CreateEmergencyReportPayload {
  const payload: CreateEmergencyReportPayload = {
    reporter_id: params.reporterId,
    emergency_id: params.emergencyId,
    reason: params.input.reason,
  };

  if (params.input.description !== undefined) {
    payload.description = params.input.description;
  }

  return payload;
}

function buildUserReportPayload(params: {
  reporterId: string;
  reportedUserId: string;
  input: z.infer<typeof createReportSchema>;
}): CreateUserReportPayload {
  const payload: CreateUserReportPayload = {
    reporter_id: params.reporterId,
    reported_user_id: params.reportedUserId,
    reason: params.input.reason,
  };

  if (params.input.description !== undefined) {
    payload.description = params.input.description;
  }

  return payload;
}

async function assertEmergencyExists(emergencyId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("emergencies")
    .select("id")
    .eq("id", emergencyId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw AppError.internal("Failed to validate emergency");
  }

  if (!data) {
    throw AppError.notFound("Emergency not found");
  }
}

async function assertUserExists(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw AppError.internal("Failed to validate reported user");
  }

  if (!data) {
    throw AppError.notFound("Reported user not found");
  }
}

async function assertAdminUser(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("id,role")
    .eq("id", userId)
    .maybeSingle<UserProfileRoleRow>();

  if (error) {
    throw AppError.internal("Failed to validate admin access");
  }

  if (!data || data.role !== "admin") {
    throw AppError.forbidden("Admin access is required");
  }
}

reportsRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<ReportsModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Reports module is available",
      data: {
        module: "reports",
        status: "active",
        plannedEndpoints: [
          "POST /api/v1/reports/emergencies/:emergencyId",
          "POST /api/v1/reports/users/:userId",
          "GET /api/v1/reports/me",
          "GET /api/v1/reports/admin",
          "PATCH /api/v1/reports/admin/:reportId/status",
        ],
      },
    });
  },
);

reportsRouter.post(
  "/emergencies/:emergencyId",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<ReportResponse>>) => {
    const user = getAuthenticatedUser(req);
    const emergencyId = emergencyIdParamSchema.parse(req.params.emergencyId);
    const parsedBody = createReportSchema.parse(req.body);

    await assertEmergencyExists(emergencyId);

    const reportPayload = buildEmergencyReportPayload({
      reporterId: user.id,
      emergencyId,
      input: parsedBody,
    });

    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert(reportPayload)
      .select(getReportSelectColumns())
      .maybeSingle<ReportRow>();

    if (error) {
      throw AppError.internal("Failed to create emergency report");
    }

    if (!data) {
      throw AppError.internal("Created emergency report was not returned");
    }

    res.status(201).json({
      success: true,
      message: "Emergency report created successfully",
      data: {
        report: mapReport(data),
      },
    });
  },
);

reportsRouter.post(
  "/users/:userId",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<ReportResponse>>) => {
    const user = getAuthenticatedUser(req);
    const reportedUserId = reportedUserIdParamSchema.parse(req.params.userId);
    const parsedBody = createReportSchema.parse(req.body);

    if (reportedUserId === user.id) {
      throw AppError.badRequest("You cannot report yourself");
    }

    await assertUserExists(reportedUserId);

    const reportPayload = buildUserReportPayload({
      reporterId: user.id,
      reportedUserId,
      input: parsedBody,
    });

    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert(reportPayload)
      .select(getReportSelectColumns())
      .maybeSingle<ReportRow>();

    if (error) {
      throw AppError.internal("Failed to create user report");
    }

    if (!data) {
      throw AppError.internal("Created user report was not returned");
    }

    res.status(201).json({
      success: true,
      message: "User report created successfully",
      data: {
        report: mapReport(data),
      },
    });
  },
);

reportsRouter.get(
  "/me",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<ReportsResponse>>) => {
    const user = getAuthenticatedUser(req);

    const { data, error } = await supabaseAdmin
      .from("reports")
      .select(getReportSelectColumns())
      .eq("reporter_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<ReportRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch my reports");
    }

    res.status(200).json({
      success: true,
      message: "My reports returned successfully",
      data: {
        reports: data.map(mapReport),
      },
    });
  },
);

reportsRouter.get(
  "/admin",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<ReportsResponse>>) => {
    const user = getAuthenticatedUser(req);

    await assertAdminUser(user.id);

    const { data, error } = await supabaseAdmin
      .from("reports")
      .select(getReportSelectColumns())
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<ReportRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch admin reports");
    }

    res.status(200).json({
      success: true,
      message: "Admin reports returned successfully",
      data: {
        reports: data.map(mapReport),
      },
    });
  },
);

reportsRouter.patch(
  "/admin/:reportId/status",
  authMiddleware,
  async (req: Request, res: Response<ApiSuccessResponse<ReportResponse>>) => {
    const user = getAuthenticatedUser(req);
    const reportId = reportIdParamSchema.parse(req.params.reportId);
    const parsedBody = updateReportStatusSchema.parse(req.body);

    await assertAdminUser(user.id);

    const updatePayload: UpdateReportStatusPayload = {
      status: parsedBody.status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("reports")
      .update(updatePayload)
      .eq("id", reportId)
      .select(getReportSelectColumns())
      .maybeSingle<ReportRow>();

    if (error) {
      throw AppError.internal("Failed to update report status");
    }

    if (!data) {
      throw AppError.notFound("Report not found");
    }

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: {
        report: mapReport(data),
      },
    });
  },
);