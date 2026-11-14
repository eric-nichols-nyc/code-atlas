import type {
  LearningModule,
  LearningTopic,
} from "@/features/learning/lib/learn-types";

export const learningTopics: readonly LearningTopic[] = [
  { id: "hooks", label: "Hooks", variant: "blue" },
];

export const reactLearningCatalog: readonly LearningModule[] = [
  {
    id: "react.learn.use-effect-lifecycle",
    slug: "use-effect-lifecycle",
    title: "useEffect lifecycle",
    summary:
      "Understand how Effects start, respond to changing dependencies, and clean up.",
    topicId: "hooks",
    difficulty: "Easy",
    order: 10,
    status: "published",
    recommended: true,
    lessonOutlines: [
      {
        id: "use-effect-lifecycle",
        title: "useEffect lifecycle",
        summary:
          "Follow setup, dependencies, and cleanup through a component's lifetime.",
      },
    ],
  },
];
