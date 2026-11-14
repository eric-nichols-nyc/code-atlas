import "server-only";
import { staleClosureCounter as exercise } from "@/content/react/practice/stale-closure-counter/exercise";
import {
  parseTutorRequest,
  TUTOR_LIMITS,
  TutorInputError,
  utf8Bytes,
} from "@/features/problems/lib/problem-tutor-contract";
import {
  TUTOR_INSTRUCTIONS,
  type TutorPrompt,
} from "@/features/problems/server/tutor-context";

export async function prepareReactTutorPrompt(
  id: string,
  value: unknown,
): Promise<TutorPrompt | undefined> {
  if (id !== exercise.id) return undefined;
  const request = parseTutorRequest(value);
  const prompt = {
    instructions:
      TUTOR_INSTRUCTIONS.replace(
        "fenced JavaScript snippets",
        "fenced TSX snippets",
      ) +
      "\nThis is a React TypeScript preview exercise. Read current_code as /App.tsx. There is no judge or accepted verdict. Do not claim to see the preview or console. Explain hooks and effect cleanup when relevant.",
    input: [
      ...request.history,
      {
        role: "user" as const,
        content: JSON.stringify({
          problem: {
            id: exercise.id,
            title: exercise.title,
            statement: exercise.statement,
            requirements: exercise.requirements,
            activeFile: "/App.tsx",
          },
          current_code: request.code,
          question: request.question,
        }),
      },
    ],
  };
  if (utf8Bytes(JSON.stringify(prompt)) > TUTOR_LIMITS.prompt)
    throw new TutorInputError("Tutor context is too large.", 413);
  return prompt;
}
