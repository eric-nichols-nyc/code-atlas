import {
  longestSubstringTwoDistinctProblem,
  maxConsecutiveOnesProblem,
  mostFrequentCharacterProblem,
  moveZeroesProblem,
  validAnagramProblem,
} from "@workspace/problems";
import type { PracticeEntry } from "@/features/catalog/lib/practice-catalog";
import type { topics } from "@/features/learning/lib/catalog";
export const algorithmTopics: typeof topics = [
  { id: "two-pointers", label: "Two Pointers", variant: "blue" },
  { id: "sliding-window", label: "Sliding Window", variant: "amber" },
  { id: "hash-maps", label: "Hash Maps", variant: "blue" },
];
export const algorithmsPracticeCatalog: PracticeEntry[] = [
  validAnagramProblem,
  longestSubstringTwoDistinctProblem,
  mostFrequentCharacterProblem,
  moveZeroesProblem,
  maxConsecutiveOnesProblem,
].map((problem, index) => ({
  id: problem.id,
  slug: problem.slug,
  subjectId: problem.subjectId,
  topicId: problem.topicId,
  title: problem.title,
  summary: problem.summary,
  difficulty: problem.difficulty,
  order: (index + 1) * 10,
  status: "published",
  recommended: true,
}));
