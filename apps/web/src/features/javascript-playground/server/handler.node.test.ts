import { MAX_SOURCE_BYTES } from "@workspace/problems";
import { beforeEach, expect, it, vi } from "vitest";
import { ExecutionUnavailable } from "@/features/problems/server/worker-pool";
import { createPlaygroundRunHandler } from "./handler";
import type { runPlaygroundScript } from "./service";

const auth = vi.hoisted(() => ({
  configured: true,
  learner: "learner-id" as string | null,
}));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => auth.configured }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => auth.learner,
}));

const execute = vi.fn<typeof runPlaygroundScript>();
const url = "http://localhost:3000/api/javascript/playground/run";
const request = (
  body = JSON.stringify({ code: "console.log(1)" }),
  origin = "http://localhost:3000",
) =>
  new Request(url, {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body,
  });

beforeEach(() => {
  auth.configured = true;
  auth.learner = "learner-id";
  execute.mockReset();
  execute.mockResolvedValue({ status: "finished", logs: ["1"] });
});

it("verifies configuration, session and origin before starting work", async () => {
  const post = createPlaygroundRunHandler(execute);
  auth.configured = false;
  expect((await post(request())).status).toBe(503);
  auth.configured = true;
  auth.learner = null;
  expect((await post(request())).status).toBe(401);
  auth.learner = "learner-id";
  expect(
    (await post(request(undefined, "https://foreign.example"))).status,
  ).toBe(403);
  expect(execute).not.toHaveBeenCalled();
});

it("enforces a source-only envelope, UTF-8 source limit and bounded JSON", async () => {
  const post = createPlaygroundRunHandler(execute);
  const invalid = [
    "{",
    JSON.stringify(null),
    JSON.stringify({ code: "   " }),
    JSON.stringify({ code: "x", problemId: "javascript.sleep" }),
    JSON.stringify({ code: "é".repeat(MAX_SOURCE_BYTES / 2 + 1) }),
  ];
  for (const body of invalid)
    expect((await post(request(body))).status).toBe(400);
  expect(
    (await post(request("x".repeat(6 * MAX_SOURCE_BYTES + 129)))).status,
  ).toBe(413);
  expect(execute).not.toHaveBeenCalled();

  const code = "\u0001".repeat(MAX_SOURCE_BYTES);
  const response = await post(request(JSON.stringify({ code })));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual({ status: "finished", logs: ["1"] });
  expect(execute).toHaveBeenCalledWith(code, expect.any(AbortSignal));
});

it("limits pending and repeated runs by verified learner identity", async () => {
  let release!: (result: Awaited<ReturnType<typeof execute>>) => void;
  const result = new Promise<Awaited<ReturnType<typeof execute>>>((resolve) => {
    release = resolve;
  });
  execute.mockReturnValueOnce(result);
  const post = createPlaygroundRunHandler(execute);
  const first = post(request());
  await vi.waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
  expect((await post(request())).status).toBe(429);
  auth.learner = "other-learner";
  expect((await post(request())).status).toBe(200);

  release({ status: "finished", logs: [] });
  expect((await first).status).toBe(200);
  auth.learner = "learner-id";
  for (let i = 0; i < 9; i++) expect((await post(request())).ok).toBe(true);
  expect((await post(request())).status).toBe(429);
});

it("reports a busy runner or sanitized failure and permits retry", async () => {
  execute
    .mockRejectedValueOnce(new ExecutionUnavailable("Runner busy", "busy"))
    .mockRejectedValueOnce(new Error("internal failure"));
  const post = createPlaygroundRunHandler(execute);
  expect((await post(request())).status).toBe(429);
  const failure = await post(request());
  expect(failure.status).toBe(503);
  expect(await failure.json()).toEqual({
    error: "The runner is unavailable. Your draft is still here.",
  });
  expect((await post(request())).status).toBe(200);
});
