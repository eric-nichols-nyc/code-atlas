import type {
  ExecutionResult,
  ProblemDefinition,
  ProblemInput,
} from "@workspace/problems";
import {
  isObject,
  parseTutorEvent,
  parseTutorRequest,
  TUTOR_LIMITS,
  type TutorEvent,
  type TutorRequest,
  type TutorRunFeedback,
  utf8Bytes,
} from "./problem-tutor-contract";

export class TutorRequestError extends Error {
  constructor(
    message: string,
    public status = 503,
  ) {
    super(message);
  }
}

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

export async function readTutorStream(
  response: Response,
  onEvent: (event: TutorEvent) => void,
  signal: AbortSignal,
) {
  if (!response.ok) {
    let message =
      "AI tutor is temporarily unavailable. Please try sending again.";
    try {
      const value: unknown = await response.json();
      if (isObject(value) && typeof value.error === "string")
        message = value.error;
    } catch {
      /* Keep the recoverable fallback. */
    }
    throw new TutorRequestError(message, response.status);
  }
  if (
    !response.body ||
    !response.headers.get("content-type")?.includes("text/event-stream")
  )
    throw new TutorRequestError(
      "The tutor returned an invalid reply. Try sending again.",
    );
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  try {
    while (true) {
      signal.throwIfAborted();
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      buffer = buffer.replace(/\r\n/g, "\n");
      if (utf8Bytes(buffer) > TUTOR_LIMITS.body)
        throw new TutorRequestError("The tutor reply exceeded its limit.");
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = frame
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (data) {
          const event = parseTutorEvent(JSON.parse(data));
          if (event.type === "error")
            throw new TutorRequestError(event.message);
          if (event.type === "delta") {
            text += event.text;
            if (utf8Bytes(text) > TUTOR_LIMITS.output)
              throw new TutorRequestError(
                "The tutor reply exceeded its limit.",
              );
          }
          if (event.type === "done" && !text.trim())
            throw new TutorRequestError(
              "The tutor returned an empty reply. Try rephrasing your question.",
            );
          onEvent(event);
          if (event.type === "done") return;
        }
        boundary = buffer.indexOf("\n\n");
      }
      if (chunk.done)
        throw new TutorRequestError(
          "The tutor connection ended early. Try sending again.",
        );
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function askProblemTutor(
  problemId: string,
  input: TutorRequest,
  signal: AbortSignal,
  onEvent: (event: TutorEvent) => void,
) {
  const response = await fetch(
    `/api/problems/${encodeURIComponent(problemId)}/tutor`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
      signal,
    },
  );
  await readTutorStream(response, onEvent, signal);
}
