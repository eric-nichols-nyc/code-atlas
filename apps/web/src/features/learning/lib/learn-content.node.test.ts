import { describe, expect, it } from "vitest";
import {
  javascriptLearningCatalog,
  learningTopics,
} from "../../../content/javascript/learn/catalog";
import { validateLearningContent } from "./learn-content";
import type { LearningModule } from "./learn-types";

const sample = javascriptLearningCatalog[0] as LearningModule;
const validate = (
  entries: readonly LearningModule[],
  slugs = [sample.slug],
  read = async () => "Overview",
) => validateLearningContent(entries, learningTopics, slugs, read);

describe("learning content validation", () => {
  it("accepts the authored catalog", async () => {
    expect(await validate(javascriptLearningCatalog)).toEqual([]);
  });
  it("rejects duplicate identifiers, slugs and order", async () => {
    expect(await validate([sample, sample])).toEqual(
      expect.arrayContaining([
        "Duplicate learning module id",
        "Duplicate learning module slug",
        "Duplicate learning module order",
      ]),
    );
  });
  it.each([
    { title: " " },
    { summary: "" },
    { slug: "../escape" },
    { topicId: "missing" },
    { order: NaN },
    { difficulty: "Unknown" },
    { status: "unknown" },
    { recommended: undefined },
  ])("rejects invalid metadata %j", async (change) => {
    expect(
      await validate([{ ...sample, ...change } as LearningModule]),
    ).toContain(`Invalid learning metadata ${sample.id}`);
  });
  it.each(
    [
      [],
      [{ id: "", title: "Title", summary: "Summary" }],
      [{ id: "a", title: "", summary: "Summary" }],
      [{ id: "a", title: "Title", summary: "" }],
      [
        ...sample.lessonOutlines.slice(0, 1),
        ...sample.lessonOutlines.slice(0, 1),
      ],
    ].map((lessonOutlines) => ({ lessonOutlines })),
  )("rejects malformed outlines %j", async ({ lessonOutlines }) => {
    expect(
      await validate([{ ...sample, lessonOutlines } as LearningModule]),
    ).toContain(`Invalid learning outlines ${sample.id}`);
  });
  it("rejects missing loaders and missing or empty published previews", async () => {
    expect(await validate([sample], [])).toContain(
      `Missing learning overview loader ${sample.id}`,
    );
    expect(await validate([sample], [sample.slug], async () => " ")).toContain(
      `Empty learning overview ${sample.id}`,
    );
    expect(
      await validate([sample], [sample.slug], async () => {
        throw new Error("missing");
      }),
    ).toContain(`Missing learning overview ${sample.id}`);
    expect(await validate([{ ...sample, status: "planned" }], [])).toEqual([]);
  });
});
