import type { Express } from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

function setRequiredTestEnv(): void {
  process.env.NODE_ENV = "test";
  process.env.PORT = "5000";

  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  process.env.SUPABASE_ANON_KEY = "test-anon-key";

  process.env.APP_NAME = "AidCircle";
  process.env.DEFAULT_ALERT_RADIUS_KM = "5";
  process.env.SOS_AUTO_EXPIRE_MINUTES = "120";

  process.env.CORS_ALLOWED_ORIGINS = "";

  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  process.env.RATE_LIMIT_MAX_REQUESTS = "120";
  process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
  process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = "10";
}

describe("OpenAPI documentation", () => {
  let app: Express;

  beforeAll(async () => {
    setRequiredTestEnv();

    const appModule = await import("./app.js");

    app = appModule.createApp();
  });

  it("exposes OpenAPI JSON", async () => {
    const response = await request(app).get("/api-docs.json").expect(200);

    expect(response.body).toMatchObject({
      openapi: "3.0.3",
      info: {
        title: "AidCircle API",
        version: "1.0.0",
      },
    });
  });

  it("documents core API paths", async () => {
    const response = await request(app).get("/api-docs.json").expect(200);

    expect(response.body.paths).toHaveProperty("/health");
    expect(response.body.paths).toHaveProperty("/api/v1");
    expect(response.body.paths).toHaveProperty("/api/v1/auth/signup");
    expect(response.body.paths).toHaveProperty("/api/v1/auth/login");
    expect(response.body.paths).toHaveProperty("/api/v1/users/me");
    expect(response.body.paths).toHaveProperty("/api/v1/locations/me");
    expect(response.body.paths).toHaveProperty("/api/v1/emergencies");
    expect(response.body.paths).toHaveProperty(
      "/api/v1/responders/emergencies/{emergencyId}/accept",
    );
    expect(response.body.paths).toHaveProperty("/api/v1/notifications/me");
    expect(response.body.paths).toHaveProperty(
      "/api/v1/reports/admin/{reportId}/status",
    );
  });

  it("documents bearer authentication scheme", async () => {
    const response = await request(app).get("/api-docs.json").expect(200);

    expect(response.body.components.securitySchemes).toMatchObject({
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    });
  });

  it("documents request id on health and error responses", async () => {
    const response = await request(app).get("/api-docs.json").expect(200);

    expect(response.body.components.schemas.HealthResponse.properties).toHaveProperty(
      "requestId",
    );
    expect(response.body.components.schemas.HealthResponse.required).toContain(
      "requestId",
    );
    expect(response.body.components.schemas.ApiErrorResponse.properties).toHaveProperty(
      "requestId",
    );
    expect(response.body.components.schemas.ApiErrorResponse.required).not.toContain(
      "requestId",
    );
  });

  it("documents rate limit responses and headers", async () => {
    const response = await request(app).get("/api-docs.json").expect(200);

    const authLoginResponses =
      response.body.paths["/api/v1/auth/login"].post.responses;

    expect(authLoginResponses).toHaveProperty("429");
    expect(authLoginResponses["429"]).toMatchObject({
      description: "Too many requests.",
      headers: {
        "Retry-After": {
          description: "Seconds until the client should retry.",
        },
        "X-RateLimit-Limit": {
          description: "Maximum requests allowed in the current window.",
        },
        "X-RateLimit-Remaining": {
          description: "Remaining requests in the current window.",
        },
        "X-RateLimit-Reset": {
          description: "Unix timestamp in seconds when the rate-limit window resets.",
        },
      },
    });
  });

  it("does not document rate limiting on health endpoint", async () => {
    const response = await request(app).get("/api-docs.json").expect(200);

    const healthResponses = response.body.paths["/health"].get.responses;

    expect(healthResponses).toHaveProperty("200");
    expect(healthResponses).not.toHaveProperty("429");
  });
});