import type { LearningModule } from "@/features/learning/lib/learn-types";

export const slidingWindowModule = {
  slug: "sliding-window",
  title: "Sliding Window",
  summary:
    "Track a running sum as a window moves across an array, then see how a condition can resize the window.",
  topicId: "arrays",
  difficulty: "Easy",
  order: 15,
  status: "published",
  recommended: true,
  lessonOutlines: [
    {
      id: "fixed-size",
      title: "Fixed-size windows",
      summary: "Update the sum by subtracting one value and adding another.",
    },
    {
      id: "variable-size",
      title: "Variable-size windows",
      summary: "Grow and shrink a range to maintain a condition.",
    },
    {
      id: "window-state",
      title: "When to use sliding window and what to track",
      summary: "Choose a movement rule and state that match the problem.",
    },
    {
      id: "quiz",
      title: "Introduction Quiz",
      summary: "Check your understanding with ten multiple-choice questions.",
    },
  ],
} as const satisfies Omit<LearningModule, "id">;
