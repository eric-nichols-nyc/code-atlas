import { describe, expect, it } from "vitest";
import { javascriptPracticeCatalog } from "../../../content/javascript/practice/catalog";
import {
  type PracticeEntry,
  practiceCategories,
  practiceProblems,
} from "./practice-catalog";

describe("practice categories", () => {
  it("lists the same Sleep problem in Recommended and Async", () => {
    expect(practiceCategories(javascriptPracticeCatalog)).toEqual([
      {
        id: "recommended",
        label: "Recommended",
        heading: "Recommended problems",
        count: 1,
      },
      { id: "async", label: "Async", heading: "Async problems", count: 1 },
    ]);
    expect(practiceProblems(javascriptPracticeCatalog, "recommended")[0]).toBe(
      javascriptPracticeCatalog[0],
    );
    expect(practiceProblems(javascriptPracticeCatalog, "async")[0]).toBe(
      javascriptPracticeCatalog[0],
    );
  });

  it("keeps recommendations curated, excludes unpublished entries, and intersects search with category", () => {
    const sleep = javascriptPracticeCatalog[0];
    if (!sleep) throw new Error("Missing published Sleep fixture");
    const entries: PracticeEntry[] = [
      sleep,
      {
        ...sleep,
        id: "javascript.counter",
        slug: "counter",
        title: "Counter",
        summary: "Create a counter function.",
        topicId: "functions",
        recommended: false,
        order: 10,
      },
      {
        ...sleep,
        id: "javascript.future",
        slug: "future",
        title: "Future",
        topicId: "basics",
        status: "planned",
        order: 20,
      },
    ];
    expect(
      practiceProblems(entries, "recommended").map((entry) => entry.id),
    ).toEqual([sleep.id]);
    expect(
      practiceProblems(entries, "functions", " COUNTER ").map(
        (entry) => entry.id,
      ),
    ).toEqual(["javascript.counter"]);
    expect(practiceProblems(entries, "async", "counter")).toEqual([]);
    expect(
      practiceCategories(entries).map((category) => [
        category.id,
        category.count,
      ]),
    ).toEqual([
      ["recommended", 1],
      ["functions", 1],
      ["async", 1],
    ]);
    expect(entries.map((entry) => entry.id)).toEqual([
      sleep.id,
      "javascript.counter",
      "javascript.future",
    ]);
  });

  it("keeps the empty Recommended view without inventing categories", () => {
    expect(practiceCategories([])).toEqual([
      {
        id: "recommended",
        label: "Recommended",
        heading: "Recommended problems",
        count: 0,
      },
    ]);
    expect(practiceProblems([], "recommended")).toEqual([]);
  });
});
