import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";

const session = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock("@clerk/express", () => ({
  clerkMiddleware:
    () => (_request: unknown, _response: unknown, next: () => void) =>
      next(),
  getAuth: () => ({ userId: session.userId }),
}));

describe("API boundaries", () => {
  beforeEach(() => {
    session.userId = null;
  });
  it("keeps the public health endpoint available without credentials", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "api" });
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });
  it("closes protected routes while Clerk is unconfigured", async () => {
    const response = await request(createApp()).get("/v1/me");
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: "Authentication is not configured",
    });
  });
  it("rejects unauthenticated requests when Clerk is configured", async () => {
    const app = createApp({ publishableKey: "test", secretKey: "test" });
    expect((await request(app).get("/v1/me")).status).toBe(401);
  });
  it("returns only the identity verified by Clerk", async () => {
    session.userId = "user_verified";
    const app = createApp({ publishableKey: "test", secretKey: "test" });
    const response = await request(app).get("/v1/me");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: "user_verified" });
  });
  it("only gives CORS access to configured browser origins", async () => {
    const app = createApp();
    const allowed = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:3000");
    const denied = await request(app)
      .get("/health")
      .set("Origin", "https://untrusted.example");
    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });
  it("returns a JSON 404 for unknown public endpoints", async () => {
    const response = await request(createApp()).get("/missing");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found" });
  });
});
