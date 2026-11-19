import "server-only";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  compositionFunctions,
  curryFunctions,
  filterPredicates,
  findProblem,
  mapTransforms,
  memoizeFunctions,
  type ProblemDefinition,
  reduceFunctions,
} from "@workspace/problems";
import { AiInputError, utf8Bytes } from "@/features/ai/lib/contract";
import { publishedPractice } from "@/features/catalog/lib/published-practice";

export function aiProblem(id: string) {
  const problem = findProblem(id);
  return problem &&
    publishedPractice.some(
      (entry) =>
        entry.id === problem.id &&
        entry.slug === problem.slug &&
        entry.status === "published",
    )
    ? problem
    : undefined;
}
const statements = new Map<string, Promise<string>>();
export async function problemAiContext(problem: ProblemDefinition) {
  const registered = aiProblem(problem.id);
  if (
    !registered ||
    registered.slug !== problem.slug ||
    registered.subjectId !== problem.subjectId
  )
    throw new AiInputError("This problem's AI context is unavailable.", 503);
  let statement = statements.get(problem.id);
  if (!statement) {
    const local = resolve(
      process.cwd(),
      `src/content/${problem.subjectId}/practice`,
    );
    const root = existsSync(local)
      ? local
      : resolve(
          process.cwd(),
          `apps/web/src/content/${problem.subjectId}/practice`,
        );
    statement = readFile(resolve(root, problem.slug, "problem.mdx"), "utf8");
    statements.set(problem.id, statement);
    statement.catch(() => statements.delete(problem.id));
  }
  const callbacks = {
    curry: curryFunctions,
    "filter-array": filterPredicates,
    "map-array": mapTransforms,
    "reduce-array": reduceFunctions,
    "function-composition": compositionFunctions,
    memoize: memoizeFunctions,
  };
  // Project public fields explicitly; whole definitions also contain solutions.
  const context = {
    id: problem.id,
    title: problem.title,
    topic: problem.topicId,
    difficulty: problem.difficulty,
    entryFunction: problem.entryFunction,
    statement: await statement,
    constraints: problem.constraints,
    examples: problem.samples,
    callbacks: callbacks[problem.kind as keyof typeof callbacks] ?? [],
  };
  if (utf8Bytes(JSON.stringify(context)) > PROBLEM_AI_LIMITS.problem)
    throw new AiInputError("This problem's AI context is unavailable.", 503);
  return context;
}

export const PROBLEM_AI_LIMITS = {
  problem: 16 * 1024,
  prompt: 96 * 1024,
} as const;
