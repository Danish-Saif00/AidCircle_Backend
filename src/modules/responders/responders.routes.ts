import { Router, type Request, type Response } from "express";
import { z } from "zod";

import {
  authMiddleware,
  getAuthenticatedUser,
} from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error.middleware.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import type { ApiSuccessResponse } from "../../types/api.types.js";

type ResponderStatus = "accepted" | "on_way" | "arrived" | "cancelled";

type EmergencyStatus = "active" | "resolved" | "cancelled" | "expired";

type EmergencyRow = {
  id: string;
  requester_id: string;
  status: EmergencyStatus;
};

type EmergencyResponder = {
  id: string;
  emergencyId: string;
  responderId: string;
  status: ResponderStatus;
  acceptedAt: string;
  updatedAt: string;
};

type EmergencyResponderRow = {
  id: string;
  emergency_id: string;
  responder_id: string;
  status: ResponderStatus;
  accepted_at: string;
  updated_at: string;
};

type ResponderResponse = {
  responder: EmergencyResponder;
};

type RespondersResponse = {
  responders: EmergencyResponder[];
};

type RespondersModuleInfo = {
  module: "responders";
  status: "active";
  plannedEndpoints: string[];
};

const emergencyIdParamSchema = z.string().uuid();

const updateResponderStatusSchema = z
  .object({
    status: z.enum(["on_way", "arrived", "cancelled"]),
  })
  .strict();

export const respondersRouter = Router();

function getEmergencyResponderSelectColumns(): string {
  return [
    "id",
    "emergency_id",
    "responder_id",
    "status",
    "accepted_at",
    "updated_at",
  ].join(",");
}

function mapEmergencyResponder(
  row: EmergencyResponderRow,
): EmergencyResponder {
  return {
    id: row.id,
    emergencyId: row.emergency_id,
    responderId: row.responder_id,
    status: row.status,
    acceptedAt: row.accepted_at,
    updatedAt: row.updated_at,
  };
}

async function getActiveEmergencyOrThrow(
  emergencyId: string,
): Promise<EmergencyRow> {
  const { data, error } = await supabaseAdmin
    .from("emergencies")
    .select("id,requester_id,status")
    .eq("id", emergencyId)
    .maybeSingle<EmergencyRow>();

  if (error) {
    throw AppError.internal("Failed to validate emergency");
  }

  if (!data) {
    throw AppError.notFound("Emergency not found");
  }

  if (data.status !== "active") {
    throw AppError.badRequest("Only active emergencies can be responded to");
  }

  return data;
}

respondersRouter.get(
  "/",
  (_req: Request, res: Response<ApiSuccessResponse<RespondersModuleInfo>>) => {
    res.status(200).json({
      success: true,
      message: "Responders module is available",
      data: {
        module: "responders",
        status: "active",
        plannedEndpoints: [
          "POST /api/v1/responders/emergencies/:emergencyId/accept",
          "PATCH /api/v1/responders/emergencies/:emergencyId/status",
          "DELETE /api/v1/responders/emergencies/:emergencyId/leave",
          "GET /api/v1/responders/me/active",
          "GET /api/v1/responders/me/history",
        ],
      },
    });
  },
);

respondersRouter.post(
  "/emergencies/:emergencyId/accept",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<ResponderResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const emergencyId = emergencyIdParamSchema.parse(req.params.emergencyId);

    const emergency = await getActiveEmergencyOrThrow(emergencyId);

    if (emergency.requester_id === user.id) {
      throw AppError.badRequest("Requester cannot accept their own emergency");
    }

    const { data: existingResponder, error: existingResponderError } =
      await supabaseAdmin
        .from("emergency_responders")
        .select(getEmergencyResponderSelectColumns())
        .eq("emergency_id", emergencyId)
        .eq("responder_id", user.id)
        .maybeSingle<EmergencyResponderRow>();

    if (existingResponderError) {
      throw AppError.internal("Failed to check existing responder status");
    }

    if (existingResponder && existingResponder.status !== "cancelled") {
      throw AppError.conflict("You have already accepted this emergency");
    }

    if (existingResponder && existingResponder.status === "cancelled") {
      const { data, error } = await supabaseAdmin
        .from("emergency_responders")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", existingResponder.id)
        .select(getEmergencyResponderSelectColumns())
        .maybeSingle<EmergencyResponderRow>();

      if (error) {
        throw AppError.internal("Failed to accept emergency");
      }

      if (!data) {
        throw AppError.internal("Accepted responder record was not returned");
      }

      res.status(200).json({
        success: true,
        message: "Emergency accepted successfully",
        data: {
          responder: mapEmergencyResponder(data),
        },
      });

      return;
    }

    const { data, error } = await supabaseAdmin
      .from("emergency_responders")
      .insert({
        emergency_id: emergencyId,
        responder_id: user.id,
        status: "accepted",
      })
      .select(getEmergencyResponderSelectColumns())
      .maybeSingle<EmergencyResponderRow>();

    if (error) {
      throw AppError.internal("Failed to accept emergency");
    }

    if (!data) {
      throw AppError.internal("Accepted responder record was not returned");
    }

    res.status(201).json({
      success: true,
      message: "Emergency accepted successfully",
      data: {
        responder: mapEmergencyResponder(data),
      },
    });
  },
);

