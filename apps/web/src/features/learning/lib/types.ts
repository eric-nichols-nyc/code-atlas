import type { ProblemDefinition } from "@workspace/problems";
export type TopicId = ProblemDefinition["topicId"];
export interface CatalogEntry {
  id: string;
  slug: string;
  subjectId: string;
  topicId: TopicId;
  title: string;
  summary: string;
  order: number;
  status: "published" | "planned";
}
export interface LayoutPreferences {
  version: 1;
  lessonWidthPx: number;
  lastTutorWidthPx: number;
  codeSharePercent: number;
}
