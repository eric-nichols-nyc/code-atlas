import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import {
  algorithmsLearningCatalog,
  learningTopics,
} from "@/content/algorithms/learn/catalog";
import { twoPointersVisualization } from "@/content/algorithms/learn/two-pointers/visualization";
import { twoPointersWalkthrough } from "@/content/algorithms/learn/two-pointers/walkthrough";
import { javascriptLearningCatalog } from "@/content/javascript/learn/catalog";
import { twoPointersVisualization as originalVisualization } from "@/content/javascript/learn/two-pointers/visualization";
import { twoPointersWalkthrough as originalWalkthrough } from "@/content/javascript/learn/two-pointers/walkthrough";
import { validateLearningContent } from "./learn-content";

it("copies the teaching data and prose with an independent Algorithms module identity", async () => {
  expect(algorithmsLearningCatalog[0]?.id).toBe(
    "algorithms.learn.two-pointers",
  );
  expect({
    ...algorithmsLearningCatalog[0],
    id: javascriptLearningCatalog[0]?.id,
  }).toEqual(javascriptLearningCatalog[0]);
  expect(twoPointersWalkthrough).toEqual(originalWalkthrough);
  expect(twoPointersVisualization).toEqual(originalVisualization);
  const overview = (subject: string) =>
    readFile(
      new URL(
        `../../../content/${subject}/learn/two-pointers/overview.mdx`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(await overview("algorithms")).toBe(await overview("javascript"));
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
