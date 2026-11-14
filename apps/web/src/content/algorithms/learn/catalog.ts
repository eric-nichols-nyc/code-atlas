import type {
  LearningModule,
  LearningTopic,
} from "@/features/learning/lib/learn-types";

export const learningTopics: readonly LearningTopic[] = [
  { id: "arrays", label: "Arrays", variant: "blue" },
];

export const algorithmsLearningCatalog: readonly LearningModule[] = [
  {
    id: "algorithms.learn.two-pointers",
    slug: "two-pointers",
    title: "Two Pointers",
    summary:
      "Use two indices to explore an array, compare pairs, and avoid repeated work.",
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
          "See how two indices track positions in an array and when moving them can replace a nested loop.",
      },
      {
        id: "opposite-end-pointers",
        title: "Opposite-end pointers",
        summary:
          "Start at the first and last elements of a sorted array. Use a comparison to decide which index moves inward.",
      },
      {
        id: "same-direction-pointers",
        title: "Same-direction pointers",
        summary:
          "Move through an array with separate read and write positions, as in removing repeated values from sorted input.",
      },
    ],
  },
];
