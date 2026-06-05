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

describe("AidCircle app", () => {
  let app: Express;

  beforeAll(async () => {
    setRequiredTestEnv();

    const appModule = await import("./app.js");

    app = appModule.createApp();
  });

  it("returns health status with request id", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "AidCircle backend is running",
      environment: "test",
    });

    expect(response.body.requestId).toEqual(expect.any(String));
    expect(response.headers["x-request-id"]).toEqual(response.body.requestId);
  });

  it("uses incoming x-request-id when valid", async () => {
    const requestId = "test-request-id-123";

    const response = await request(app)
      .get("/health")
      .set("x-request-id", requestId)
      .expect(200);

    expect(response.body.requestId).toBe(requestId);
    expect(response.headers["x-request-id"]).toBe(requestId);
  });

  it("returns request id on unknown routes", async () => {
    const response = await request(app).get("/invalid-route").expect(404);

    expect(response.body).toMatchObject({
      success: false,
      message: "Route GET /invalid-route not found",
      error: {
        code: "ROUTE_NOT_FOUND",
      },
    });

    expect(response.body.requestId).toEqual(expect.any(String));
    expect(response.headers["x-request-id"]).toEqual(response.body.requestId);
  });
});