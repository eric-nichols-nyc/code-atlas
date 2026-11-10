import { randomUUID } from "node:crypto";
import { Worker } from "node:worker_threads";
import {
  type CaseResult,
  type ExecutionAction,
  type ExecutionResult,
  findProblem,
  type ProblemInput,
  sleepProblem,
  validRunInputs,
} from "@workspace/problems";
export interface ExecutionJob {
  problemId?: string;
  code: string;
  action: ExecutionAction;
  inputs?: ProblemInput[];
  signal?: AbortSignal;
}

import { privateSuites } from "./private-suites.js";

let active = 0;
const queue: (() => void)[] = [];
export class ExecutionUnavailable extends Error {}
export async function executeProblem(
  job: ExecutionJob,
): Promise<ExecutionResult> {
  const problem = findProblem(job.problemId ?? sleepProblem.id);
  if (
    !problem ||
    (job.action === "run" && !validRunInputs(problem, job.inputs))
  )
    throw new ExecutionUnavailable("Problem or test inputs are invalid.");
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
        ? (job.inputs ?? problem.samples.map((x) => x.input))
        : problem.samples.map((x) => x.input)
    ).map((input, i) => ({ id: `case-${i + 1}`, input, hidden: false }));
    const tests =
      job.action === "submit"
        ? [
            ...visible,
            ...privateSuites[problem.kind].map((input, i) => ({
              id: `hidden-${i + 1}`,
              input,
              hidden: true,
              independent: problem.kind === "counter" && i === 6,
            })),
          ]
        : visible;
    const result = await new Promise<CaseResult[]>((resolve, reject) => {
      const path = import.meta.url.endsWith(".ts")
        ? "./runner-worker.ts"
        : "./runner-worker.js";
      const worker = new Worker(new URL(path, import.meta.url), {
        workerData: {
          problemId: problem.id,
          entryFunction: problem.entryFunction,
          code: job.code,
          action: job.action,
          cases: tests,
        },
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
