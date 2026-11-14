import { readFile } from "node:fs/promises";
import { publicProblems } from "@workspace/problems";
import {
  algorithmsLearningCatalog,
  learningTopics as algorithmsTopics,
} from "../src/content/algorithms/learn/catalog";
import { moduleOverviews as algorithmsOverviews } from "../src/content/algorithms/learn/overviews";
import {
  learningVisualizations as algorithmsVisualizations,
  learningWalkthroughs as algorithmsWalkthroughs,
} from "../src/content/algorithms/learn/walkthroughs";
import { algorithmsPracticeCatalog } from "../src/content/algorithms/practice/catalog";
import { problemStatements as algorithmsStatements } from "../src/content/algorithms/practice/statements";
import {
  javascriptLearningCatalog,
  learningTopics as javascriptTopics,
} from "../src/content/javascript/learn/catalog";
import { moduleOverviews as javascriptOverviews } from "../src/content/javascript/learn/overviews";
import {
  learningVisualizations as javascriptVisualizations,
  learningWalkthroughs as javascriptWalkthroughs,
} from "../src/content/javascript/learn/walkthroughs";
import { javascriptPracticeCatalog } from "../src/content/javascript/practice/catalog";
import { problemStatements as javascriptStatements } from "../src/content/javascript/practice/statements";
import { validatePracticeContent } from "../src/features/catalog/lib/practice-content";
import { validateWalkthroughRegistry } from "../src/features/learning/lib/code-walkthrough";
import { validateLearningContent } from "../src/features/learning/lib/learn-content";
import { validateTwoPointerVisualization } from "../src/features/learning/lib/two-pointer-visualization";

const subjects = [
  {
    id: "javascript",
    modules: javascriptLearningCatalog,
    topics: javascriptTopics,
    overviews: javascriptOverviews,
    walkthroughs: javascriptWalkthroughs,
    visualizations: javascriptVisualizations,
    catalog: javascriptPracticeCatalog,
    statementSlugs: Object.keys(javascriptStatements),
  },
  {
    id: "algorithms",
    modules: algorithmsLearningCatalog,
    topics: algorithmsTopics,
    overviews: algorithmsOverviews,
    walkthroughs: algorithmsWalkthroughs,
    visualizations: algorithmsVisualizations,
    catalog: algorithmsPracticeCatalog,
    statementSlugs: Object.keys(algorithmsStatements),
  },
];
const errors: string[] = [];
for (const subject of subjects) {
  errors.push(
    ...(await validateLearningContent(
      subject.modules,
      subject.topics,
      Object.keys(subject.overviews),
      (slug) =>
        readFile(
          new URL(
            `../src/content/${subject.id}/learn/${slug}/overview.mdx`,
            import.meta.url,
          ),
          "utf8",
        ),
    )),
  );
  errors.push(
    ...validateWalkthroughRegistry(
      subject.walkthroughs,
      subject.modules
        .filter((entry) => entry.status === "published")
        .map((entry) => entry.slug),
    ),
  );
  for (const visualization of subject.visualizations)
    errors.push(...validateTwoPointerVisualization(visualization));
}
errors.push(
  ...(await validatePracticeContent(subjects, publicProblems, (subject, slug) =>
    readFile(
      new URL(
        `../src/content/${subject}/practice/${slug}/problem.mdx`,
        import.meta.url,
      ),
      "utf8",
    ),
  )),
);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Content valid for ${subjects.map((subject) => subject.id).join(", ")}: ${publicProblems.length} practice problems.`,
  );
