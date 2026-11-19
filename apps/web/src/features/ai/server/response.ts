import "server-only";
import { json } from "@/server/http";
import { AI_LIMITS, type AiTextEvent, utf8Bytes } from "../lib/contract";
import { type AiLimiter, aiAdmission } from "./limits";
import {
  type AiPrompt,
  type AiTextProvider,
  AiUnavailable,
  aiFailure,
} from "./provider";

function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      void work.catch(() => {});
      reject(signal.reason);
      return;
    }
    const abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    work
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", abort));
  });
}

// Called only after resource-level authentication, origin and input validation.
export async function streamAiResponse(options: {
  learner: string;
  request: Request;
  prompt: AiPrompt;
  provider: AiTextProvider;
  validateOutput?: (text: string) => unknown;
  timeout?: number;
  limiter?: AiLimiter;
}) {
  let release: (() => Promise<void>) | null;
  try {
    release = await (options.limiter ?? aiAdmission).acquire(options.learner);
  } catch {
    return json(
      { error: "AI is temporarily unavailable. Please try again." },
      503,
    );
  }
  if (!release) {
    const response = json(
      { error: "Too many AI requests. Wait a moment before trying again." },
      429,
    );
    response.headers.set("Retry-After", "6");
    return response;
  }
  const abort = new AbortController();
  const signal = AbortSignal.any([options.request.signal, abort.signal]);
  const timer = setTimeout(
    () => abort.abort(),
    options.timeout ?? AI_LIMITS.timeout,
  );
  let finished = false;
  const finish = async () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    abort.abort();
    // Remote admission adapters can release asynchronously; leases must also expire.
    try {
      await release();
    } catch {
      /* Never expose admission backend failures. */
    }
  };
  try {
    signal.throwIfAborted();
    const events = await abortable(
      options.provider(options.prompt, signal),
      signal,
    );
    let cancelled = false;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (event: AiTextEvent) => {
          if (!cancelled)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );
        };
        const iterator = events[Symbol.asyncIterator]();
        let text = "";
        try {
          emit({ type: "start" });
          while (true) {
            const next = await abortable(iterator.next(), signal);
            if (next.done)
              throw new AiUnavailable(
                "The AI connection ended early. Please try again.",
              );
            const event = next.value;
            if (event.type === "delta") {
              text += event.text;
              if (utf8Bytes(text) > AI_LIMITS.output)
                throw new AiUnavailable("The AI reply exceeded its limit.");
            }
            if (event.type === "done") {
              if (!text.trim())
                throw new AiUnavailable(
                  "AI returned an empty reply. Please try again.",
                );
              options.validateOutput?.(text);
            }
            emit(event);
            if (event.type === "done" || event.type === "error") break;
          }
        } catch (error) {
          emit({ type: "error", message: aiFailure(error, signal).message });
        } finally {
          await finish();
          void iterator.return?.().catch(() => {});
          if (!cancelled) controller.close();
        }
      },
      cancel() {
        cancelled = true;
        return finish();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const failure = aiFailure(error, signal);
    await finish();
    return json({ error: failure.message }, failure.status);
  }
}
