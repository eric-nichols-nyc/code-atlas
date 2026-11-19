// This browser-safe contract never imports a provider SDK or server configuration.
export const AI_LIMITS = {
  body: 128 * 1024,
  output: 64 * 1024,
  timeout: 60000,
} as const;
export const utf8Bytes = (text: string) =>
  new TextEncoder().encode(text).length;
export const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
export class AiInputError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export type AiTextEvent =
  | { type: "start" }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export function parseAiTextEvent(value: unknown): AiTextEvent {
  if (isObject(value)) {
    const keys = Object.keys(value).sort().join(",");
    if ((value.type === "start" || value.type === "done") && keys === "type")
      return { type: value.type };
    if (
      value.type === "delta" &&
      typeof value.text === "string" &&
      keys === "text,type"
    )
      return { type: "delta", text: value.text };
    if (
      value.type === "error" &&
      typeof value.message === "string" &&
      keys === "message,type"
    )
      return { type: "error", message: value.message };
  }
  throw new Error("AI returned an invalid reply. Please try again.");
}
