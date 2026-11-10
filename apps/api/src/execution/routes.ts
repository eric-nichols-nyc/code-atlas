import { getAuth } from "@clerk/express";
import {
  MAX_SOURCE_BYTES,
  sleepProblem,
  validMillis,
} from "@workspace/problems";
import { Router } from "express";
import {
  type ExecutionJob,
  ExecutionUnavailable,
  executeProblem,
} from "./service.js";
export function executionRoutes(
  execute: typeof executeProblem = executeProblem,
) {
  const router = Router();
  const limits = new Map<
    string,
    { start: number; count: number; pending: number }
  >();
  router.post("/:problemId/:action", async (req, res) => {
    if (
      req.params.problemId !== sleepProblem.id ||
      !["run", "submit"].includes(req.params.action as string)
    ) {
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
    if (
      action === "run" &&
      body.inputs !== undefined &&
      (!Array.isArray(body.inputs) ||
        body.inputs.length < 1 ||
        body.inputs.length > 5 ||
        !body.inputs.every(validMillis))
    ) {
      res.status(400).json({
        error: "Use 1–5 test cases with integer delays from 1 to 1000ms.",
      });
      return;
    }
    const now = Date.now();
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
    try {
      res.json(
        await execute({
          code: body.code,
          action,
          inputs:
            action === "run"
              ? (body.inputs as number[] | undefined)
              : undefined,
          signal: controller.signal,
        }),
      );
    } catch (error) {
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
