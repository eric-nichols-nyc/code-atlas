import { validAnagramProblem as problem } from "@workspace/problems";
import type { PracticeEntry } from "@/features/catalog/lib/practice-catalog";
import type { topics } from "@/features/learning/lib/catalog";
export const algorithmTopics: typeof topics = [
  { id: "two-pointers", label: "Two Pointers", variant: "blue" },
];
export const algorithmsPracticeCatalog: PracticeEntry[] = [
  {
    id: problem.id,
    slug: problem.slug,
    subjectId: problem.subjectId,
    topicId: problem.topicId,
    title: problem.title,
    summary: problem.summary,
    difficulty: problem.difficulty,
    order: 10,
    status: "published",
    recommended: true,
  },
];
