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
  process.env.RATE_LIMIT_MAX_REQUESTS = "100";
  process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
  process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = "2";
}

describe("rate limiting", () => {
  let app: Express;

  beforeAll(async () => {
    setRequiredTestEnv();

    const appModule = await import("./app.js");

    app = appModule.createApp();
  });

  it("adds rate limit headers to API responses", async () => {
    const response = await request(app).get("/api/v1").expect(200);

    expect(response.headers["x-ratelimit-limit"]).toBeDefined();
    expect(response.headers["x-ratelimit-remaining"]).toBeDefined();
    expect(response.headers["x-ratelimit-reset"]).toBeDefined();
  });

  it("blocks auth requests after the auth-specific limit is exceeded", async () => {
    await request(app).get("/api/v1/auth").expect(200);
    await request(app).get("/api/v1/auth").expect(200);

    const response = await request(app).get("/api/v1/auth").expect(429);

    expect(response.body).toMatchObject({
      success: false,
      message: "Too many requests. Please try again later.",
      error: {
        code: "TOO_MANY_REQUESTS",
      },
    });

    expect(response.headers["retry-after"]).toBeDefined();
    expect(response.headers["x-ratelimit-limit"]).toBe("2");
    expect(response.headers["x-ratelimit-remaining"]).toBe("0");
  });
});