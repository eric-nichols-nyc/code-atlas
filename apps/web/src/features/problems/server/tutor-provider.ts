import "server-only";
import { createAiTextProvider } from "@/features/ai/server/provider";
import { TUTOR_LIMITS } from "../lib/problem-tutor-contract";

export const streamTutor = createAiTextProvider({
  modelEnv: "OPENAI_TUTOR_MODEL",
  outputTokens: TUTOR_LIMITS.outputTokens,
});
