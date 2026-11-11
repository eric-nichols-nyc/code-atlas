import "server-only";
import { getDb } from "@workspace/db";
import type { ExecutionAction, ExecutionResult } from "@workspace/problems";

const summary = {
  problemId: true,
  flagged: true,
  solvedAt: true,
  legacyCompleted: true,
} as const;
const detail = { ...summary, lastCode: true, codeUpdatedAt: true } as const;

export function createProgressService(database = getDb) {
  const user = async (neonUserId: string) => {
    if (!neonUserId) throw new Error("Verified identity required");
    const db = database();
    const owner = await db.user.upsert({
      where: { neonUserId },
      create: { neonUserId },
      update: { neonUserId },
      select: { id: true },
    });
    return { db, userId: owner.id };
  };
  return {
    async list(neonUserId: string) {
      const { db, userId } = await user(neonUserId);
      return db.practiceProgress.findMany({
        where: { userId },
        select: summary,
      });
    },
    async read(neonUserId: string, problemId: string) {
      const { db, userId } = await user(neonUserId);
      return db.practiceProgress.findUnique({
        where: { userId_problemId: { userId, problemId } },
        select: detail,
      });
    },
    async flag(neonUserId: string, problemId: string, flagged: boolean) {
      const { db, userId } = await user(neonUserId);
      return db.practiceProgress.upsert({
        where: { userId_problemId: { userId, problemId } },
        create: { userId, problemId, flagged },
        update: { flagged },
        select: summary,
      });
    },
    async importLegacy(
      neonUserId: string,
      flagged: string[],
      solved: string[],
    ) {
      const { db, userId } = await user(neonUserId);
      const ids = [...new Set([...flagged, ...solved])];
      if (ids.length) {
        await db.$transaction([
          db.practiceProgress.createMany({
            data: ids.map((problemId) => ({
              userId,
              problemId,
              flagged: flagged.includes(problemId),
              legacyCompleted: solved.includes(problemId),
            })),
            skipDuplicates: true,
          }),
          // Never restore an old flag over an existing account choice, or trust
          // browser completion as a server-judged solved result.
          db.practiceProgress.updateMany({
            where: { userId, problemId: { in: solved } },
            data: { legacyCompleted: true },
          }),
        ]);
      }
      return db.practiceProgress.findMany({
        where: { userId },
        select: summary,
      });
    },
    async recordExecution(
      neonUserId: string,
      problemId: string,
      code: string,
      startedAt: Date,
      action: ExecutionAction,
      result?: ExecutionResult,
    ) {
      const { db, userId } = await user(neonUserId);
      await db.practiceProgress.upsert({
        where: { userId_problemId: { userId, problemId } },
        create: { userId, problemId, lastCode: code, codeUpdatedAt: startedAt },
        update: { problemId },
        select: { id: true },
      });
      // Execution completion order must not overwrite a newer requested source.
      const codeWrite = await db.practiceProgress.updateMany({
        where: {
          userId,
          problemId,
          OR: [{ codeUpdatedAt: null }, { codeUpdatedAt: { lte: startedAt } }],
        },
        data: { lastCode: code, codeUpdatedAt: startedAt },
      });
      if (
        action === "submit" &&
        result?.action === "submit" &&
        result.verdict === "accepted" &&
        result.total > 0 &&
        result.passed === result.total
      ) {
        await db.practiceProgress.updateMany({
          where: { userId, problemId, solvedAt: null },
          data: { solvedAt: new Date() },
        });
      }
      return codeWrite.count > 0;
    },
  };
}
export type ProgressService = ReturnType<typeof createProgressService>;
