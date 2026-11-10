import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";

const auth = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_q: unknown, _s: unknown, next: () => void) => next(),
  getAuth: () => ({ userId: auth.userId }),
}));
const execute = vi.fn(async () => ({
  attemptId: "real-test-id",
  action: "run" as const,
  verdict: "accepted" as const,
  passed: 1,
  total: 1,
  cases: [],
}));
beforeEach(() => {
  auth.userId = null;
  execute.mockClear();
});
describe("authenticated execution boundary", () => {
  it("never executes without configuration/session", async () => {
    const body = { code: "function sleep(){}", inputs: [10] };
    expect(
      (
        await request(createApp({}, { execute }))
          .post("/v1/problems/javascript.sleep/run")
          .send(body)
      ).status,
    ).toBe(503);
    expect(
      (
        await request(
          createApp({ publishableKey: "test", secretKey: "test" }, { execute }),
        )
          .post("/v1/problems/javascript.sleep/run")
          .send(body)
      ).status,
    ).toBe(401);
    expect(execute).not.toHaveBeenCalled();
  });
  it("validates source/cases and routes real actions only", async () => {
    auth.userId = "learner";
    const app = createApp(
      { publishableKey: "test", secretKey: "test" },
      { execute },
    );
    expect(
      (
        await request(app)
          .post("/v1/problems/javascript.sleep/run")
          .send({ code: "x", inputs: [0] })
      ).status,
    ).toBe(400);
    expect(
      (await request(app).post("/v1/problems/unknown/run").send({ code: "x" }))
        .status,
    ).toBe(404);
    expect(
      (
        await request(app)
          .post("/v1/problems/javascript.sleep/run")
          .send({ code: "function sleep(){}", inputs: [10] })
      ).status,
    ).toBe(200);
    expect(execute).toHaveBeenCalledOnce();
  });
  it("rate-limits authenticated work", async () => {
    auth.userId = "learner";
    const app = createApp(
      { publishableKey: "test", secretKey: "test" },
      { execute },
    );
    for (let i = 0; i < 20; i++)
      await request(app)
        .post("/v1/problems/javascript.sleep/run")
        .send({ code: "x" });
    expect(
      (
        await request(app)
          .post("/v1/problems/javascript.sleep/run")
          .send({ code: "x" })
      ).status,
    ).toBe(429);
    expect(execute).toHaveBeenCalledTimes(20);
  });
});
