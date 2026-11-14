import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import {
  learningTopics,
  reactLearningCatalog,
} from "@/content/react/learn/catalog";
import { useEffectLifecycleWalkthrough } from "@/content/react/learn/use-effect-lifecycle/walkthrough";
import { learningWalkthroughs } from "@/content/react/learn/walkthroughs";
import { validateWalkthroughRegistry } from "./code-walkthrough";
import {
  learningCategories,
  learningModuleHref,
  learningModules,
} from "./learn-catalog";
import { validateLearningContent } from "./learn-content";

it("publishes one stable React lesson in Recommended and Hooks", () => {
  const [module] = reactLearningCatalog;
  expect(module?.id).toBe("react.learn.use-effect-lifecycle");
  expect(module?.title).toBe("useEffect lifecycle");
  expect(module?.lessonOutlines).toHaveLength(1);
  expect(learningCategories(reactLearningCatalog, learningTopics)).toEqual([
    {
      id: "recommended",
      label: "Recommended",
      heading: "Recommended modules",
      count: 1,
    },
    { id: "hooks", label: "Hooks", heading: "Hooks modules", count: 1 },
  ]);
  expect(learningModuleHref(module, "/react/learn")).toBe(
    "/react/learn/use-effect-lifecycle",
  );
});

it("intersects category, trimmed case-insensitive search and difficulty", () => {
  expect(
    learningModules(reactLearningCatalog, "hooks", "  USEEFFECT  ", "Easy"),
  ).toEqual(reactLearningCatalog);
  expect(
    learningModules(reactLearningCatalog, "hooks", "useEffect", "Hard"),
  ).toEqual([]);
  expect(learningModules(reactLearningCatalog, "arrays")).toEqual([]);
  expect(learningModules(reactLearningCatalog, "hooks", "unknown")).toEqual([]);
});

it("validates the registered overview and rejects missing publication content", async () => {
  const readOverview = (slug: string) =>
    readFile(
      new URL(
        `../../../content/react/learn/${slug}/overview.mdx`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(
    await validateLearningContent(
      reactLearningCatalog,
      learningTopics,
      ["use-effect-lifecycle"],
      readOverview,
    ),
  ).toEqual([]);
  expect(
    await validateLearningContent(
      reactLearningCatalog,
      learningTopics,
      [],
      readOverview,
    ),
  ).toContain(
    "Missing learning overview loader react.learn.use-effect-lifecycle",
  );
});

it("validates the six-step timer and rejects broken source references", () => {
  expect(
    validateWalkthroughRegistry(learningWalkthroughs, ["use-effect-lifecycle"]),
  ).toEqual([]);
  expect(useEffectLifecycleWalkthrough.steps).toHaveLength(6);
  const lines = useEffectLifecycleWalkthrough.source.split("\n");
  for (const id of ["cleanup-old", "unmount"]) {
    const step = useEffectLifecycleWalkthrough.steps.find(
      (item) => item.id === id,
    );
    expect(step?.lines.map((line) => lines[line - 1]).join("\n")).toContain(
      "clearInterval(intervalId)",
    );
  }
  const broken = {
    ...useEffectLifecycleWalkthrough,
    steps: [
      {
        id: "bad",
        explanation: "Invalid reference",
        lines: [lines.length + 1],
      },
    ],
  };
  expect(
    validateWalkthroughRegistry(
      [{ moduleSlug: "use-effect-lifecycle", walkthrough: broken }],
      ["use-effect-lifecycle"],
    ).join("\n"),
  ).toContain("react-use-effect-lifecycle, step bad");
});
