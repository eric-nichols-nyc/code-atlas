import { twoPointersModule } from "@/content/shared/learn/two-pointers/metadata";
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
    ...twoPointersModule,
  },
];
