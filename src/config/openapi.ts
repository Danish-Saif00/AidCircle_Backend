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
                  "reports"
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
    },
  },
} as const;