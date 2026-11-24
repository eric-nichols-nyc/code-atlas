import {
  isObject,
  parseTutorRequest,
  TutorInputError,
  utf8Bytes,
} from "@/features/problems/lib/problem-tutor-contract";

export const PLAYGROUND_TUTOR_ID = "javascript.playground";

export function parsePlaygroundTutorRequest(value: unknown) {
  if (!isObject(value) || "feedbackOmitted" in value)
    throw new TutorInputError(
      "Provide a question, code, recent dialogue and an optional run error.",
    );
  const { runError, ...base } = value;
  const request = parseTutorRequest(base);
  if (
    runError !== undefined &&
    (typeof runError !== "string" ||
      !runError.trim() ||
      utf8Bytes(runError) > 2048)
  )
    throw new TutorInputError(
      "The Playground run error is invalid or too large.",
    );
  return { ...request, ...(runError !== undefined ? { runError } : {}) };
}
