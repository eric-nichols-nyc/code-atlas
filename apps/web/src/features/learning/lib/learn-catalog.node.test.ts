import { describe, expect, it } from "vitest";
import {
  javascriptLearningCatalog,
  learningTopics,
} from "../../../content/javascript/learn/catalog";
import {
  findLearningModule,
  learningCategories,
  learningModuleHref,
  learningModules,
} from "./learn-catalog";
import type { LearningModule } from "./learn-types";

const sample = javascriptLearningCatalog[0] as LearningModule;
const entries: LearningModule[] = [
  {
    ...sample,
    id: "later",
    slug: "later",
    order: 30,
    recommended: false,
    difficulty: "Medium",
    title: "Later",
    summary: "Read and write indices",
  },
  { ...sample, id: "planned", slug: "planned", status: "planned", order: 20 },
  sample,
];

describe("learning catalog", () => {
  it("counts published modules per view, without empty categories", () => {
    expect(
      learningCategories(entries, [
        ...learningTopics,
        { id: "async", label: "Async", variant: "rose" },
      ]),
    ).toEqual([
      {
        id: "recommended",
        label: "Recommended",
        heading: "Recommended modules",
        count: 1,
      },
      { id: "arrays", label: "Arrays", heading: "Arrays modules", count: 2 },
    ]);
    expect(learningCategories([], learningTopics)).toHaveLength(1);
  });
  it("intersects category, case-insensitive title/summary search and difficulty", () => {
    expect(
      learningModules(entries, "arrays", "  TWO POINTERS  ", "Easy"),
    ).toEqual([sample]);
    expect(
      learningModules(entries, "arrays", "WRITE", "Medium").map((e) => e.id),
    ).toEqual(["later"]);
    expect(learningModules(entries, "recommended", "write")).toEqual([]);
    expect(learningModules(entries, "arrays", "two", "Hard")).toEqual([]);
  });
  it("retains authored order without mutating source and handles empty catalogs", () => {
    expect(learningModules(entries, "arrays").map((e) => e.order)).toEqual([
      10, 30,
    ]);
    expect(entries[0]?.order).toBe(30);
    expect(learningModules([])).toEqual([]);
  });
  it("only resolves and links published modules", () => {
    expect(learningModuleHref(sample)).toBe("/javascript/learn/two-pointers");
    expect(learningModuleHref(entries[1])).toBeUndefined();
    expect(learningModuleHref(undefined)).toBeUndefined();
    expect(findLearningModule(entries, "two-pointers")).toEqual(sample);
    expect(findLearningModule(entries, "planned")).toBeUndefined();
    expect(findLearningModule(entries, "unknown")).toBeUndefined();
  });
});
