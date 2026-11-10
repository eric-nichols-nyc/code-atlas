import { describe, expect, it } from "vitest";
import { javascriptPracticeCatalog } from "../../../content/javascript/practice/catalog";
import {
  type PracticeEntry,
  practiceCategories,
  practiceProblems,
} from "./practice-catalog";

describe("practice categories", () => {
  it("lists the published problems in Recommended and their own categories", () => {
    expect(practiceCategories(javascriptPracticeCatalog)).toEqual([
      {
        id: "recommended",
        label: "Recommended",
        heading: "Recommended problems",
        count: 6,
      },
      {
        id: "closures",
        label: "Closures",
        heading: "Closures problems",
        count: 1,
      },
      { id: "arrays", label: "Arrays", heading: "Arrays problems", count: 1 },
      {
        id: "generators",
        label: "Generators",
        heading: "Generators problems",
        count: 1,
      },
      { id: "async", label: "Async", heading: "Async problems", count: 3 },
    ]);
    expect(
      practiceProblems(javascriptPracticeCatalog, "recommended").map(
        (entry) => entry.slug,
      ),
    ).toEqual([
      "counter",
      "filter-elements-from-array",
      "debounce",
      "delay-the-resolution-of-each-promise",
      "fibonacci-generator",
      "sleep",
    ]);
    expect(
      practiceProblems(javascriptPracticeCatalog, "generators")[0]?.slug,
    ).toBe("fibonacci-generator");
    expect(
      practiceProblems(javascriptPracticeCatalog, "closures")[0]?.slug,
    ).toBe("counter");
    expect(
      practiceProblems(javascriptPracticeCatalog, "async").map(
        (entry) => entry.slug,
      ),
    ).toEqual(["debounce", "delay-the-resolution-of-each-promise", "sleep"]);
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

it("intersects difficulty with the selected category and search", () => {
  const entries = javascriptPracticeCatalog.map((entry) => ({
    ...entry,
    difficulty: entry.slug === "counter" ? "Medium" : "Easy",
  }));
  expect(
    practiceProblems(entries, "recommended", "counter", "Medium").map(
      (entry) => entry.slug,
    ),
  ).toEqual(["counter"]);
  expect(practiceProblems(entries, "async", "", "Medium")).toEqual([]);
  expect(practiceProblems(entries, "closures", "sleep", "Medium")).toEqual([]);
  expect(practiceProblems(entries, "recommended", "", "Hard")).toEqual([]);
});
