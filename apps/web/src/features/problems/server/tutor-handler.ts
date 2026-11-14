import "server-only";
import { json, readJson, requireLearner } from "@/server/http";
import {
  parseTutorRequest,
  TUTOR_LIMITS,
  type TutorEvent,
  TutorInputError,
} from "../lib/problem-tutor-contract";
import { buildTutorPrompt, tutorProblem } from "./tutor-context";
import { createTutorLimiter } from "./tutor-limits";
import {
  streamTutor,
  type TutorProvider,
  tutorFailure,
} from "./tutor-provider";

type Context = { params: Promise<{ problemId: string }> };
export function createTutorHandler(
  options: { provider?: TutorProvider; timeout?: number } = {},
) {
  const provider = options.provider ?? streamTutor;
  const limiter = createTutorLimiter();
  return async (request: Request, context: Context) => {
    const learner = await requireLearner(request);
    if (learner instanceof Response) return learner;
    const problem = tutorProblem((await context.params).problemId);
    if (!problem) return json({ error: "Problem not found." }, 404);
    let prompt: Awaited<ReturnType<typeof buildTutorPrompt>>;
    try {
      const input = parseTutorRequest(
        await readJson(request, TUTOR_LIMITS.body),
        problem,
      );
      prompt = await buildTutorPrompt(problem, input);
    } catch (error) {
      if (error instanceof Response) return error;
      if (error instanceof TutorInputError)
        return json({ error: error.message }, error.status);
      return json(
        {
          error:
            "This problem's tutor context is unavailable. Please try again.",
        },
        503,
      );
    }
    const release = limiter.acquire(learner);
    if (!release) {
      const response = json(
        {
          error:
            "Too many tutor questions. Wait a moment before sending again.",
        },
        429,
      );
      response.headers.set("Retry-After", "6");
      return response;
    }
    const abort = new AbortController();
    const signal = AbortSignal.any([request.signal, abort.signal]);
    const timer = setTimeout(
      () => abort.abort(),
      options.timeout ?? TUTOR_LIMITS.timeout,
    );
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      release();
      abort.abort();
    };
    try {
      const events = await provider(prompt, signal);
      signal.throwIfAborted();
      let cancelled = false;
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const emit = (event: TutorEvent) => {
            if (!cancelled)
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
              );
          };
          try {
            emit({ type: "start" });
            let terminal = false;
            for await (const event of events) {
              signal.throwIfAborted();
              emit(event);
              if (event.type === "done" || event.type === "error") {
                terminal = true;
                break;
              }
            }
            if (!terminal)
              emit({
                type: "error",
                message: "The tutor connection ended early. Try sending again.",
              });
          } catch (error) {
            emit({
              type: "error",
              message: tutorFailure(error, signal).message,
            });
          } finally {
            finish();
            if (!cancelled) controller.close();
          }
        },
        cancel() {
          cancelled = true;
          finish();
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
      const failure = tutorFailure(error, signal);
      finish();
      return json({ error: failure.message }, failure.status);
    }
  };
}
