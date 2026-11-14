import {
  MAX_SOURCE_BYTES,
  type ProblemDefinition,
  type ProblemInput,
  type Verdict,
  validProblemInput,
  verdicts,
} from "@workspace/problems";

export const TUTOR_LIMITS = {
  body: 128 * 1024,
  question: 4 * 1024,
  history: 16 * 1024,
  historyMessages: 8,
  feedback: 8 * 1024,
  problem: 16 * 1024,
  prompt: 96 * 1024,
  output: 64 * 1024,
  outputTokens: 2000,
  timeout: 60000,
} as const;
export const utf8Bytes = (text: string) =>
  new TextEncoder().encode(text).length;
export const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const only = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).every((key) => keys.includes(key));
export class TutorInputError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export interface TutorHistoryMessage {
  role: "user" | "assistant";
  content: string;
}
export interface TutorRunFeedback {
  verdict: Verdict;
  passed: number;
  total: number;
  cases: {
    hidden: false;
    input?: ProblemInput;
    expected?: unknown;
    actual?: unknown;
    message: string;
    logs: string[];
  }[];
}
export interface TutorRequest {
  question: string;
  code: string;
  history: TutorHistoryMessage[];
  runFeedback?: TutorRunFeedback;
  feedbackOmitted?: boolean;
}
export type TutorEvent =
  | { type: "start" }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export function trimTutorHistory(messages: TutorHistoryMessage[]) {
  let history = messages.slice(-TUTOR_LIMITS.historyMessages);
  while (
    history.length &&
    utf8Bytes(JSON.stringify(history)) > TUTOR_LIMITS.history
  )
    history = history.slice(2);
  return { history, trimmed: history.length !== messages.length };
}

// Diagnostics are data, restricted to the published judges' numeric output shapes.
function diagnosticValue(value: unknown, depth = 0): boolean {
  if (depth > 20) return false;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value))
    return (
      value.length <= 1000 && value.every((v) => diagnosticValue(v, depth + 1))
    );
  if (!isObject(value)) return false;
  if (
    only(value, ["values", "callCount"]) &&
    "values" in value &&
    "callCount" in value
  )
    return (
      Array.isArray(value.values) &&
      diagnosticValue(value.values, depth + 1) &&
      Number.isInteger(value.callCount)
    );
  if (only(value, ["t", "value"]) && "t" in value && "value" in value)
    return (
      diagnosticValue(value.t, depth + 1) &&
      diagnosticValue(value.value, depth + 1)
    );
  if (only(value, ["t", "inputs"]) && "t" in value && "inputs" in value)
    return (
      diagnosticValue(value.t, depth + 1) &&
      Array.isArray(value.inputs) &&
      diagnosticValue(value.inputs, depth + 1)
    );
  return false;
}

export function parseTutorRequest(
  value: unknown,
  problem: ProblemDefinition,
): TutorRequest {
  if (
    !isObject(value) ||
    !only(value, [
      "question",
      "code",
      "history",
      "runFeedback",
      "feedbackOmitted",
    ])
  )
    throw new TutorInputError(
      "Provide only a question, code and recent tutor context.",
    );
  if (typeof value.question !== "string" || !value.question.trim())
    throw new TutorInputError("Enter a question for the tutor.");
  if (utf8Bytes(value.question) > TUTOR_LIMITS.question)
    throw new TutorInputError("Keep your question within 4 KiB.");
  if (
    typeof value.code !== "string" ||
    utf8Bytes(value.code) > MAX_SOURCE_BYTES
  )
    throw new TutorInputError(
      "Tutor code must fit within 32 KiB. Your edits are kept.",
    );
  if (
    !Array.isArray(value.history) ||
    value.history.length > TUTOR_LIMITS.historyMessages ||
    value.history.length % 2 ||
    utf8Bytes(JSON.stringify(value.history)) > TUTOR_LIMITS.history
  )
    throw new TutorInputError("Recent tutor history is too large or invalid.");
  const history = value.history.map((message, index): TutorHistoryMessage => {
    if (
      !isObject(message) ||
      !only(message, ["role", "content"]) ||
      message.role !== (index % 2 ? "assistant" : "user") ||
      typeof message.content !== "string" ||
      !message.content.trim()
    )
      throw new TutorInputError(
        "Provide completed question and answer pairs only.",
      );
    return { role: index % 2 ? "assistant" : "user", content: message.content };
  });
  if (
    value.feedbackOmitted !== undefined &&
    typeof value.feedbackOmitted !== "boolean"
  )
    throw new TutorInputError("Invalid tutor context status.");
  let runFeedback: TutorRunFeedback | undefined;
  if (value.runFeedback !== undefined) {
    const feedback = value.runFeedback;
    if (
      !isObject(feedback) ||
      !only(feedback, ["verdict", "passed", "total", "cases"]) ||
      !verdicts.includes(feedback.verdict as Verdict) ||
      !Number.isInteger(feedback.total) ||
      (feedback.total as number) < 1 ||
      (feedback.total as number) > 5 ||
      !Number.isInteger(feedback.passed) ||
      (feedback.passed as number) < 0 ||
      (feedback.passed as number) > (feedback.total as number) ||
      !Array.isArray(feedback.cases) ||
      feedback.cases.length > 5 ||
      utf8Bytes(JSON.stringify(feedback)) > TUTOR_LIMITS.feedback
    )
      throw new TutorInputError(
        "Visible Run feedback is invalid or too large.",
      );
    const cases = feedback.cases.map((item) => {
      if (
        !isObject(item) ||
        !only(item, [
          "hidden",
          "input",
          "expected",
          "actual",
          "message",
          "logs",
        ]) ||
        item.hidden !== false ||
        (item.input !== undefined && !validProblemInput(problem, item.input)) ||
        (item.expected !== undefined && !diagnosticValue(item.expected)) ||
        (item.actual !== undefined && !diagnosticValue(item.actual)) ||
        typeof item.message !== "string" ||
        !Array.isArray(item.logs) ||
        !item.logs.every((line) => typeof line === "string")
      )
        throw new TutorInputError(
          "Only visible Run diagnostics can be included.",
        );
      return {
        hidden: false as const,
        ...(item.input !== undefined
          ? { input: item.input as ProblemInput }
          : {}),
        ...(item.expected !== undefined ? { expected: item.expected } : {}),
        ...(item.actual !== undefined ? { actual: item.actual } : {}),
        message: item.message,
        logs: item.logs as string[],
      };
    });
    runFeedback = {
      verdict: feedback.verdict as Verdict,
      passed: feedback.passed as number,
      total: feedback.total as number,
      cases,
    };
  }
  return {
    question: value.question,
    code: value.code,
    history,
    ...(runFeedback ? { runFeedback } : {}),
    ...(value.feedbackOmitted === true ? { feedbackOmitted: true } : {}),
  };
}

export function parseTutorEvent(value: unknown): TutorEvent {
  if (!isObject(value)) throw new Error("The tutor returned an invalid reply.");
  if (
    (value.type === "start" || value.type === "done") &&
    only(value, ["type"])
  )
    return { type: value.type };
  if (
    value.type === "delta" &&
    typeof value.text === "string" &&
    only(value, ["type", "text"])
  )
    return { type: "delta", text: value.text };
  if (
    value.type === "error" &&
    typeof value.message === "string" &&
    only(value, ["type", "message"])
  )
    return { type: "error", message: value.message };
  throw new Error("The tutor returned an invalid reply.");
}
