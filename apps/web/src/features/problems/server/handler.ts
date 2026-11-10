import "server-only";
import {
  type ExecutionResult,
  findProblem,
  MAX_SOURCE_BYTES,
  type ProblemInput,
  validRunInputs,
} from "@workspace/problems";
import {
  createProgressService,
  type ProgressService,
} from "@/features/catalog/server/progress-service";
import { json, readJson, requireLearner } from "@/server/http";
import {
  type ExecutionJob,
  ExecutionUnavailable,
  executeProblem,
} from "./service";

type Context = { params: Promise<{ problemId: string; action: string }> };
export function createExecutionHandler(
  services: {
    execute?: typeof executeProblem;
    progress?: ProgressService;
  } = {},
) {
  const execute = services.execute ?? executeProblem;
  const progress = services.progress ?? createProgressService();
  // Limits are per Node process, just as in the former Express service.
  const limits = new Map<
    string,
    { start: number; count: number; pending: number }
  >();
  return async function handleExecution(request: Request, context: Context) {
    const userId = await requireLearner(request);
    if (userId instanceof Response) return userId;
    const { problemId, action } = await context.params;
    const problem = findProblem(problemId);
    if (!problem || (action !== "run" && action !== "submit"))
      return json({ error: "Problem or action unavailable." }, 404);
    let value: unknown;
    try {
      value = await readJson(request, 64 * 1024);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }
    const body = value as { code?: unknown; inputs?: unknown } | null;
    if (
      typeof body?.code !== "string" ||
      !body.code.trim() ||
      Buffer.byteLength(body.code, "utf8") > MAX_SOURCE_BYTES
    )
      return json({ error: "Provide JavaScript source up to 32 KiB." }, 400);
    if (action === "run" && !validRunInputs(problem, body.inputs))
      return json({ error: `Use 1–5 test cases. ${problem.inputError}` }, 400);
    const now = Date.now();
    const startedAt = new Date(now);
    for (const [key, entry] of limits)
      if (now - entry.start > 60000 && entry.pending === 0) limits.delete(key);
    let limit = limits.get(userId);
    if (!limit) {
      limit = { start: now, count: 0, pending: 0 };
      limits.set(userId, limit);
    }
    if (limit.count >= 20 || limit.pending >= 2)
      return json(
        { error: "Too many executions. Wait a moment and try again." },
        429,
      );
    limit.count++;
    limit.pending++;
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
        action: action as ExecutionJob["action"],
        inputs:
          action === "run"
            ? (body.inputs as ProblemInput[] | undefined)
            : undefined,
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(20000)]),
      });
      return json({ ...result, persistence: await save(result) });
    } catch (error) {
      await save();
      return json(
        {
          error:
            error instanceof ExecutionUnavailable
              ? error.message
              : "The runner is unavailable. Your code has been kept.",
        },
        error instanceof ExecutionUnavailable && error.message.includes("busy")
          ? 429
          : 503,
      );
    } finally {
      limit.pending--;
    }
  };
}
