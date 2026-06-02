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