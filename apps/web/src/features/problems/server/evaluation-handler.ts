import "server-only";
import { AI_LIMITS, AiInputError } from "@/features/ai/lib/contract";
import type { AiLimiter } from "@/features/ai/server/limits";
import type { AiTextProvider } from "@/features/ai/server/provider";
import { streamAiResponse } from "@/features/ai/server/response";
import { json, readJson, requireLearner } from "@/server/http";
import {
  parseCodeEvaluation,
  parseEvaluationRequest,
} from "../lib/code-evaluation-contract";
import { buildEvaluationPrompt, streamEvaluation } from "./evaluation-prompt";
import { aiProblem } from "./problem-ai-context";

export function createEvaluationHandler(
  options: {
    provider?: AiTextProvider;
    limiter?: AiLimiter;
    timeout?: number;
  } = {},
) {
  return async (
    request: Request,
    context: { params: Promise<{ problemId: string }> },
  ) => {
    const learner = await requireLearner(request);
    if (learner instanceof Response) return learner;
    const problem = aiProblem((await context.params).problemId);
    if (!problem) return json({ error: "Problem not found." }, 404);
    let prompt: Awaited<ReturnType<typeof buildEvaluationPrompt>>;
    try {
      prompt = await buildEvaluationPrompt(
        problem,
        parseEvaluationRequest(await readJson(request, AI_LIMITS.body)),
      );
    } catch (error) {
      if (error instanceof Response) return error;
      if (error instanceof AiInputError)
        return json({ error: error.message }, error.status);
      return json(
        {
          error:
            "This problem's evaluation context is unavailable. Please try again.",
        },
        503,
      );
    }
    return streamAiResponse({
      learner,
      request,
      prompt,
      provider: options.provider ?? streamEvaluation,
      limiter: options.limiter,
      timeout: options.timeout,
      validateOutput: (text) => parseCodeEvaluation(JSON.parse(text)),
    });
  };
}
