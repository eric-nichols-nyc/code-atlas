import "server-only";
import OpenAI from "openai";
import type { ResponseStreamEvent } from "openai/resources/responses/responses";
import { AI_LIMITS, type AiTextEvent, utf8Bytes } from "../lib/contract";

export interface AiPrompt {
  instructions: string;
  input: { role: "user" | "assistant"; content: string }[];
}
export type AiTextProvider = (
  prompt: AiPrompt,
  signal: AbortSignal,
) => Promise<AsyncIterable<AiTextEvent>>;
export class AiUnavailable extends Error {
  constructor(
    message = "AI is temporarily unavailable. Please try again.",
    public status = 503,
  ) {
    super(message);
  }
}

export async function* normalizeAiEvents(
  events: AsyncIterable<ResponseStreamEvent>,
): AsyncGenerator<AiTextEvent> {
  let text = "";
  let refused = false;
  for await (const event of events) {
    if (event.type === "response.output_text.delta") {
      text += event.delta;
      if (utf8Bytes(text) > AI_LIMITS.output)
        throw new AiUnavailable(
          "The AI reply exceeded its limit. Please try again.",
        );
      yield { type: "delta", text: event.delta };
    } else if (
      event.type === "response.refusal.delta" ||
      event.type === "response.refusal.done"
    ) {
      refused = true;
    } else if (event.type === "response.completed") {
      if (refused || !text.trim())
        throw new AiUnavailable(
          "AI could not complete this request. Please try again.",
        );
      yield { type: "done" };
      return;
    } else if (
      event.type === "response.failed" ||
      event.type === "response.incomplete" ||
      event.type === "error"
    ) {
      throw new AiUnavailable("The AI reply ended early. Please try again.");
    }
  }
  throw new AiUnavailable("The AI connection ended early. Please try again.");
}

// Each real capability supplies configuration; the SDK stays behind this interface.
export function createAiTextProvider(config: {
  modelEnv: string;
  fallbackModelEnv?: string;
  outputTokens: number;
  format?: { name: string; schema: Record<string, unknown> };
}): AiTextProvider {
  return async (prompt, signal) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const model =
      process.env[config.modelEnv]?.trim() ||
      (config.fallbackModelEnv
        ? process.env[config.fallbackModelEnv]?.trim()
        : undefined);
    if (!apiKey?.trim() || !model || !/^[\w.:-]{1,120}$/.test(model))
      throw new AiUnavailable("AI is not configured. Your code is kept.");
    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.openai.com/v1",
      maxRetries: 0,
      timeout: AI_LIMITS.timeout,
    });
    const events = await client.responses.create(
      {
        ...prompt,
        model,
        stream: true,
        store: false,
        tools: [],
        max_output_tokens: config.outputTokens,
        reasoning: { effort: "low" },
        ...(config.format
          ? {
              text: {
                format: {
                  type: "json_schema" as const,
                  strict: true,
                  ...config.format,
                },
              },
            }
          : {}),
      },
      { signal },
    );
    return normalizeAiEvents(events);
  };
}

export function aiFailure(error: unknown, signal: AbortSignal) {
  if (signal.aborted)
    return new AiUnavailable(
      "The AI request stopped or took too long. Please try again.",
      408,
    );
  if (error instanceof AiUnavailable) return error;
  if (error instanceof OpenAI.APIError && error.status === 429)
    return new AiUnavailable(
      "AI is busy. Wait a moment before trying again.",
      429,
    );
  return new AiUnavailable();
}
