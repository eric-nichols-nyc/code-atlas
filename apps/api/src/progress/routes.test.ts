import request from "supertest";
import { beforeEach, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import type { ProgressService } from "./service.js";

const auth = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_q: unknown, _s: unknown, next: () => void) => next(),
  getAuth: () => ({ userId: auth.userId }),
}));
const progress = {
  list: vi.fn(async () => []),
  read: vi.fn(async () => null),
  flag: vi.fn(async () => ({
    problemId: "javascript.sleep",
    flagged: true,
    solvedAt: null,
    legacyCompleted: false,
  })),
  importLegacy: vi.fn(async () => []),
  recordExecution: vi.fn(async () => {}),
} as unknown as ProgressService;
const execute = vi.fn(async () => ({
  attemptId: "test",
  action: "submit" as const,
  verdict: "accepted" as const,
  passed: 10,
  total: 10,
  cases: [],
}));
const app = () =>
  createApp(
    { publishableKey: "test", secretKey: "test" },
    { progress, execute },
  );
beforeEach(() => {
  vi.clearAllMocks();
  auth.userId = "owner-a";
});
it("rejects missing identity before accessing progress", async () => {
  auth.userId = null;
  expect((await request(app()).get("/v1/practice-progress")).status).toBe(401);
  expect(progress.list).not.toHaveBeenCalled();
});
it("always scopes reads/writes to verified Clerk identity", async () => {
  const api = app();
  expect(
    (await request(api).get("/v1/practice-progress?userId=owner-b")).status,
  ).toBe(200);
  expect(progress.list).toHaveBeenLastCalledWith("owner-a");
  await request(api).get(
    "/v1/practice-progress/javascript.sleep?userId=owner-b",
  );
  expect(progress.read).toHaveBeenLastCalledWith("owner-a", "javascript.sleep");
  expect(
    (
      await request(api)
        .patch("/v1/practice-progress/javascript.sleep")
        .send({ flagged: true, userId: "owner-b" })
    ).status,
  ).toBe(400);
  expect(progress.flag).not.toHaveBeenCalled();
  auth.userId = "owner-b";
  await request(api)
    .patch("/v1/practice-progress/javascript.sleep")
    .send({ flagged: true });
  expect(progress.flag).toHaveBeenLastCalledWith(
    "owner-b",
    "javascript.sleep",
    true,
  );
});
it("rejects forged solved state, source, and unknown legacy IDs", async () => {
  const api = app();
  for (const body of [
    { solvedAt: new Date().toISOString() },
    { flagged: true, solvedAt: "now" },
    { lastCode: "code" },
    { flagged: "true" },
  ])
    expect(
      (
        await request(api)
          .patch("/v1/practice-progress/javascript.sleep")
          .send(body)
      ).status,
    ).toBe(400);
  expect(
    (
      await request(api)
        .post("/v1/practice-progress/import")
        .send({ flagged: [], solved: ["unknown"] })
    ).status,
  ).toBe(400);
  expect(progress.importLegacy).not.toHaveBeenCalled();
  await request(api)
    .post("/v1/practice-progress/import")
    .send({ flagged: ["javascript.sleep"], solved: ["javascript.counter"] });
  expect(progress.importLegacy).toHaveBeenCalledWith(
    "owner-a",
    ["javascript.sleep"],
    ["javascript.counter"],
  );
});
it("persists judged source/result and reports an outage without losing the verdict", async () => {
  const api = app();
  const response = await request(api)
    .post("/v1/problems/javascript.sleep/submit")
    .send({ code: "source", solvedAt: "forged" });
  expect(response.body.persistence).toBe("saved");
  expect(progress.recordExecution).toHaveBeenCalledWith(
    "owner-a",
    "javascript.sleep",
    "source",
    expect.any(Date),
    "submit",
    expect.objectContaining({ verdict: "accepted" }),
  );
  vi.mocked(progress.recordExecution).mockRejectedValueOnce(
    new Error("secret database details"),
  );
  const failed = await request(api)
    .post("/v1/problems/javascript.sleep/submit")
    .send({ code: "source" });
  expect(failed.body).toMatchObject({
    verdict: "accepted",
    persistence: "unavailable",
  });
  expect(JSON.stringify(failed.body)).not.toContain("secret database");
});
it("saves source when execution infrastructure fails and sanitizes progress errors", async () => {
  execute.mockRejectedValueOnce(new Error("worker failure"));
  expect(
    (
      await request(app())
        .post("/v1/problems/javascript.sleep/run")
        .send({ code: "unfinished" })
    ).status,
  ).toBe(503);
  expect(progress.recordExecution).toHaveBeenCalledWith(
    "owner-a",
    "javascript.sleep",
    "unfinished",
    expect.any(Date),
    "run",
    undefined,
  );
  vi.mocked(progress.list).mockRejectedValueOnce(
    new Error("private connection string"),
  );
  const failed = await request(app()).get("/v1/practice-progress");
  expect(failed.status).toBe(503);
  expect(failed.text).not.toContain("private connection");
});
