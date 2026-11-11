import {
  type ExecutionResult,
  fibonacciGeneratorProblem,
} from "@workspace/problems";
import { beforeEach, expect, it, vi } from "vitest";
import type { ProgressService } from "@/features/catalog/server/progress-service";
import { createExecutionHandler } from "./handler";
import type { executeProblem } from "./service";

const state = vi.hoisted(() => ({
  configured: true,
  userId: "owner-a" as string | null,
}));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => state.userId,
}));
const progress = {
  recordExecution: vi.fn(async () => true),
} as unknown as ProgressService;
const execute = vi.fn<typeof executeProblem>(async () => ({
  attemptId: "test",
  action: "submit",
  verdict: "accepted",
  passed: 10,
  total: 10,
  cases: [],
}));
const make = () => createExecutionHandler({ execute, progress });
const context = (action = "run", problemId = "javascript.sleep") => ({
  params: Promise.resolve({ action, problemId }),
});
const req = (
  body: unknown = { code: "source" },
  origin = "http://localhost:3000",
) =>
  new Request("http://localhost:3000/api/problems/javascript.sleep/run", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  state.configured = true;
  state.userId = "owner-a";
});

it("authenticates and rejects foreign origins before execution or database access", async () => {
  const post = make();
  state.configured = false;
  expect((await post(req(), context())).status).toBe(503);
  state.configured = true;
  state.userId = null;
  expect((await post(req(), context())).status).toBe(401);
  state.userId = "owner-a";
  expect(
    (await post(req({}, "https://foreign.example"), context())).status,
  ).toBe(403);
  expect(execute).not.toHaveBeenCalled();
  expect(progress.recordExecution).not.toHaveBeenCalled();
});

it("bounds source and JSON and validates all current problem inputs before scheduling work", async () => {
  const post = make();
  expect((await post(req({ code: "x".repeat(70000) }), context())).status).toBe(
    413,
  );
  expect((await post(req({ code: "x".repeat(33000) }), context())).status).toBe(
    400,
  );
  expect((await post(req(null), context())).status).toBe(400);
  expect(
    (
      await post(
        new Request("http://localhost:3000/api/problems/x/run", {
          method: "POST",
          body: "{",
        }),
        context(),
      )
    ).status,
  ).toBe(400);
  expect((await post(req(), context("run", "unknown"))).status).toBe(404);
  expect((await post(req(), context("other"))).status).toBe(404);
  for (const [id, inputs] of [
    ["javascript.sleep", [0]],
    ["javascript.counter", [{ n: 0, calls: 1001 }]],
    ["javascript.debounce", [{ t: -1, calls: [] }]],
    ["javascript.fibonacci-generator", [{ count: 51 }]],
    [
      "javascript.filter-elements-from-array",
      [{ arr: [1], predicate: "unknown" }],
    ],
  ])
    expect(
      (
        await post(
          req({ code: "source", inputs }),
          context("run", id as string),
        )
      ).status,
    ).toBe(400);
  expect(execute).not.toHaveBeenCalled();
});

