import { beforeEach, expect, it, vi } from "vitest";
import { createProgressHandlers } from "./progress-handlers";
import type { ProgressService } from "./progress-service";

const state = vi.hoisted(() => ({
  configured: true,
  userId: "owner-a" as string | null,
}));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => state.userId,
}));
const progress = {
  list: vi.fn(async () => []),
  read: vi.fn(async () => null),
  flag: vi.fn(async () => ({ flagged: true })),
  importLegacy: vi.fn(async () => []),
} as unknown as ProgressService;
const handlers = createProgressHandlers(progress);
const context = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const req = (
  method = "GET",
  body?: unknown,
  origin = "http://localhost:3000",
) =>
  new Request("http://localhost:3000/api/practice-progress?userId=forged", {
    method,
    headers: { origin, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  state.configured = true;
  state.userId = "owner-a";
});
it("denies missing configuration, identity and foreign origins before database access", async () => {
  state.configured = false;
  expect((await handlers.GET(req(), context())).status).toBe(503);
  state.configured = true;
  state.userId = null;
  expect((await handlers.GET(req(), context())).status).toBe(401);
  state.userId = "owner-a";
  expect(
    (
      await handlers.PATCH(
        req("PATCH", { flagged: true }, "https://foreign.example"),
        context("javascript.sleep"),
      )
    ).status,
  ).toBe(403);
  expect(progress.list).not.toHaveBeenCalled();
  expect(progress.flag).not.toHaveBeenCalled();
});
it("scopes list, detail, flags and import to server identity with no-store", async () => {
  const r = await handlers.GET(req(), context());
  expect(r.headers.get("cache-control")).toBe("no-store");
  expect(progress.list).toHaveBeenLastCalledWith("owner-a");
  await handlers.GET(req(), context("javascript.sleep"));
  expect(progress.read).toHaveBeenLastCalledWith("owner-a", "javascript.sleep");
  await handlers.POST(
    req("POST", {
      flagged: ["javascript.sleep"],
      solved: ["javascript.counter"],
    }),
    context("import"),
  );
  expect(progress.importLegacy).toHaveBeenLastCalledWith(
    "owner-a",
    ["javascript.sleep"],
    ["javascript.counter"],
  );
  state.userId = "owner-b";
  await handlers.PATCH(
    req("PATCH", { flagged: true }),
    context("javascript.sleep"),
  );
  expect(progress.flag).toHaveBeenLastCalledWith(
    "owner-b",
    "javascript.sleep",
    true,
  );
});
it("rejects forged ownership, solved state, saved source, invalid imports and oversized JSON", async () => {
  for (const body of [
    { flagged: true, userId: "owner-b" },
    { flagged: true, solvedAt: "now" },
    { lastCode: "source" },
    { flagged: "true" },
  ])
    expect(
      (await handlers.PATCH(req("PATCH", body), context("javascript.sleep")))
        .status,
    ).toBe(400);
  expect(
    (
      await handlers.POST(
        req("POST", { flagged: [], solved: ["unknown"] }),
        context("import"),
      )
    ).status,
  ).toBe(400);
  expect(
    (
      await handlers.POST(
        req("POST", { flagged: ["x".repeat(9000)], solved: [] }),
        context("import"),
      )
    ).status,
  ).toBe(413);
  expect((await handlers.GET(req(), context("unknown"))).status).toBe(404);
  expect(
    (await handlers.GET(req(), context("javascript.sleep", "other"))).status,
  ).toBe(404);
  expect(progress.flag).not.toHaveBeenCalled();
  expect(progress.importLegacy).not.toHaveBeenCalled();
});
it("sanitizes persistence failures and keeps responses uncached", async () => {
  vi.mocked(progress.list).mockRejectedValueOnce(
    new Error("private connection string"),
  );
  const response = await handlers.GET(req(), context());
  expect(response.status).toBe(503);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.text()).not.toContain("private connection");
});
