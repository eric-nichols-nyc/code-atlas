export const learningDifficulties = ["Easy", "Medium", "Hard"] as const;

export interface LearningTopic {
  id: string;
  label: string;
  variant: "blue" | "amber" | "rose";
}

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  summary: string;
  topicId: string;
  difficulty: (typeof learningDifficulties)[number];
  order: number;
  status: "published" | "planned";
  recommended: boolean;
  lessonOutlines: readonly {
    id: string;
    title: string;
    summary: string;
  }[];
}
