import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import {
  algorithmsLearningCatalog,
  learningTopics,
} from "@/content/algorithms/learn/catalog";
import {
  learningVisualizations,
  learningWalkthroughs,
} from "@/content/algorithms/learn/walkthroughs";
import { javascriptLearningCatalog } from "@/content/javascript/learn/catalog";
import {
  learningVisualizations as javascriptVisualizations,
  learningWalkthroughs as javascriptWalkthroughs,
} from "@/content/javascript/learn/walkthroughs";
import { validateLearningContent } from "./learn-content";

it("shares the lesson and keeps an independent Algorithms module identity", async () => {
  expect(algorithmsLearningCatalog[0]?.id).toBe(
    "algorithms.learn.two-pointers",
  );
  expect({
    ...algorithmsLearningCatalog[0],
    id: javascriptLearningCatalog[0]?.id,
  }).toEqual(javascriptLearningCatalog[0]);
  expect(learningWalkthroughs[0].walkthrough).toBe(
    javascriptWalkthroughs[0].walkthrough,
  );
  expect(learningVisualizations[0]).toBe(javascriptVisualizations[0]);
  const overview = (subject: string) =>
    readFile(
      new URL(
        `../../../content/${subject}/learn/two-pointers/overview.mdx`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(await overview("algorithms")).toBe(await overview("javascript"));
  expect(await overview("algorithms")).toContain(
    "@/content/shared/learn/two-pointers/overview.mdx",
  );
  expect(
    await validateLearningContent(
      algorithmsLearningCatalog,
      learningTopics,
      ["two-pointers"],
      () => overview("algorithms"),
    ),
  ).toEqual([]);
  expect(
    await validateLearningContent(
      algorithmsLearningCatalog,
      learningTopics,
      [],
      () => overview("algorithms"),
    ),
  ).toContain("Missing learning overview loader algorithms.learn.two-pointers");
});
