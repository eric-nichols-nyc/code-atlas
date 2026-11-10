import { sleepProblem } from "@workspace/problems";
import type { PracticeEntry } from "../../../features/catalog/lib/practice-catalog";
export const javascriptPracticeCatalog: PracticeEntry[] = [
  {
    id: sleepProblem.id,
    slug: sleepProblem.slug,
    subjectId: sleepProblem.subjectId,
    topicId: sleepProblem.topicId,
    title: sleepProblem.title,
    summary: sleepProblem.summary,
    order: 65,
    status: "published",
    recommended: true,
    difficulty: sleepProblem.difficulty,
  },
];
