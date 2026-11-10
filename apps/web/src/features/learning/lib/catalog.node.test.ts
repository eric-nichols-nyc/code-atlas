import { describe, expect, it } from "vitest";
import { javascriptLearningTopics } from "../../../content/javascript/learn/planned-topics";
import { javascriptPracticeCatalog } from "../../../content/javascript/practice/catalog";
import {
  catalogCounts,
  filterCatalog,
  firstPublished,
  problemHref,
} from "./catalog";

describe("JavaScript problem catalog", () => {
  it("publishes only practice problems and keeps planned learning topics separate", () => {
    expect(firstPublished(javascriptPracticeCatalog)?.slug).toBe("sleep");
    expect(catalogCounts(javascriptPracticeCatalog)).toEqual({
      available: 1,
      planned: 0,
    });
    expect(
      problemHref(
        javascriptLearningTopics.find((x) => x.slug === "scope-and-shadowing"),
      ),
    ).toBeUndefined();
    expect(problemHref(firstPublished(javascriptPracticeCatalog))).toBe(
      "/javascript/practice/sleep",
    );
    expect(
      javascriptLearningTopics.some((topic) =>
        javascriptPracticeCatalog.some((problem) => problem.id === topic.id),
      ),
    ).toBe(false);
  });
  it("intersects query and topic while preserving order", () => {
    expect(
      filterCatalog(javascriptPracticeCatalog, "  SLEEP ", "async").map(
        (x) => x.slug,
      ),
    ).toEqual(["sleep"]);
    expect(filterCatalog(javascriptPracticeCatalog, "sleep", "basics")).toEqual(
      [],
    );
    expect(
      filterCatalog([...javascriptPracticeCatalog].reverse()).map(
        (x) => x.order,
      ),
    ).toEqual([65]);
  });
  it("handles empty catalogs and resets filters", () => {
    expect(firstPublished([])).toBeUndefined();
    expect(catalogCounts([])).toEqual({ available: 0, planned: 0 });
    expect(filterCatalog(javascriptPracticeCatalog, "", "all")).toHaveLength(1);
  });
});
