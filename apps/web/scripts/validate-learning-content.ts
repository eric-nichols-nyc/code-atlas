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
import { closuresVisualization } from "../src/content/javascript/learn/closures/visualization";
import { eventLoopPresets } from "../src/content/javascript/learn/event-loop/presets";
import { generatorVisualization } from "../src/content/javascript/learn/generators/visualization";
import { heapStackVisualization } from "../src/content/javascript/learn/heap-stack/visualization";
import { moduleOverviews as javascriptOverviews } from "../src/content/javascript/learn/overviews";
import {
  learningVisualizations as javascriptVisualizations,
  learningWalkthroughs as javascriptWalkthroughs,
} from "../src/content/javascript/learn/walkthroughs";
import { javascriptPracticeCatalog } from "../src/content/javascript/practice/catalog";
import { problemStatements as javascriptStatements } from "../src/content/javascript/practice/statements";
import {
  reactLearningCatalog,
  learningTopics as reactTopics,
} from "../src/content/react/learn/catalog";
import { moduleOverviews as reactOverviews } from "../src/content/react/learn/overviews";
import { learningWalkthroughs as reactWalkthroughs } from "../src/content/react/learn/walkthroughs";
import { slidingWindowVisualization } from "../src/content/shared/learn/sliding-window/visualization";
import { validatePracticeContent } from "../src/features/catalog/lib/practice-content";
import {
  validateCodeWalkthrough,
  validateWalkthroughRegistry,
} from "../src/features/learning/lib/code-walkthrough";
import { validateEventLoopVisualization } from "../src/features/learning/lib/event-loop-visualization";
import { validateLearningContent } from "../src/features/learning/lib/learn-content";
import { validateSlidingWindowVisualization } from "../src/features/learning/lib/sliding-window-visualization";
import { validateTwoPointerVisualization } from "../src/features/learning/lib/two-pointer-visualization";

const learningSubjects = [
  {
    id: "javascript",
    modules: javascriptLearningCatalog,
    topics: javascriptTopics,
    overviews: javascriptOverviews,
    walkthroughs: javascriptWalkthroughs,
    visualizations: javascriptVisualizations,
  },
  {
    id: "algorithms",
    modules: algorithmsLearningCatalog,
    topics: algorithmsTopics,
    overviews: algorithmsOverviews,
    walkthroughs: algorithmsWalkthroughs,
    visualizations: algorithmsVisualizations,
  },
  {
    id: "react",
    modules: reactLearningCatalog,
    topics: reactTopics,
    overviews: reactOverviews,
    walkthroughs: reactWalkthroughs,
    visualizations: [],
  },
];
const practiceSubjects = [
  {
    id: "javascript",
    catalog: javascriptPracticeCatalog,
    statementSlugs: Object.keys(javascriptStatements),
  },
  {
    id: "algorithms",
    catalog: algorithmsPracticeCatalog,
    statementSlugs: Object.keys(algorithmsStatements),
  },
];
const errors = eventLoopPresets.flatMap(({ definition }) =>
  validateEventLoopVisualization(definition),
);
errors.push(
  ...validateCodeWalkthrough(
    heapStackVisualization,
    "Heap & Stack visualization",
  ),
  ...validateCodeWalkthrough(generatorVisualization, "Generator visualization"),
  ...validateCodeWalkthrough(closuresVisualization, "Closures visualization"),
  ...validateSlidingWindowVisualization(slidingWindowVisualization),
);
for (const subject of learningSubjects) {
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
  ...(await validatePracticeContent(
    practiceSubjects,
    publicProblems,
    (subject, slug) =>
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
    `Learning content valid for ${learningSubjects.map((subject) => subject.id).join(", ")}; ${publicProblems.length} practice problems valid for ${practiceSubjects.map((subject) => subject.id).join(", ")}.`,
  );
