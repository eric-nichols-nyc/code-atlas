import {
  AI_LIMITS,
  type AiTextEvent,
  isObject,
  parseAiTextEvent,
  utf8Bytes,
} from "./contract";

export class AiRequestError extends Error {
  constructor(
    message: string,
    public status = 503,
  ) {
    super(message);
  }
}

export async function readAiTextStream(
  response: Response,
  onEvent: (event: AiTextEvent) => void,
  signal: AbortSignal,
) {
  if (!response.ok) {
    let message = "AI is temporarily unavailable. Please try again.";
    try {
      const value: unknown = await response.json();
      if (isObject(value) && typeof value.error === "string")
        message = value.error;
    } catch {
      /* Keep the recoverable fallback. */
    }
    throw new AiRequestError(message, response.status);
  }
  if (
    !response.body ||
    !response.headers.get("content-type")?.includes("text/event-stream")
  )
    throw new AiRequestError(
      "The AI returned an invalid reply. Please try again.",
    );
  const reader = response.body.getReader();
  const cancel = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  // Network chunks can split both UTF-8 characters and SSE frames.
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  try {
    while (true) {
      signal.throwIfAborted();
      const chunk = await reader.read();
      signal.throwIfAborted();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      buffer = buffer.replace(/\r\n/g, "\n");
      if (utf8Bytes(buffer) > AI_LIMITS.body)
        throw new AiRequestError("The AI reply exceeded its limit.");
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
          const event = parseAiTextEvent(JSON.parse(data));
          if (event.type === "error") throw new AiRequestError(event.message);
          if (event.type === "delta") {
            text += event.text;
            if (utf8Bytes(text) > AI_LIMITS.output)
              throw new AiRequestError("The AI reply exceeded its limit.");
          }
          if (event.type === "done" && !text.trim())
            throw new AiRequestError(
              "The AI returned an empty reply. Please try again.",
            );
          onEvent(event);
          if (event.type === "done") return;
        }
        boundary = buffer.indexOf("\n\n");
      }
      if (chunk.done)
        throw new AiRequestError(
          "The AI connection ended early. Please try again.",
        );
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
