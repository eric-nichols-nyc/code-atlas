import { slidingWindowModule } from "@/content/shared/learn/sliding-window/metadata";
import { twoPointersModule } from "@/content/shared/learn/two-pointers/metadata";
import type {
  LearningModule,
  LearningTopic,
} from "@/features/learning/lib/learn-types";

export const learningTopics: readonly LearningTopic[] = [
  { id: "arrays", label: "Arrays", variant: "blue" },
  { id: "async", label: "Async", variant: "rose" },
  { id: "memory", label: "Memory", variant: "amber" },
  { id: "iteration", label: "Iteration", variant: "blue" },
  { id: "scope", label: "Scope", variant: "amber" },
];

export const javascriptLearningCatalog: readonly LearningModule[] = [
  {
    id: "javascript.learn.two-pointers",
    ...twoPointersModule,
  },
  {
    id: "javascript.learn.sliding-window",
    ...slidingWindowModule,
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
  {
    id: "javascript.learn.heap-stack",
    slug: "heap-stack",
    title: "Heap & Stack",
    summary:
      "Follow nested calls and see how separate variables can change one shared object.",
    topicId: "memory",
    difficulty: "Medium",
    order: 30,
    status: "published",
    recommended: true,
    lessonOutlines: [
      {
        id: "frames-and-references",
        title: "Call frames and shared references",
        summary:
          "Track a copied number and a shared object as two function calls return.",
      },
    ],
  },
  {
    id: "javascript.learn.generators",
    slug: "generators",
    title: "Generators & Iterators",
    summary:
      "Follow a generator as it yields values, resumes with input, and signals completion.",
    topicId: "iteration",
    difficulty: "Medium",
    order: 40,
    status: "published",
    recommended: true,
    lessonOutlines: [
      {
        id: "yield-and-resume",
        title: "Yield, resume, and return",
        summary:
          "Track local state and iterator results across successive calls to next().",
      },
    ],
  },
  {
    id: "javascript.learn.closures",
    slug: "closures",
    title: "Closures",
    summary:
      "Follow two returned functions as each updates its own captured binding.",
    topicId: "scope",
    difficulty: "Medium",
    order: 50,
    status: "published",
    recommended: true,
    lessonOutlines: [
      {
        id: "captured-bindings",
        title: "Captured bindings and lexical lookup",
        summary:
          "Track the call stack and two independent environments after the factory returns.",
      },
    ],
  },
];
