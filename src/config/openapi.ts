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

    "/api/v1/emergencies/categories": {
      get: {
        tags: ["Emergencies"],
        summary: "Get emergency categories",
        description:
          "Returns active emergency categories such as Medical Help, Accident, Fire, Unsafe Situation, Vehicle Breakdown, Lost Person, and Other.",
        responses: {
          "200": {
            description: "Emergency categories returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmergencyCategoriesResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to fetch emergency categories.",
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
        summary: "Get active emergencies",
        description:
          "Returns latest active emergencies. This endpoint requires authentication.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Active emergencies returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmergenciesResponse",
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
            description: "Failed to fetch active emergencies.",
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
        tags: ["Emergencies"],
        summary: "Create SOS emergency",
        description:
          "Creates a new SOS emergency for the authenticated user. The database trigger builds the PostGIS location_point automatically.",
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
                $ref: "#/components/schemas/CreateEmergencyRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Emergency created successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmergencyResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed or emergency category is invalid.",
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
            description: "Failed to create emergency.",
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

    "/api/v1/emergencies/me/history": {
      get: {
        tags: ["Emergencies"],
        summary: "Get my emergency history",
        description:
          "Returns the authenticated user's emergency history ordered by latest first.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Emergency history returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmergenciesResponse",
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
            description: "Failed to fetch emergency history.",
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

    "/api/v1/emergencies/{emergencyId}": {
      get: {
        tags: ["Emergencies"],
        summary: "Get emergency detail",
        description:
          "Returns one emergency by id. This endpoint requires authentication.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "emergencyId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
        ],
        responses: {
          "200": {
            description: "Emergency returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmergencyResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid emergency id.",
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
            description: "Emergency not found.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to fetch emergency.",
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

    "/api/v1/emergencies/{emergencyId}/cancel": {
      patch: {
        tags: ["Emergencies"],
        summary: "Cancel my active emergency",
        description:
          "Cancels an active emergency owned by the authenticated requester.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "emergencyId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
        ],
        responses: {
          "200": {
            description: "Emergency cancelled successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmergencyResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid emergency id.",
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
            description:
              "Active emergency not found or requester is not allowed to update it.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to cancel emergency.",
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

    "/api/v1/emergencies/{emergencyId}/resolve": {
      patch: {
        tags: ["Emergencies"],
        summary: "Resolve my active emergency",
        description:
          "Marks an active emergency owned by the authenticated requester as resolved.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "emergencyId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
        ],
        responses: {
          "200": {
            description: "Emergency resolved successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmergencyResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid emergency id.",
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
            description:
              "Active emergency not found or requester is not allowed to update it.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to resolve emergency.",
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

    "/api/v1/responders": {
      get: {
        tags: ["Responders"],
        summary: "Get Responders module status",
        description:
          "Returns responder module metadata and available responder endpoints.",
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

    "/api/v1/responders/emergencies/{emergencyId}/accept": {
      post: {
        tags: ["Responders"],
        summary: "Accept an active emergency",
        description:
          "Allows an authenticated user to accept an active emergency as a responder. The requester cannot accept their own emergency.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "emergencyId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
        ],
        responses: {
          "201": {
            description: "Emergency accepted successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResponderResponse",
                },
              },
            },
          },
          "200": {
            description:
              "Emergency accepted successfully after reactivating a previously cancelled responder record.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResponderResponse",
                },
              },
            },
          },
          "400": {
            description:
              "Invalid emergency id, requester accepting own emergency, or emergency is not active.",
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
            description: "Emergency not found.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "409": {
            description: "User has already accepted this emergency.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to accept emergency.",
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

    "/api/v1/responders/emergencies/{emergencyId}/status": {
      patch: {
        tags: ["Responders"],
        summary: "Update responder status",
        description:
          "Updates the authenticated responder status for an active emergency.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "emergencyId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateResponderStatusRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Responder status updated successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResponderResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed or emergency is not active.",
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
            description:
              "Active responder record not found for this emergency.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to update responder status.",
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

    "/api/v1/responders/emergencies/{emergencyId}/leave": {
      delete: {
        tags: ["Responders"],
        summary: "Leave an emergency response",
        description:
          "Marks the authenticated responder record as cancelled instead of deleting it, preserving audit history.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "emergencyId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
        ],
        responses: {
          "200": {
            description: "Responder left emergency successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResponderResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid emergency id.",
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
            description:
              "Active responder record not found for this emergency.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to leave emergency response.",
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

    "/api/v1/responders/me/active": {
      get: {
        tags: ["Responders"],
        summary: "Get my active responder records",
        description:
          "Returns authenticated user's active responder records with statuses accepted, on_way, or arrived.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Active responder records returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RespondersResponse",
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
            description: "Failed to fetch active responder records.",
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

    "/api/v1/responders/me/history": {
      get: {
        tags: ["Responders"],
        summary: "Get my responder history",
        description:
          "Returns authenticated user's responder history ordered by latest accepted time first.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Responder history returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RespondersResponse",
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
            description: "Failed to fetch responder history.",
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

    "/api/v1/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get Notifications module status",
        description:
          "Returns notification module metadata and available notification endpoints.",
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

    "/api/v1/notifications/devices": {
      post: {
        tags: ["Notifications"],
        summary: "Register device token",
        description:
          "Registers or reactivates the authenticated user's Android or iOS device token for push notifications.",
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
                $ref: "#/components/schemas/RegisterDeviceRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Device registered successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeviceResponse",
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
            description: "Failed to register device.",
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

    "/api/v1/notifications/devices/{deviceId}": {
      delete: {
        tags: ["Notifications"],
        summary: "Deactivate device token",
        description:
          "Deactivates one authenticated-user-owned device token without deleting audit data.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "deviceId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "7f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
        ],
        responses: {
          "200": {
            description: "Device deactivated successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeviceResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid device id.",
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
            description: "Device not found.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to deactivate device.",
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

    "/api/v1/notifications/me": {
      get: {
        tags: ["Notifications"],
        summary: "Get my notifications",
        description:
          "Returns the authenticated user's notifications ordered by latest first.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Notifications returned successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NotificationsResponse",
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
            description: "Failed to fetch notifications.",
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

    "/api/v1/notifications/{notificationId}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        description:
          "Marks one authenticated-user-owned notification as read.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "notificationId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "8f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
        ],
        responses: {
          "200": {
            description: "Notification marked as read successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NotificationResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid notification id.",
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
            description: "Notification not found.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Failed to mark notification as read.",
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

    "/api/v1/notifications/test-push": {
      post: {
        tags: ["Notifications"],
        summary: "Send test push notification",
        description:
          "Creates a test notification and attempts to send it to the authenticated user's active device tokens. Requires Firebase configuration.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TestPushRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Test push notification processed successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TestPushResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed or no active device token exists.",
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
            description:
              "Firebase is not configured or push notification delivery failed.",
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

      EmergencyPriority: {
        type: "string",
        enum: ["low", "medium", "high", "critical"],
        example: "critical",
      },

      EmergencyStatus: {
        type: "string",
        enum: ["active", "resolved", "cancelled", "expired"],
        example: "active",
      },

      EmergencyCategory: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          name: {
            type: "string",
            example: "Medical Help",
          },
          slug: {
            type: "string",
            example: "medical-help",
          },
          description: {
            type: "string",
            nullable: true,
            example: "Medical assistance needed.",
          },
          priority: {
            $ref: "#/components/schemas/EmergencyPriority",
          },
          isActive: {
            type: "boolean",
            example: true,
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
          "name",
          "slug",
          "description",
          "priority",
          "isActive",
          "createdAt",
          "updatedAt",
        ],
      },

      EmergencyCategoriesResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Emergency categories returned successfully",
          },
          data: {
            type: "object",
            properties: {
              categories: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/EmergencyCategory",
                },
              },
            },
            required: ["categories"],
          },
        },
        required: ["success", "message", "data"],
      },

      Emergency: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          requesterId: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          categoryId: {
            type: "string",
            format: "uuid",
            example: "1f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          title: {
            type: "string",
            example: "Need medical help",
          },
          description: {
            type: "string",
            nullable: true,
            example: "A person has fainted near the road.",
          },
          latitude: {
            type: "number",
            example: 31.5204,
          },
          longitude: {
            type: "number",
            example: 74.3587,
          },
          radiusKm: {
            type: "number",
            example: 5,
          },
          status: {
            $ref: "#/components/schemas/EmergencyStatus",
          },
          priority: {
            $ref: "#/components/schemas/EmergencyPriority",
          },
          resolvedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          cancelledAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          expiresAt: {
            type: "string",
            format: "date-time",
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
          "requesterId",
          "categoryId",
          "title",
          "description",
          "latitude",
          "longitude",
          "radiusKm",
          "status",
          "priority",
          "resolvedAt",
          "cancelledAt",
          "expiresAt",
          "createdAt",
          "updatedAt",
        ],
      },

      CreateEmergencyRequest: {
        type: "object",
        properties: {
          categoryId: {
            type: "string",
            format: "uuid",
            example: "1f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          title: {
            type: "string",
            minLength: 3,
            maxLength: 160,
            example: "Need medical help",
          },
          description: {
            type: "string",
            nullable: true,
            maxLength: 1000,
            example: "A person has fainted near the road.",
          },
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
          radiusKm: {
            type: "number",
            minimum: 0,
            maximum: 50,
            example: 5,
          },
          priority: {
            $ref: "#/components/schemas/EmergencyPriority",
          },
        },
        required: ["categoryId", "title", "latitude", "longitude"],
        additionalProperties: false,
      },

      EmergencyResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Emergency created successfully",
          },
          data: {
            type: "object",
            properties: {
              emergency: {
                $ref: "#/components/schemas/Emergency",
              },
            },
            required: ["emergency"],
          },
        },
        required: ["success", "message", "data"],
      },

      EmergenciesResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Active emergencies returned successfully",
          },
          data: {
            type: "object",
            properties: {
              emergencies: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Emergency",
                },
              },
            },
            required: ["emergencies"],
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

      ResponderStatus: {
        type: "string",
        enum: ["accepted", "on_way", "arrived", "cancelled"],
        example: "accepted",
      },

      UpdateResponderStatusRequest: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["on_way", "arrived", "cancelled"],
            example: "on_way",
          },
        },
        required: ["status"],
        additionalProperties: false,
      },

      EmergencyResponder: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "7f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          emergencyId: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          responderId: {
            type: "string",
            format: "uuid",
            example: "2f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          status: {
            $ref: "#/components/schemas/ResponderStatus",
          },
          acceptedAt: {
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
          "emergencyId",
          "responderId",
          "status",
          "acceptedAt",
          "updatedAt",
        ],
      },

      ResponderResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Emergency accepted successfully",
          },
          data: {
            type: "object",
            properties: {
              responder: {
                $ref: "#/components/schemas/EmergencyResponder",
              },
            },
            required: ["responder"],
          },
        },
        required: ["success", "message", "data"],
      },

      RespondersResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Active responder records returned successfully",
          },
          data: {
            type: "object",
            properties: {
              responders: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/EmergencyResponder",
                },
              },
            },
            required: ["responders"],
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
                example: "active",
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

      DevicePlatform: {
        type: "string",
        enum: ["android", "ios"],
        example: "android",
      },

      NotificationStatus: {
        type: "string",
        enum: ["pending", "sent", "failed", "read"],
        example: "sent",
      },

      RegisterDeviceRequest: {
        type: "object",
        properties: {
          platform: {
            $ref: "#/components/schemas/DevicePlatform",
          },
          deviceToken: {
            type: "string",
            minLength: 10,
            maxLength: 4096,
            example: "fcm-device-token-example",
          },
        },
        required: ["platform", "deviceToken"],
        additionalProperties: false,
      },

      UserDevice: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "7f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          userId: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          platform: {
            $ref: "#/components/schemas/DevicePlatform",
          },
          deviceToken: {
            type: "string",
            example: "fcm-device-token-example",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
          lastSeenAt: {
            type: "string",
            format: "date-time",
            nullable: true,
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
          "userId",
          "platform",
          "deviceToken",
          "isActive",
          "lastSeenAt",
          "createdAt",
          "updatedAt",
        ],
      },

      DeviceResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Device registered successfully",
          },
          data: {
            type: "object",
            properties: {
              device: {
                $ref: "#/components/schemas/UserDevice",
              },
            },
            required: ["device"],
          },
        },
        required: ["success", "message", "data"],
      },

      UserNotification: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "8f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          userId: {
            type: "string",
            format: "uuid",
            example: "9f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          emergencyId: {
            type: "string",
            format: "uuid",
            nullable: true,
            example: "1f5f1b9e-3d5c-4d5c-9f7a-7a8b9c0d1e2f",
          },
          title: {
            type: "string",
            example: "AidCircle test notification",
          },
          body: {
            type: "string",
            example: "Push notification delivery is working.",
          },
          payload: {
            type: "object",
            additionalProperties: true,
            example: {
              source: "test-push",
            },
          },
          status: {
            $ref: "#/components/schemas/NotificationStatus",
          },
          sentAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          readAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          errorMessage: {
            type: "string",
            nullable: true,
            example: null,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
        required: [
          "id",
          "userId",
          "emergencyId",
          "title",
          "body",
          "payload",
          "status",
          "sentAt",
          "readAt",
          "errorMessage",
          "createdAt",
        ],
      },

      NotificationResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Notification marked as read successfully",
          },
          data: {
            type: "object",
            properties: {
              notification: {
                $ref: "#/components/schemas/UserNotification",
              },
            },
            required: ["notification"],
          },
        },
        required: ["success", "message", "data"],
      },

      NotificationsResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Notifications returned successfully",
          },
          data: {
            type: "object",
            properties: {
              notifications: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/UserNotification",
                },
              },
            },
            required: ["notifications"],
          },
        },
        required: ["success", "message", "data"],
      },

      TestPushRequest: {
        type: "object",
        properties: {
          title: {
            type: "string",
            minLength: 1,
            maxLength: 120,
            example: "AidCircle test notification",
          },
          body: {
            type: "string",
            minLength: 1,
            maxLength: 500,
            example: "Push notification delivery is working.",
          },
          payload: {
            type: "object",
            additionalProperties: true,
            example: {
              source: "manual-test",
            },
          },
        },
        additionalProperties: false,
      },

      TestPushResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Test push notification processed successfully",
          },
          data: {
            type: "object",
            properties: {
              notification: {
                $ref: "#/components/schemas/UserNotification",
              },
              push: {
                type: "object",
                properties: {
                  requestedDevices: {
                    type: "number",
                    example: 1,
                  },
                  successCount: {
                    type: "number",
                    example: 1,
                  },
                  failureCount: {
                    type: "number",
                    example: 0,
                  },
                },
                required: [
                  "requestedDevices",
                  "successCount",
                  "failureCount",
                ],
              },
            },
            required: ["notification", "push"],
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
                example: "active",
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