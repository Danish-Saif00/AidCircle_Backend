export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "AidCircle API",
    version: "1.0.0",
    description:
      "Backend API for AidCircle SOS and nearby emergency response mobile app.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "System",
      description: "System health and API metadata endpoints.",
    },
    {
      name: "Auth",
      description: "Authentication and session endpoints.",
    },
    {
      name: "Users",
      description: "User profile and account endpoints.",
    },
    {
      name: "Locations",
      description: "User location and nearby lookup endpoints.",
    },
    {
      name: "Emergencies",
      description: "SOS emergency creation, status, and history endpoints.",
    },
    {
      name: "Responders",
      description: "Emergency responder acceptance and status endpoints.",
    },
    {
      name: "Notifications",
      description: "Device token and push notification endpoints.",
    },
    {
      name: "Reports",
      description: "Fake SOS, abuse, and safety report endpoints.",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Check backend health",
        description: "Returns basic runtime status for the AidCircle backend.",
        responses: {
          "200": {
            description: "Backend is running.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1": {
      get: {
        tags: ["System"],
        summary: "Get API metadata",
        description:
          "Returns API version, module list, and documentation endpoints.",
        responses: {
          "200": {
            description: "API metadata returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiRootResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/auth": {
      get: {
        tags: ["Auth"],
        summary: "Get Auth module status",
        description:
          "Temporary scaffold endpoint that confirms the Auth module is mounted.",
        responses: {
          "200": {
            description: "Auth module status returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthModuleStatusResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get authenticated user",
        description:
          "Returns the currently authenticated user from the provided Supabase bearer token.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Authenticated user returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthMeResponse",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, or expired authentication token.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get Users module status",
        description:
          "Temporary scaffold endpoint that confirms the Users module is mounted.",
        responses: {
          "200": {
            description: "Users module status returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UsersModuleStatusResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get my user profile",
        description:
          "Returns the authenticated user's AidCircle profile from the user_profiles table.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "User profile returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserProfileResponse",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, or expired authentication token.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "404": {
            description: "User profile not found.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to fetch user profile.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
        },
      },

      patch: {
        tags: ["Users"],
        summary: "Update my user profile",
        description:
          "Updates allowed editable profile fields for the authenticated user.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateUserProfileRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User profile updated successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserProfileResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, or expired authentication token.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "404": {
            description: "User profile not found.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to update user profile.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/locations": {
      get: {
        tags: ["Locations"],
        summary: "Get Locations module status",
        description:
          "Temporary scaffold endpoint that confirms the Locations module is mounted.",
        responses: {
          "200": {
            description: "Locations module status returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LocationsModuleStatusResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/locations/me": {
      get: {
        tags: ["Locations"],
        summary: "Get my current location",
        description:
          "Returns the authenticated user's last known location from the user_locations table.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "User location returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserLocationResponse",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, or expired authentication token.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "404": {
            description: "User location not found.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to fetch user location.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["Locations"],
        summary: "Create or update my current location",
        description:
          "Creates or updates the authenticated user's last known location. The database trigger builds the PostGIS location_point automatically.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpsertUserLocationRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User location updated successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserLocationResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, or expired authentication token.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to update user location.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/emergencies": {
      get: {
        tags: ["Emergencies"],
        summary: "Get Emergencies module status",
        description:
          "Temporary scaffold endpoint that confirms the Emergencies module is mounted.",
        responses: {
          "200": {
            description: "Emergencies module status returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmergenciesModuleStatusResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/responders": {
      get: {
        tags: ["Responders"],
        summary: "Get Responders module status",
        description:
          "Temporary scaffold endpoint that confirms the Responders module is mounted.",
        responses: {
          "200": {
            description: "Responders module status returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RespondersModuleStatusResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get Notifications module status",
        description:
          "Temporary scaffold endpoint that confirms the Notifications module is mounted.",
        responses: {
          "200": {
            description: "Notifications module status returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NotificationsModuleStatusResponse",
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/reports": {
      get: {
        tags: ["Reports"],
        summary: "Get Reports module status",
        description:
          "Temporary scaffold endpoint that confirms the Reports module is mounted.",
        responses: {
          "200": {
            description: "Reports module status returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReportsModuleStatusResponse",
                },
              },
            },
          },
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Bearer token issued by the authentication provider and sent as Authorization: Bearer <token>.",
      },
    },

    schemas: {
      ApiErrorDetail: {
        type: "object",
        properties: {
          field: {
            type: "string",
            example: "email",
          },
          message: {
            type: "string",
            example: "Invalid email address",
          },
          code: {
            type: "string",
            example: "invalid_format",
          },
        },
        required: ["message"],
      },

      ApiErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Validation failed",
          },
          error: {
            type: "object",
            properties: {
              code: {
                type: "string",
                example: "BAD_REQUEST",
              },
              details: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/ApiErrorDetail",
                },
              },
            },
            required: ["code"],
          },
        },
        required: ["success", "message", "error"],
      },

      HealthResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "AidCircle backend is running",
          },
          environment: {
            type: "string",
            example: "development",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2026-06-01T13:24:56.743Z",
          },
        },
        required: ["success", "message", "environment", "timestamp"],
      },

      ApiRootResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "AidCircle API v1",
          },
          data: {
            type: "object",
            properties: {
              service: {
                type: "string",
                example: "AidCircle Emergency Response API",
              },
              version: {
                type: "string",
                example: "1.0.0",
              },
              modules: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "auth",
                  "users",
                  "locations",
                  "emergencies",
                  "responders",
                  "notifications",
                  "reports",
                ],
              },
              documentation: {
                type: "object",
                properties: {
                  swagger: {
                    type: "string",
                    example: "/api-docs",
                  },
                  openApiJson: {
                    type: "string",
                    example: "/api-docs.json",
                  },
                },
                required: ["swagger", "openApiJson"],
              },
            },
            required: ["service", "version", "modules", "documentation"],
          },
        },
        required: ["success", "message", "data"],
      },

      AuthModuleStatusResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Auth module is available",
          },
          data: {
            type: "object",
            properties: {
              module: {
                type: "string",
                example: "auth",
              },
              status: {
                type: "string",
                example: "scaffolded",
              },
              plannedEndpoints: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "POST /api/v1/auth/signup",
                  "POST /api/v1/auth/login",
                  "POST /api/v1/auth/logout",
                  "POST /api/v1/auth/refresh",
                  "GET /api/v1/auth/me",
                ],
              },
            },
            required: ["module", "status", "plannedEndpoints"],
          },
        },
        required: ["success", "message", "data"],
      },

      AuthUser: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          phone: {
            type: "string",
            example: "+923001234567",
          },
          role: {
            type: "string",
            example: "user",
          },
        },
        required: ["id"],
      },

      AuthMeResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Authenticated user returned successfully",
          },
          data: {
            type: "object",
            properties: {
              user: {
                $ref: "#/components/schemas/AuthUser",
              },
            },
            required: ["user"],
          },
        },
        required: ["success", "message", "data"],
      },

      UsersModuleStatusResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Users module is available",
          },
          data: {
            type: "object",
            properties: {
              module: {
                type: "string",
                example: "users",
              },
              status: {
                type: "string",
                example: "scaffolded",
              },
              plannedEndpoints: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "GET /api/v1/users/me",
                  "PATCH /api/v1/users/me",
                  "DELETE /api/v1/users/me",
                  "GET /api/v1/users/:userId",
                ],
              },
            },
            required: ["module", "status", "plannedEndpoints"],
          },
        },
        required: ["success", "message", "data"],
      },

      UserProfile: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          fullName: {
            type: "string",
            example: "Ahmad Sajid",
          },
          phone: {
            type: "string",
            nullable: true,
            example: "+923001234567",
          },
          email: {
            type: "string",
            format: "email",
            nullable: true,
            example: "user@example.com",
          },
          avatarUrl: {
            type: "string",
            nullable: true,
            example: "https://example.com/avatar.png",
          },
          role: {
            type: "string",
            example: "user",
          },
          isVerified: {
            type: "boolean",
            example: false,
          },
          isHelperAvailable: {
            type: "boolean",
            example: true,
          },
          isBlocked: {
            type: "boolean",
            example: false,
          },
          bloodGroup: {
            type: "string",
            nullable: true,
            example: "O+",
          },
          medicalNotes: {
            type: "string",
            nullable: true,
            example: "No known allergies",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
        required: [
          "id",
          "fullName",
          "phone",
          "email",
          "avatarUrl",
          "role",
          "isVerified",
          "isHelperAvailable",
          "isBlocked",
          "bloodGroup",
          "medicalNotes",
          "createdAt",
          "updatedAt",
        ],
      },

      UpdateUserProfileRequest: {
        type: "object",
        properties: {
          fullName: {
            type: "string",
            minLength: 2,
            maxLength: 120,
            example: "Ahmad Sajid",
          },
          avatarUrl: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://example.com/avatar.png",
          },
          isHelperAvailable: {
            type: "boolean",
            example: true,
          },
          bloodGroup: {
            type: "string",
            nullable: true,
            minLength: 1,
            maxLength: 10,
            example: "O+",
          },
          medicalNotes: {
            type: "string",
            nullable: true,
            maxLength: 500,
            example: "No known allergies",
          },
        },
        additionalProperties: false,
        minProperties: 1,
      },

      UserProfileResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "User profile returned successfully",
          },
          data: {
            type: "object",
            properties: {
              profile: {
                $ref: "#/components/schemas/UserProfile",
              },
            },
            required: ["profile"],
          },
        },
        required: ["success", "message", "data"],
      },

      LocationsModuleStatusResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Locations module is available",
          },
          data: {
            type: "object",
            properties: {
              module: {
                type: "string",
                example: "locations",
              },
              status: {
                type: "string",
                example: "scaffolded",
              },
              plannedEndpoints: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "POST /api/v1/locations/me",
                  "GET /api/v1/locations/me",
                  "GET /api/v1/locations/nearby-users",
                  "GET /api/v1/locations/nearby-emergencies",
                ],
              },
            },
            required: ["module", "status", "plannedEndpoints"],
          },
        },
        required: ["success", "message", "data"],
      },

      UpsertUserLocationRequest: {
        type: "object",
        properties: {
          latitude: {
            type: "number",
            minimum: -90,
            maximum: 90,
            example: 31.5204,
          },
          longitude: {
            type: "number",
            minimum: -180,
            maximum: 180,
            example: 74.3587,
          },
          accuracyMeters: {
            type: "number",
            nullable: true,
            example: 12,
          },
        },
        required: ["latitude", "longitude"],
        additionalProperties: false,
      },

      UserLocation: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "e33f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          userId: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          latitude: {
            type: "number",
            example: 31.5204,
          },
          longitude: {
            type: "number",
            example: 74.3587,
          },
          accuracyMeters: {
            type: "number",
            nullable: true,
            example: 12,
          },
          lastUpdatedAt: {
            type: "string",
            format: "date-time",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
        required: [
          "id",
          "userId",
          "latitude",
          "longitude",
          "accuracyMeters",
          "lastUpdatedAt",
          "createdAt",
        ],
      },

      UserLocationResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "User location returned successfully",
          },
          data: {
            type: "object",
            properties: {
              location: {
                $ref: "#/components/schemas/UserLocation",
              },
            },
            required: ["location"],
          },
        },
        required: ["success", "message", "data"],
      },

      EmergenciesModuleStatusResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Emergencies module is available",
          },
          data: {
            type: "object",
            properties: {
              module: {
                type: "string",
                example: "emergencies",
              },
              status: {
                type: "string",
                example: "scaffolded",
              },
              plannedEndpoints: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "POST /api/v1/emergencies",
                  "GET /api/v1/emergencies",
                  "GET /api/v1/emergencies/:emergencyId",
                  "PATCH /api/v1/emergencies/:emergencyId/cancel",
                  "PATCH /api/v1/emergencies/:emergencyId/resolve",
                  "GET /api/v1/emergencies/me/history",
                ],
              },
            },
            required: ["module", "status", "plannedEndpoints"],
          },
        },
        required: ["success", "message", "data"],
      },

      RespondersModuleStatusResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Responders module is available",
          },
          data: {
            type: "object",
            properties: {
              module: {
                type: "string",
                example: "responders",
              },
              status: {
                type: "string",
                example: "scaffolded",
              },
              plannedEndpoints: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "POST /api/v1/responders/emergencies/:emergencyId/accept",
                  "PATCH /api/v1/responders/emergencies/:emergencyId/status",
                  "DELETE /api/v1/responders/emergencies/:emergencyId/leave",
                  "GET /api/v1/responders/me/active",
                  "GET /api/v1/responders/me/history",
                ],
              },
            },
            required: ["module", "status", "plannedEndpoints"],
          },
        },
        required: ["success", "message", "data"],
      },

      NotificationsModuleStatusResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Notifications module is available",
          },
          data: {
            type: "object",
            properties: {
              module: {
                type: "string",
                example: "notifications",
              },
              status: {
                type: "string",
                example: "scaffolded",
              },
              plannedEndpoints: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "POST /api/v1/notifications/devices",
                  "DELETE /api/v1/notifications/devices/:deviceId",
                  "GET /api/v1/notifications/me",
                  "PATCH /api/v1/notifications/:notificationId/read",
                  "POST /api/v1/notifications/test-push",
                ],
              },
            },
            required: ["module", "status", "plannedEndpoints"],
          },
        },
        required: ["success", "message", "data"],
      },

      ReportsModuleStatusResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Reports module is available",
          },
          data: {
            type: "object",
            properties: {
              module: {
                type: "string",
                example: "reports",
              },
              status: {
                type: "string",
                example: "scaffolded",
              },
              plannedEndpoints: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "POST /api/v1/reports/emergencies/:emergencyId",
                  "POST /api/v1/reports/users/:userId",
                  "GET /api/v1/reports/me",
                  "GET /api/v1/reports/admin",
                  "PATCH /api/v1/reports/admin/:reportId/status",
                ],
              },
            },
            required: ["module", "status", "plannedEndpoints"],
          },
        },
        required: ["success", "message", "data"],
      },
    },
  },
} as const;