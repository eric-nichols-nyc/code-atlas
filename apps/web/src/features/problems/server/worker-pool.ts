import "server-only";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Worker } from "node:worker_threads";

type WorkerPool = { active: number; queue: (() => void)[] };
const processGlobal = globalThis as typeof globalThis & {
  codeAtlasWorkerPool?: WorkerPool;
};
// Both route bundles share capacity when they run in the same process.
processGlobal.codeAtlasWorkerPool ??= { active: 0, queue: [] };
const pool = processGlobal.codeAtlasWorkerPool;

export class ExecutionUnavailable extends Error {
  constructor(
    message: string,
    readonly reason?: "busy" | "cancelled",
  ) {
    super(message);
  }
}

function cancelled() {
  return new ExecutionUnavailable("Execution was cancelled.", "cancelled");
}

export async function runSandboxWorker<Result>({
  name,
  data,
  signal,
  timeoutMs,
  timeoutResult,
}: {
  name: "runner-worker" | "script-worker";
  data: () => object;
  signal?: AbortSignal;
  timeoutMs: number;
  timeoutResult: Result;
}): Promise<Result> {
  if (signal?.aborted) throw cancelled();
  if (pool.active < 2) {
    pool.active++;
  } else {
    if (pool.queue.length >= 8) {
      throw new ExecutionUnavailable(
        "The runner is busy. Try again shortly.",
        "busy",
      );
    }
    await new Promise<void>((start, reject) => {
      const resume = () => {
        signal?.removeEventListener("abort", abort);
        start();
      };
      const abort = () => {
        const index = pool.queue.indexOf(resume);
        if (index >= 0) pool.queue.splice(index, 1);
        reject(cancelled());
      };
      pool.queue.push(resume);
      signal?.addEventListener("abort", abort, { once: true });
    });
  }

  try {
    if (signal?.aborted) throw cancelled();
    return await new Promise<Result>((complete, reject) => {
      const asset = `.workers/${name}.js`;
      const local = resolve(process.cwd(), asset);
      const worker = new Worker(
        existsSync(local) ? local : resolve(process.cwd(), "apps/web", asset),
        {
          workerData: data(),
          env: {},
          execArgv: [],
          resourceLimits: {
            maxOldGenerationSizeMb: 64,
            maxYoungGenerationSizeMb: 16,
            stackSizeMb: 4,
          },
        },
      );
      let settled = false;
      const finish = (settle: () => void) => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        signal?.removeEventListener("abort", abort);
        // Release the slot only after the worker has stopped.
        void worker.terminate().then(settle, settle);
      };
      const fail = (error: ExecutionUnavailable) => finish(() => reject(error));
      const abort = () => fail(cancelled());
      const watchdog = setTimeout(
        () => finish(() => complete(timeoutResult)),
        timeoutMs,
      );
      worker.once(
        "message",
        (message: { result: Result } | { error: string }) => {
          if ("error" in message) fail(new ExecutionUnavailable(message.error));
          else finish(() => complete(message.result));
        },
      );
      worker.once("error", () =>
        fail(
          new ExecutionUnavailable(
            "The execution worker is unavailable. Please retry.",
          ),
        ),
      );
      worker.once("exit", () =>
        fail(
          new ExecutionUnavailable(
            "The execution worker stopped. Please retry.",
          ),
        ),
      );
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted) abort();
    });
  } finally {
    const resume = pool.queue.shift();
    if (resume) resume();
    else pool.active--;
  }
}
