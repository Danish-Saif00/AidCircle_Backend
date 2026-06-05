import type { Express } from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

function setRequiredTestEnv(): void {
  process.env.NODE_ENV = "production";
  process.env.PORT = "5000";

  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  process.env.SUPABASE_ANON_KEY = "test-anon-key";

  process.env.APP_NAME = "AidCircle";
  process.env.DEFAULT_ALERT_RADIUS_KM = "5";
  process.env.SOS_AUTO_EXPIRE_MINUTES = "120";

  process.env.CORS_ALLOWED_ORIGINS = "https://allowed.example.com";

  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  process.env.RATE_LIMIT_MAX_REQUESTS = "120";
  process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
  process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = "10";
}

describe("CORS configuration", () => {
  let app: Express;

  beforeAll(async () => {
    setRequiredTestEnv();

    const appModule = await import("./app.js");

    app = appModule.createApp();
  });

  it("allows configured production origin", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "https://allowed.example.com")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://allowed.example.com",
    );
  });

  it("blocks unconfigured production origin", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "https://blocked.example.com")
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      message: "CORS origin is not allowed",
      error: {
        code: "FORBIDDEN",
      },
    });

    expect(response.body.requestId).toEqual(expect.any(String));
  });

  it("allows requests without origin header", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "AidCircle backend is running",
      environment: "production",
    });
  });
});