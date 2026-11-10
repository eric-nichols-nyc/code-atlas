import { getAuth } from "@clerk/express";
import {
  type ExecutionResult,
  findProblem,
  MAX_SOURCE_BYTES,
  type ProblemInput,
  validRunInputs,
} from "@workspace/problems";
import { Router } from "express";
import {
  createProgressService,
  type ProgressService,
} from "../progress/service.js";
import {
  type ExecutionJob,
  ExecutionUnavailable,
  executeProblem,
} from "./service.js";
export function executionRoutes(
  execute: typeof executeProblem = executeProblem,
  progress: ProgressService = createProgressService(),
) {
  const router = Router();
  const limits = new Map<
    string,
    { start: number; count: number; pending: number }
  >();
  router.post("/:problemId/:action", async (req, res) => {
    const problem = findProblem(req.params.problemId as string);
    if (!problem || !["run", "submit"].includes(req.params.action as string)) {
      res.status(404).json({ error: "Problem or action unavailable" });
      return;
    }
    const userId = getAuth(req).userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const body = req.body as { code?: unknown; inputs?: unknown };
    if (
      typeof body?.code !== "string" ||
      !body.code.trim() ||
      Buffer.byteLength(body.code, "utf8") > MAX_SOURCE_BYTES
    ) {
      res
        .status(400)
        .json({ error: "Provide JavaScript source up to 32 KiB." });
      return;
    }
    const action = req.params.action as ExecutionJob["action"];
    if (action === "run" && !validRunInputs(problem, body.inputs)) {
      res.status(400).json({
        error: `Use 1–5 test cases. ${problem.inputError}`,
      });
      return;
    }
    const now = Date.now();
    const startedAt = new Date(now);
    for (const [key, entry] of limits)
      if (now - entry.start > 60000 && entry.pending === 0) limits.delete(key);
    let limit = limits.get(userId);
    if (!limit) {
      limit = { start: now, count: 0, pending: 0 };
      limits.set(userId, limit);
    }
    if (limit.count >= 20 || limit.pending >= 2) {
      res
        .status(429)
        .json({ error: "Too many executions. Wait a moment and try again." });
      return;
    }
    limit.count++;
    limit.pending++;
    const controller = new AbortController();
    const abort = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.once("close", abort);
    const save = async (result?: ExecutionResult) => {
      let deadline: ReturnType<typeof setTimeout> | undefined;
      try {
        const stored = await Promise.race([
          progress.recordExecution(
            userId,
            problem.id,
            body.code as string,
            startedAt,
            action,
            result,
          ),
          new Promise<never>((_resolve, reject) => {
            deadline = setTimeout(
              () => reject(new Error("Saving timed out")),
              4000,
            );
          }),
        ]);
        return stored === false ? ("unavailable" as const) : ("saved" as const);
      } catch {
        return "unavailable" as const;
      } finally {
        clearTimeout(deadline);
      }
    };
    try {
      const result = await execute({
        problemId: problem.id,
        code: body.code,
        action,
        inputs:
          action === "run"
            ? (body.inputs as ProblemInput[] | undefined)
            : undefined,
        signal: controller.signal,
      });
      const persistence = await save(result);
      if (!controller.signal.aborted) res.json({ ...result, persistence });
    } catch (error) {
      await save();
      if (!res.headersSent && !controller.signal.aborted)
        res
          .status(
            error instanceof ExecutionUnavailable &&
              error.message.includes("busy")
              ? 429
              : 503,
          )
          .json({
            error:
              error instanceof ExecutionUnavailable
                ? error.message
                : "The runner is unavailable. Your code has been kept.",
          });
    } finally {
      limit.pending--;
      res.off("close", abort);
    }
  });
  return router;
}
