import { randomUUID } from "node:crypto";
import { Worker } from "node:worker_threads";
import {
  type CaseResult,
  type ExecutionAction,
  type ExecutionResult,
  sleepProblem,
} from "@workspace/problems";
export interface ExecutionJob {
  code: string;
  action: ExecutionAction;
  inputs?: number[];
  signal?: AbortSignal;
}
// Private full-suite inputs never enter the public content package or web payload.
const privateInputs = [1, 15, 40, 125, 333, 500, 750, 1000];
let active = 0;
const queue: (() => void)[] = [];
export class ExecutionUnavailable extends Error {}
export async function executeProblem(
  job: ExecutionJob,
): Promise<ExecutionResult> {
  if (job.signal?.aborted)
    throw new ExecutionUnavailable("Execution was cancelled.");
  if (active >= 2) {
    if (queue.length >= 8)
      throw new ExecutionUnavailable("The runner is busy. Try again shortly.");
    await new Promise<void>((resolve, reject) => {
      const start = () => {
        job.signal?.removeEventListener("abort", abort);
        resolve();
      };
      const abort = () => {
        const index = queue.indexOf(start);
        if (index >= 0) queue.splice(index, 1);
        reject(new ExecutionUnavailable("Execution was cancelled."));
      };
      queue.push(start);
      job.signal?.addEventListener("abort", abort, { once: true });
    });
  }
  active++;
  try {
    const visible = (
      job.action === "run"
        ? (job.inputs ?? sleepProblem.samples.map((x) => x.millis))
        : sleepProblem.samples.map((x) => x.millis)
    ).map((millis, i) => ({ id: `case-${i + 1}`, millis, hidden: false }));
    const tests =
      job.action === "submit"
        ? [
            ...visible,
            ...privateInputs.map((millis, i) => ({
              id: `hidden-${i + 1}`,
              millis,
              hidden: true,
            })),
          ]
        : visible;
    const result = await new Promise<CaseResult[]>((resolve, reject) => {
      const path = import.meta.url.endsWith(".ts")
        ? "./runner-worker.ts"
        : "./runner-worker.js";
      const worker = new Worker(new URL(path, import.meta.url), {
        workerData: { code: job.code, action: job.action, cases: tests },
        env: {},
        execArgv: [],
        resourceLimits: {
          maxOldGenerationSizeMb: 64,
          maxYoungGenerationSizeMb: 16,
          stackSizeMb: 4,
        },
      });
      let settled = false;
      const finish = (error?: Error, cases?: CaseResult[]) => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        job.signal?.removeEventListener("abort", abort);
        void worker.terminate();
        if (error) reject(error);
        else resolve(cases ?? []);
      };
      const abort = () =>
        finish(new ExecutionUnavailable("Execution was cancelled."));
      const watchdog = setTimeout(
        () =>
          finish(undefined, [
            {
              id: "execution-limit",
              passed: false,
              verdict: "time-limit-exceeded",
              message: "Execution exceeded the overall time limit.",
              logs: [],
              hidden: true,
            },
          ]),
        10000,
      );
      job.signal?.addEventListener("abort", abort, { once: true });
      if (job.signal?.aborted) abort();
      worker.once(
        "message",
        (message: { cases?: CaseResult[]; error?: string }) =>
          message.error
            ? finish(new ExecutionUnavailable(message.error))
            : finish(undefined, message.cases),
      );
      worker.once("error", () =>
        finish(
          new ExecutionUnavailable(
            "The execution worker is unavailable. Please retry.",
          ),
        ),
      );
      worker.once("exit", () => {
        if (!settled)
          finish(
            new ExecutionUnavailable(
              "The execution worker stopped. Please retry.",
            ),
          );
      });
    });
    const failed = result.find((c) => !c.passed);
    return {
      attemptId: randomUUID(),
      action: job.action,
      verdict:
        failed?.verdict ??
        (result.length === tests.length ? "accepted" : "runtime-error"),
      passed: result.filter((c) => c.passed).length,
      total: tests.length,
      cases: result,
    };
  } finally {
    active--;
    queue.shift()?.();
  }
}
