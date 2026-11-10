export const MAX_SOURCE_BYTES = 32 * 1024;
export const verdicts = [
  "accepted",
  "wrong-answer",
  "compile-error",
  "runtime-error",
  "time-limit-exceeded",
] as const;
export type Verdict = (typeof verdicts)[number];
export type ExecutionAction = "run" | "submit";
export interface CaseResult {
  id: string;
  passed: boolean;
  verdict: Verdict;
  input?: number;
  elapsedMs?: number;
  message: string;
  logs: string[];
  hidden: boolean;
}
export interface ExecutionResult {
  attemptId: string;
  action: ExecutionAction;
  verdict: Verdict;
  passed: number;
  total: number;
  cases: CaseResult[];
}
export interface ProblemDefinition {
  id: string;
  slug: string;
  subjectId: string;
  topicId: "basics" | "functions" | "async";
  title: string;
  summary: string;
  difficulty: string;
  entryFunction: string;
  starterCode: string;
  samples: { id: string; millis: number; explanation: string }[];
  constraints: string[];
  hints: string[];
  solution: string;
  solutionExplanation: string;
}
export const sleepProblem: ProblemDefinition = {
  id: "javascript.sleep",
  slug: "sleep",
  subjectId: "javascript",
  topicId: "async",
  title: "Sleep",
  summary: "Build a Promise-based delay with JavaScript timers.",
  difficulty: "Easy",
  entryFunction: "sleep",
  starterCode: `/**\n * @param {number} millis\n * @return {Promise<void>}\n */\nasync function sleep(millis) {\n  // Resolve a Promise after millis milliseconds.\n}\n`,
  samples: [
    {
      id: "sample-1",
      millis: 100,
      explanation:
        "The returned Promise should settle about 100 milliseconds after the call.",
    },
    {
      id: "sample-2",
      millis: 200,
      explanation: "Waiting twice as long should take about 200 milliseconds.",
    },
  ],
  constraints: [
    "millis is an integer between 1 and 1000, inclusive.",
    "Return a Promise; its resolved value can be anything.",
    "Use asynchronous timing. Small scheduling delays are allowed.",
    "This workspace supports single-file JavaScript with bounded timers and console output; external modules are unavailable.",
  ],
  hints: [
    "A Promise can stay pending until a callback calls resolve.",
    "setTimeout schedules a callback after the requested delay. Pass resolve as that callback.",
  ],
  solution: `function sleep(millis) {\n  return new Promise((resolve) => {\n    setTimeout(resolve, millis);\n  });\n}`,
  solutionExplanation:
    "The Promise starts pending. setTimeout schedules resolve, so the caller can await the delay without blocking the JavaScript thread. Returning the Promise lets the caller observe when the wait finishes.",
};
export const publicProblems = [sleepProblem];
export function findProblem(slugOrId: string) {
  return publicProblems.find((p) => p.slug === slugOrId || p.id === slugOrId);
}
export function validMillis(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 1000
  );
}
export function isExecutionResult(value: unknown): value is ExecutionResult {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.attemptId === "string" &&
    (r.action === "run" || r.action === "submit") &&
    verdicts.includes(r.verdict as Verdict) &&
    Number.isInteger(r.passed) &&
    Number.isInteger(r.total) &&
    Array.isArray(r.cases) &&
    r.cases.every(
      (c) =>
        c &&
        typeof c === "object" &&
        typeof c.id === "string" &&
        typeof c.passed === "boolean" &&
        verdicts.includes(c.verdict) &&
        typeof c.message === "string" &&
        typeof c.hidden === "boolean" &&
        Array.isArray(c.logs) &&
        c.logs.every((x: unknown) => typeof x === "string"),
    )
  );
}
