import "server-only";
import { randomUUID } from "node:crypto";
import {
  type CaseResult,
  type ExecutionAction,
  type ExecutionResult,
  findProblem,
  type ProblemInput,
  sleepProblem,
  validRunInputs,
} from "@workspace/problems";
import { catalogAlgorithmJudges } from "./catalog-algorithms";
import { privateSuites } from "./private-suites";
import { ExecutionUnavailable, runSandboxWorker } from "./worker-pool";

export { ExecutionUnavailable };

export interface ExecutionJob {
  problemId?: string;
  code: string;
  action: ExecutionAction;
  inputs?: ProblemInput[];
  signal?: AbortSignal;
}

export async function executeProblem(
  job: ExecutionJob,
): Promise<ExecutionResult> {
  const problem = findProblem(job.problemId ?? sleepProblem.id);
  if (
    !problem ||
    (job.action === "run" && !validRunInputs(problem, job.inputs))
  )
    throw new ExecutionUnavailable("Problem or test inputs are invalid.");
  const visible = (
    job.action === "run"
      ? (job.inputs ?? problem.samples.map((x) => x.input))
      : problem.samples.map((x) => x.input)
  ).map((input, i) => ({ id: `case-${i + 1}`, input, hidden: false }));
  const catalogJudge =
    problem.kind === "catalog-algorithm"
      ? catalogAlgorithmJudges[problem.id]
      : undefined;
  if (problem.kind === "catalog-algorithm" && !catalogJudge)
    throw new ExecutionUnavailable("The problem judge is unavailable.");
  const privateInputs =
    problem.kind === "catalog-algorithm"
      ? (catalogJudge?.inputs ?? [])
      : privateSuites[problem.kind];
  const tests =
    job.action === "submit"
      ? [
          ...visible,
          ...privateInputs.map((input, i) => ({
            id: `hidden-${i + 1}`,
            input,
            hidden: true,
            independent: problem.kind === "counter" && i === 6,
          })),
        ]
      : visible;
  const result = await runSandboxWorker<CaseResult[]>({
    name: "runner-worker",
    data: () => ({
      problemId: problem.id,
      entryFunction: problem.entryFunction,
      code: job.code,
      action: job.action,
      cases: catalogJudge
        ? tests.map((test) => {
            if (typeof test.input === "number" || !("args" in test.input))
              throw new ExecutionUnavailable("Invalid problem input.");
            return {
              ...test,
              catalogTarget: {
                expected: catalogJudge.expected(test.input.args),
                mode: catalogJudge.mode,
                entryCpuBudgetMs: catalogJudge.entryCpuBudgetMs,
              },
            };
          })
        : tests,
    }),
    signal: job.signal,
    timeoutMs: 10_000,
    timeoutResult: [
      {
        id: "execution-limit",
        passed: false,
        verdict: "time-limit-exceeded",
        message: "Execution exceeded the overall time limit.",
        logs: [],
        hidden: true,
      },
    ],
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
}
