import {
  counterProblem,
  debounceProblem,
  delayEachPromiseProblem,
  fibonacciGeneratorProblem,
  filterArrayProblem,
  sleepProblem,
} from "@workspace/problems";
import type { PracticeEntry } from "../../../features/catalog/lib/practice-catalog";
export const javascriptPracticeCatalog = [
  { problem: sleepProblem, order: 65 },
  { problem: counterProblem, order: 10 },
  { problem: debounceProblem, order: 30 },
  { problem: delayEachPromiseProblem, order: 35 },
  { problem: filterArrayProblem, order: 20 },
  { problem: fibonacciGeneratorProblem, order: 40 },
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
