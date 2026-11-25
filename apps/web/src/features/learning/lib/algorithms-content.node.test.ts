import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import {
  algorithmsLearningCatalog,
  learningTopics,
} from "@/content/algorithms/learn/catalog";
import { moduleOverviews } from "@/content/algorithms/learn/overviews";
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

const overview = (subject: string, slug: string) =>
  readFile(
    new URL(
      `../../../content/${subject}/learn/${slug}/overview.mdx`,
      import.meta.url,
    ),
    "utf8",
  );

it.each(["two-pointers", "sliding-window"])(
  "shares %s and keeps an independent Algorithms module identity",
  async (slug) => {
    const algorithmsModule = algorithmsLearningCatalog.find(
      (entry) => entry.slug === slug,
    );
    const javascriptModule = javascriptLearningCatalog.find(
      (entry) => entry.slug === slug,
    );
    expect(algorithmsModule?.id).toBe(`algorithms.learn.${slug}`);
    expect(javascriptModule?.id).toBe(`javascript.learn.${slug}`);
    expect({ ...algorithmsModule, id: javascriptModule?.id }).toEqual(
      javascriptModule,
    );
    expect(
      learningWalkthroughs.find((entry) => entry.moduleSlug === slug)
        ?.walkthrough,
    ).toBe(
      javascriptWalkthroughs.find((entry) => entry.moduleSlug === slug)
        ?.walkthrough,
    );
    const algorithmsOverview = await overview("algorithms", slug);
    expect(algorithmsOverview).toBe(await overview("javascript", slug));
    expect(algorithmsOverview).toContain(
      `@/content/shared/learn/${slug}/overview.mdx`,
    );
  },
);

it("requires an overview loader for each published Algorithms module", async () => {
  expect(learningVisualizations[0]).toBe(javascriptVisualizations[0]);
  const readOverview = (slug: string) => overview("algorithms", slug);
  expect(
    await validateLearningContent(
      algorithmsLearningCatalog,
      learningTopics,
      Object.keys(moduleOverviews),
      readOverview,
    ),
  ).toEqual([]);
  expect(
    await validateLearningContent(
      algorithmsLearningCatalog,
      learningTopics,
      ["two-pointers"],
      readOverview,
    ),
  ).toEqual([
    "Missing learning overview loader algorithms.learn.sliding-window",
  ]);
});
