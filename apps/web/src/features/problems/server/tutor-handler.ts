import "server-only";
import type { AiLimiter } from "@/features/ai/server/limits";
import type { AiTextProvider as TutorProvider } from "@/features/ai/server/provider";
import { streamAiResponse } from "@/features/ai/server/response";
import { json, readJson, requireLearner } from "@/server/http";
import {
  parseTutorRequest,
  TUTOR_LIMITS,
  TutorInputError,
} from "../lib/problem-tutor-contract";
import { aiProblem } from "./problem-ai-context";
import { buildTutorPrompt } from "./tutor-context";
import { streamTutor } from "./tutor-provider";

type Context = { params: Promise<{ problemId: string }> };
export function createTutorHandler(
  options: {
    provider?: TutorProvider;
    timeout?: number;
    limiter?: AiLimiter;
    preparePrompt?: (
      problemId: string,
      value: unknown,
    ) => Promise<Awaited<ReturnType<typeof buildTutorPrompt>> | undefined>;
  } = {},
) {
  const provider = options.provider ?? streamTutor;
  return async (request: Request, context: Context) => {
    const learner = await requireLearner(request);
    if (learner instanceof Response) return learner;
    const { problemId } = await context.params;
    const problem = aiProblem(problemId);
    if (!problem && !options.preparePrompt)
      return json({ error: "Problem not found." }, 404);
    let prompt: Awaited<ReturnType<typeof buildTutorPrompt>>;
    try {
      const value = await readJson(request, TUTOR_LIMITS.body);
      if (options.preparePrompt) {
        const prepared = await options.preparePrompt(problemId, value);
        if (!prepared) return json({ error: "Problem not found." }, 404);
        prompt = prepared;
      } else if (problem) {
        prompt = await buildTutorPrompt(
          problem,
          parseTutorRequest(value, problem),
        );
      } else return json({ error: "Problem not found." }, 404);
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
    return streamAiResponse({
      learner,
      request,
      prompt,
      provider,
      timeout: options.timeout,
      limiter: options.limiter,
    });
  };
}
