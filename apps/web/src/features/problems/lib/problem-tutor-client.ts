import type {
  ExecutionResult,
  ProblemDefinition,
  ProblemInput,
} from "@workspace/problems";
import { readAiTextStream } from "@/features/ai/lib/stream-client";

export {
  AiRequestError as TutorRequestError,
  readAiTextStream as readTutorStream,
} from "@/features/ai/lib/stream-client";

import {
  parseTutorRequest,
  type TutorEvent,
  type TutorRequest,
  type TutorRunFeedback,
} from "./problem-tutor-contract";

export function visibleTutorFeedback(
  problem: ProblemDefinition,
  code: string,
  inputs: (ProblemInput | undefined)[],
  latest: {
    source: string;
    inputs: ProblemInput[];
    result: ExecutionResult;
  } | null,
) {
  if (!latest) return {};
  // Submit/hidden results and diagnostics for older code or inputs stay out.
  if (
    latest.source !== code ||
    latest.result.action !== "run" ||
    inputs.some((input) => input === undefined) ||
    JSON.stringify(latest.inputs) !== JSON.stringify(inputs) ||
    latest.result.cases.some((item) => item.hidden)
  )
    return { feedbackOmitted: true };
  const feedback: TutorRunFeedback = {
    verdict: latest.result.verdict,
    passed: latest.result.passed,
    total: latest.result.total,
    cases: latest.result.cases.map((item) => ({
      hidden: false,
      ...(item.input !== undefined ? { input: item.input } : {}),
      ...(item.expected !== undefined ? { expected: item.expected } : {}),
      ...(item.actual !== undefined ? { actual: item.actual } : {}),
      message: item.message,
      logs: item.logs,
    })),
  };
  try {
    return {
      runFeedback: parseTutorRequest(
        { question: "context", code, history: [], runFeedback: feedback },
        problem,
      ).runFeedback,
    };
  } catch {
    return { feedbackOmitted: true };
  }
}

export async function askProblemTutor(
  problemId: string,
  input: TutorRequest,
  signal: AbortSignal,
  onEvent: (event: TutorEvent) => void,
  endpoint = `/api/problems/${encodeURIComponent(problemId)}/tutor`,
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
    signal,
  });
  await readAiTextStream(response, onEvent, signal);
}
