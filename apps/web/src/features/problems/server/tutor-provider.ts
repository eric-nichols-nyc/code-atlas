import "server-only";
import OpenAI from "openai";
import type { ResponseStreamEvent } from "openai/resources/responses/responses";
import {
  TUTOR_LIMITS,
  type TutorEvent,
  utf8Bytes,
} from "../lib/problem-tutor-contract";
import type { TutorPrompt } from "./tutor-context";

export class TutorUnavailable extends Error {
  constructor(
    message = "AI tutor is temporarily unavailable. Please try sending again.",
    public status = 503,
  ) {
    super(message);
  }
}
export type TutorProvider = (
  prompt: TutorPrompt,
  signal: AbortSignal,
) => Promise<AsyncIterable<TutorEvent>>;

export async function* normalizeTutorEvents(
  events: AsyncIterable<ResponseStreamEvent>,
): AsyncGenerator<TutorEvent> {
  let text = "";
  let refused = false;
  for await (const event of events) {
    if (event.type === "response.output_text.delta") {
      text += event.delta;
      if (utf8Bytes(text) > TUTOR_LIMITS.output)
        throw new TutorUnavailable(
          "The tutor reply exceeded its limit. Try a more focused question.",
        );
      yield { type: "delta", text: event.delta };
    } else if (
      event.type === "response.refusal.delta" ||
      event.type === "response.refusal.done"
    ) {
      refused = true;
    } else if (event.type === "response.completed") {
      if (refused || !text.trim())
        throw new TutorUnavailable(
          "The tutor could not answer that question. Try rephrasing it.",
        );
      yield { type: "done" };
      return;
    } else if (
      event.type === "response.failed" ||
      event.type === "response.incomplete" ||
      event.type === "error"
    ) {
      throw new TutorUnavailable(
        "The tutor reply ended early. Try sending again.",
      );
    }
  }
  throw new TutorUnavailable(
    "The tutor connection ended before the reply finished. Try sending again.",
  );
}

export const streamTutor: TutorProvider = async (prompt, signal) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TUTOR_MODEL;
  if (!apiKey?.trim() || !model || !/^[\w.:-]{1,120}$/.test(model))
    throw new TutorUnavailable(
      "AI tutor is not configured. Your code and question are kept.",
    );
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.openai.com/v1",
    maxRetries: 0,
    timeout: TUTOR_LIMITS.timeout,
  });
  const events = await client.responses.create(
    {
      ...prompt,
      model,
      stream: true,
      store: false,
      tools: [],
      max_output_tokens: TUTOR_LIMITS.outputTokens,
      reasoning: { effort: "low" },
    },
    { signal },
  );
  return normalizeTutorEvents(events);
};

export function tutorFailure(error: unknown, signal: AbortSignal) {
  if (signal.aborted)
    return new TutorUnavailable(
      "The tutor request stopped or took too long. Try sending again.",
      408,
    );
  if (error instanceof TutorUnavailable) return error;
  if (error instanceof OpenAI.APIError && error.status === 429)
    return new TutorUnavailable(
      "The tutor is busy. Wait a moment before sending again.",
      429,
    );
  return new TutorUnavailable();
}
