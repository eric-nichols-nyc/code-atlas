import type { LearningModule } from "@/features/learning/lib/learn-types";

export const twoPointersModule = {
  slug: "two-pointers",
  title: "Two Pointers",
  summary:
    "Trace a palindrome check and see when two positions can scan an input in one pass.",
  topicId: "arrays",
  difficulty: "Easy",
  order: 10,
  status: "published",
  recommended: true,
  lessonOutlines: [
    {
      id: "introduction",
      title: "Introduction",
      summary:
        "Give two indices or node references a role and a movement rule.",
    },
    {
      id: "opposite-end-pointers",
      title: "Opposite-end pointers",
      summary: "Move inward through a word to check for a palindrome.",
    },
    {
      id: "same-direction-pointers",
      title: "Same-direction pointers",
      summary: "Use separate read and write positions or maintain a fixed gap.",
    },
  ],
} as const satisfies Omit<LearningModule, "id">;
