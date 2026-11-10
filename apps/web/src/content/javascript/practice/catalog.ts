import {
  counterProblem,
  debounceProblem,
  filterArrayProblem,
  sleepProblem,
} from "@workspace/problems";
import type { PracticeEntry } from "../../../features/catalog/lib/practice-catalog";
export const javascriptPracticeCatalog = [
  { problem: sleepProblem, order: 65 },
  { problem: counterProblem, order: 10 },
  { problem: debounceProblem, order: 30 },
  { problem: filterArrayProblem, order: 20 },
].map<PracticeEntry>(({ problem, order }) => ({
  id: problem.id,
  slug: problem.slug,
  subjectId: problem.subjectId,
  topicId: problem.topicId,
  title: problem.title,
  summary: problem.summary,
  order,
  status: "published",
  recommended: true,
  difficulty: problem.difficulty,
}));
