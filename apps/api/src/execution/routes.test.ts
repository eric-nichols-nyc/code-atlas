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

it("validates Counter inputs and ignores client cases on Submit", async () => {
  auth.userId = "counter-learner";
  const app = createApp(
    { publishableKey: "test", secretKey: "test" },
    { execute },
  );
  const path = "/v1/problems/javascript.counter/";
  for (const input of [
    { n: 1001, calls: 3 },
    { n: 0, calls: -1 },
    { n: 0, calls: 1001 },
    { n: 0, calls: 2, expected: [0, 0] },
  ]) {
    expect(
      (
        await request(app)
          .post(`${path}run`)
          .send({ code: "x", inputs: [input] })
      ).status,
    ).toBe(400);
  }
  expect(execute).not.toHaveBeenCalled();
  expect(
    (
      await request(app)
        .post(`${path}run`)
        .send({
          code: "function createCounter(){}",
          inputs: [{ n: -1000, calls: 1000 }],
        })
    ).status,
  ).toBe(200);
  expect(execute).toHaveBeenLastCalledWith(
    expect.objectContaining({
      problemId: "javascript.counter",
      inputs: [{ n: -1000, calls: 1000 }],
      action: "run",
    }),
  );
  expect(
    (
      await request(app)
        .post(`${path}submit`)
        .send({ code: "x", inputs: [{ n: 9999, calls: 0 }] })
    ).status,
  ).toBe(200);
  expect(execute).toHaveBeenLastCalledWith(
    expect.objectContaining({
      problemId: "javascript.counter",
      inputs: undefined,
      action: "submit",
    }),
  );
});

it("validates Debounce and Filter cases before scheduling a worker", async () => {
  auth.userId = "extra-problems-learner";
  const app = createApp(
    { publishableKey: "test", secretKey: "test" },
    { execute },
  );
  for (const [id, input] of [
    ["javascript.debounce", { t: -1, calls: [{ t: 0, inputs: [] }] }],
    ["javascript.debounce", { t: 50, calls: [] }],
    ["javascript.debounce", { t: 50, calls: [{ t: 1001, inputs: [] }] }],
    [
      "javascript.filter-elements-from-array",
      { arr: [1.5], predicate: "isTruthy" },
    ],
    [
      "javascript.filter-elements-from-array",
      { arr: [1], predicate: "unknown" },
    ],
  ])
    expect(
      (
        await request(app)
          .post(`/v1/problems/${id}/run`)
          .send({ code: "x", inputs: [input] })
      ).status,
    ).toBe(400);
  expect(execute).not.toHaveBeenCalled();
  for (const [id, input] of [
    ["javascript.debounce", { t: 0, calls: [{ t: 0, inputs: [] }] }],
    [
      "javascript.filter-elements-from-array",
      { arr: [], predicate: "isTruthy" },
    ],
  ])
    expect(
      (
        await request(app)
          .post(`/v1/problems/${id}/run`)
          .send({ code: "x", inputs: [input] })
      ).status,
    ).toBe(200);
  expect(execute).toHaveBeenCalledTimes(2);
});