it("uses the verified owner, strips Submit cases and only saves the server verdict", async () => {
  const post = make();
  const response = await post(
    req({ code: "source", inputs: [0], userId: "forged", solvedAt: "forged" }),
    context("submit"),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toMatchObject({
    verdict: "accepted",
    persistence: "saved",
  });
  expect(execute).toHaveBeenLastCalledWith(
    expect.objectContaining({
      problemId: "javascript.sleep",
      inputs: undefined,
      action: "submit",
    }),
  );
  expect(progress.recordExecution).toHaveBeenLastCalledWith(
    "owner-a",
    "javascript.sleep",
    "source",
    expect.any(Date),
    "submit",
    expect.objectContaining({ verdict: "accepted" }),
  );
  state.userId = "owner-b";
  await post(
    req({ code: "source", inputs: [{ n: -2, calls: 5 }] }),
    context("run", "javascript.counter"),
  );
  expect(execute).toHaveBeenLastCalledWith(
    expect.objectContaining({ inputs: [{ n: -2, calls: 5 }] }),
  );
  expect(progress.recordExecution).toHaveBeenLastCalledWith(
    "owner-b",
    "javascript.counter",
    "source",
    expect.any(Date),
    "run",
    expect.any(Object),
  );
});

it("retains a real verdict on save failure and saves unfinished code on worker failure", async () => {
  const post = make();
  vi.mocked(progress.recordExecution).mockRejectedValueOnce(
    new Error("secret database details"),
  );
  const response = await post(req(), context("submit"));
  expect(await response.json()).toMatchObject({
    verdict: "accepted",
    persistence: "unavailable",
  });
  execute.mockRejectedValueOnce(new Error("private worker path"));
  const failed = await post(req({ code: "unfinished" }), context());
  expect(failed.status).toBe(503);
  expect(await failed.text()).not.toContain("private worker");
  expect(progress.recordExecution).toHaveBeenLastCalledWith(
    "owner-a",
    "javascript.sleep",
    "unfinished",
    expect.any(Date),
    "run",
    undefined,
  );
});

it("limits repeated requests per authenticated learner and recovers after the window", async () => {
  const post = make();
  const clock = vi.spyOn(Date, "now").mockReturnValue(100000);
  try {
    for (let i = 0; i < 20; i++)
      expect((await post(req(), context())).status).toBe(200);
    expect((await post(req(), context())).status).toBe(429);
    state.userId = "another-learner";
    expect((await post(req(), context())).status).toBe(200);
    state.userId = "owner-a";
    clock.mockReturnValue(161000);
    expect((await post(req(), context())).status).toBe(200);
  } finally {
    clock.mockRestore();
  }
});

it("limits concurrent requests and releases capacity after completion", async () => {
  const finishes: ((result: ExecutionResult) => void)[] = [];
  const running = vi.fn<typeof executeProblem>(
    () =>
      new Promise((resolve) => {
        finishes.push(resolve);
      }),
  );
  const post = createExecutionHandler({ execute: running, progress });
  const one = post(req(), context());
  const two = post(req(), context());
  await vi.waitFor(() => expect(running).toHaveBeenCalledTimes(2));
  expect((await post(req(), context())).status).toBe(429);
  const result: ExecutionResult = {
    attemptId: "a",
    action: "run",
    verdict: "accepted",
    passed: 1,
    total: 1,
    cases: [],
  };
  for (const finish of finishes) finish(result);
  await Promise.all([one, two]);
  running.mockResolvedValueOnce(result);
  expect((await post(req(), context())).status).toBe(200);
});

it("runs and submits real Sleep source through the Next handler with private diagnostics redacted", async () => {
  const post = createExecutionHandler({ progress });
  const code =
    "function sleep(millis){return new Promise(resolve=>setTimeout(resolve,millis));}";
  const ran = await post(req({ code, inputs: [10] }), context());
  expect(await ran.json()).toMatchObject({
    verdict: "accepted",
    persistence: "saved",
    total: 1,
  });
  const submitted = await post(req({ code, inputs: [0] }), context("submit"));
  const result = (await submitted.json()) as ExecutionResult;
  expect(result).toMatchObject({ verdict: "accepted", total: 10 });
  for (const c of result.cases.filter((c) => c.hidden))
    expect(c).not.toHaveProperty("input");
}, 10000);

it("runs the generator through the authenticated Next boundary and saves its real Submit verdict", async () => {
  const post = createExecutionHandler({ progress });
  const id = fibonacciGeneratorProblem.id;
  const code = fibonacciGeneratorProblem.solution;
  const ran = await post(
    req({ code, inputs: [{ count: 12 }] }),
    context("run", id),
  );
  expect(await ran.json()).toMatchObject({
    verdict: "accepted",
    total: 1,
    persistence: "saved",
  });
  const submitted = await post(
    req({ code, inputs: [{ count: 999 }] }),
    context("submit", id),
  );
  expect(await submitted.json()).toMatchObject({
    verdict: "accepted",
    total: 9,
    passed: 9,
  });
  expect(progress.recordExecution).toHaveBeenLastCalledWith(
    "owner-a",
    id,
    code,
    expect.any(Date),
    "submit",
    expect.objectContaining({ verdict: "accepted" }),
  );
});
