import type { getDb } from "@workspace/db";
import type { ExecutionResult } from "@workspace/problems";
import { beforeEach, expect, it, vi } from "vitest";
import { createProgressService } from "./progress-service";

const db = {
  user: { upsert: vi.fn(async () => ({ id: "internal-owner" })) },
  practiceProgress: {
    findMany: vi.fn(async () => []),
    findUnique: vi.fn(async () => null),
    upsert: vi.fn(async () => ({ id: "record" })),
    updateMany: vi.fn(async (_query: unknown) => ({ count: 1 })),
    createMany: vi.fn(async () => ({ count: 1 })),
  },
  $transaction: vi.fn(async (queries: Promise<unknown>[]) =>
    Promise.all(queries),
  ),
};
const service = createProgressService(
  () => db as unknown as ReturnType<typeof getDb>,
);
beforeEach(() => vi.clearAllMocks());
it("uses the verified owner for every operation and no data access for empty identity", async () => {
  await expect(service.list("")).rejects.toThrow("Verified identity");
  expect(db.user.upsert).not.toHaveBeenCalled();
  await service.list("clerk-owner");
  expect(db.user.upsert).toHaveBeenCalledWith(
    expect.objectContaining({ where: { clerkUserId: "clerk-owner" } }),
  );
  expect(db.practiceProgress.findMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { userId: "internal-owner" } }),
  );
  await service.read("clerk-owner", "javascript.sleep");
  expect(db.practiceProgress.findUnique).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        userId_problemId: {
          userId: "internal-owner",
          problemId: "javascript.sleep",
        },
      },
    }),
  );
});
it("imports idempotently without converting browser completion into solved status", async () => {
  await service.importLegacy(
    "clerk-owner",
    ["javascript.sleep"],
    ["javascript.counter"],
  );
  expect(db.practiceProgress.createMany).toHaveBeenCalledWith({
    skipDuplicates: true,
    data: [
      {
        userId: "internal-owner",
        problemId: "javascript.sleep",
        flagged: true,
        legacyCompleted: false,
      },
      {
        userId: "internal-owner",
        problemId: "javascript.counter",
        flagged: false,
        legacyCompleted: true,
      },
    ],
  });
  expect(db.practiceProgress.updateMany).toHaveBeenCalledWith({
    where: {
      userId: "internal-owner",
      problemId: { in: ["javascript.counter"] },
    },
    data: { legacyCompleted: true },
  });
});
it("saves failed/Run sources but only an accepted complete Submit marks solved", async () => {
  const result: ExecutionResult = {
    attemptId: "a",
    action: "run",
    verdict: "accepted",
    passed: 1,
    total: 1,
    cases: [],
  };
  const started = new Date();
  for (const [action, value] of [
    ["run", result],
    ["submit", { ...result, action: "submit", verdict: "wrong-answer" }],
    ["submit", { ...result, action: "submit", passed: 0 }],
  ] as const) {
    db.practiceProgress.updateMany.mockClear();
    await service.recordExecution(
      "clerk-owner",
      "javascript.sleep",
      "source",
      started,
      action,
      value,
    );
    expect(db.practiceProgress.updateMany).toHaveBeenCalledTimes(1);
    expect(db.practiceProgress.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { lastCode: "source", codeUpdatedAt: started },
      }),
    );
  }
  db.practiceProgress.updateMany.mockClear();
  await service.recordExecution(
    "clerk-owner",
    "javascript.sleep",
    "correct",
    started,
    "submit",
    { ...result, action: "submit" },
  );
  expect(db.practiceProgress.updateMany).toHaveBeenLastCalledWith({
    where: {
      userId: "internal-owner",
      problemId: "javascript.sleep",
      solvedAt: null,
    },
    data: { solvedAt: expect.any(Date) },
  });
  expect(db.practiceProgress.updateMany.mock.calls[0]?.[0]).toMatchObject({
    where: {
      OR: [{ codeUpdatedAt: null }, { codeUpdatedAt: { lte: started } }],
    },
  });
});