respondersRouter.patch(
  "/emergencies/:emergencyId/status",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<ResponderResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const emergencyId = emergencyIdParamSchema.parse(req.params.emergencyId);
    const parsedBody = updateResponderStatusSchema.parse(req.body);

    await getActiveEmergencyOrThrow(emergencyId);

    const { data, error } = await supabaseAdmin
      .from("emergency_responders")
      .update({
        status: parsedBody.status,
      })
      .eq("emergency_id", emergencyId)
      .eq("responder_id", user.id)
      .neq("status", "cancelled")
      .select(getEmergencyResponderSelectColumns())
      .maybeSingle<EmergencyResponderRow>();

    if (error) {
      throw AppError.internal("Failed to update responder status");
    }

    if (!data) {
      throw AppError.notFound(
        "Active responder record not found for this emergency",
      );
    }

    res.status(200).json({
      success: true,
      message: "Responder status updated successfully",
      data: {
        responder: mapEmergencyResponder(data),
      },
    });
  },
);

respondersRouter.delete(
  "/emergencies/:emergencyId/leave",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<ResponderResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);
    const emergencyId = emergencyIdParamSchema.parse(req.params.emergencyId);

    const { data, error } = await supabaseAdmin
      .from("emergency_responders")
      .update({
        status: "cancelled",
      })
      .eq("emergency_id", emergencyId)
      .eq("responder_id", user.id)
      .neq("status", "cancelled")
      .select(getEmergencyResponderSelectColumns())
      .maybeSingle<EmergencyResponderRow>();

    if (error) {
      throw AppError.internal("Failed to leave emergency response");
    }

    if (!data) {
      throw AppError.notFound(
        "Active responder record not found for this emergency",
      );
    }

    res.status(200).json({
      success: true,
      message: "Responder left emergency successfully",
      data: {
        responder: mapEmergencyResponder(data),
      },
    });
  },
);

respondersRouter.get(
  "/me/active",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<RespondersResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);

    const { data, error } = await supabaseAdmin
      .from("emergency_responders")
      .select(getEmergencyResponderSelectColumns())
      .eq("responder_id", user.id)
      .in("status", ["accepted", "on_way", "arrived"])
      .order("accepted_at", { ascending: false })
      .returns<EmergencyResponderRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch active responder records");
    }

    res.status(200).json({
      success: true,
      message: "Active responder records returned successfully",
      data: {
        responders: data.map(mapEmergencyResponder),
      },
    });
  },
);

respondersRouter.get(
  "/me/history",
  authMiddleware,
  async (
    req: Request,
    res: Response<ApiSuccessResponse<RespondersResponse>>,
  ) => {
    const user = getAuthenticatedUser(req);

    const { data, error } = await supabaseAdmin
      .from("emergency_responders")
      .select(getEmergencyResponderSelectColumns())
      .eq("responder_id", user.id)
      .order("accepted_at", { ascending: false })
      .limit(100)
      .returns<EmergencyResponderRow[]>();

    if (error) {
      throw AppError.internal("Failed to fetch responder history");
    }

    res.status(200).json({
      success: true,
      message: "Responder history returned successfully",
      data: {
        responders: data.map(mapEmergencyResponder),
      },
    });
  },
);