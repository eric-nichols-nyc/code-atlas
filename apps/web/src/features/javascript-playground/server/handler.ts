import "server-only";
import { MAX_SOURCE_BYTES } from "@workspace/problems";
import { ExecutionUnavailable } from "@/features/problems/server/worker-pool";
import { json, readJson, requireLearner } from "@/server/http";
import { runPlaygroundScript } from "./service";

// JSON can escape each source byte to six ASCII characters.
const bodyLimit = 6 * MAX_SOURCE_BYTES + 128;
const rateWindowMs = 60_000;

export function createPlaygroundRunHandler(execute = runPlaygroundScript) {
  const limits = new Map<
    string,
    { start: number; count: number; pending: boolean }
  >();

  return async function run(request: Request) {
    const learner = await requireLearner(request);
    if (learner instanceof Response) return learner;

    let body: unknown;
    try {
      body = await readJson(request, bodyLimit);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }
    if (
      !body ||
      typeof body !== "object" ||
      Object.keys(body).length !== 1 ||
      !("code" in body) ||
      typeof body.code !== "string" ||
      !body.code.trim() ||
      Buffer.byteLength(body.code, "utf8") > MAX_SOURCE_BYTES
    )
      return json({ error: "Provide JavaScript source up to 32 KiB." }, 400);

    const now = Date.now();
    for (const [key, entry] of limits)
      if (!entry.pending && now - entry.start >= rateWindowMs)
        limits.delete(key);
    let limit = limits.get(learner);
    if (!limit) {
      limit = { start: now, count: 0, pending: false };
      limits.set(learner, limit);
    }
    if (limit.pending || limit.count >= 10)
      return json(
        { error: "Too many runs. Wait a moment and try again." },
        429,
      );

    limit.count++;
    limit.pending = true;
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(20_000),
    ]);
    try {
      return json(await execute(body.code, signal));
    } catch (error) {
      if (error instanceof ExecutionUnavailable && error.reason === "busy")
        return json({ error: error.message }, 429);
      return json(
        { error: "The runner is unavailable. Your draft is still here." },
        503,
      );
    } finally {
      limit.pending = false;
    }
  };
}
