import type {
  LearningModule,
  LearningTopic,
} from "@/features/learning/lib/learn-types";

export const learningTopics: readonly LearningTopic[] = [
  { id: "arrays", label: "Arrays", variant: "blue" },
  { id: "async", label: "Async", variant: "rose" },
];

export const javascriptLearningCatalog: readonly LearningModule[] = [
  {
    id: "javascript.learn.two-pointers",
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
  {
    id: "javascript.learn.event-loop",
    slug: "event-loop",
    title: "Event Loop",
    summary:
      "Follow a timer and two microtasks to see how the browser decides what runs next.",
    topicId: "async",
    difficulty: "Easy",
    order: 20,
    status: "published",
    recommended: true,
    lessonOutlines: [
      {
        id: "timers-and-microtasks",
        title: "Timers and microtasks",
        summary:
          "Follow synchronous code, two microtasks, and a timer callback in order.",
      },
    ],
  },
];
