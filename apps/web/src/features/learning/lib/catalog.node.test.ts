import { describe, expect, it } from "vitest";
import { javascriptPracticeCatalog } from "../../../content/javascript/practice/catalog";
import { filterCatalog, problemHref } from "./catalog";

describe("JavaScript problem catalog", () => {
  it("links published problems and leaves missing or planned entries unavailable", () => {
    const sleep = javascriptPracticeCatalog[0];
    if (!sleep) throw new Error("Missing Sleep");
    expect(problemHref(sleep)).toBe("/javascript/practice/sleep");
    expect(problemHref(undefined)).toBeUndefined();
    expect(problemHref({ ...sleep, status: "planned" })).toBeUndefined();
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
    ).toEqual([10, 15, 16, 17, 20, 25, 26, 27, 28, 30, 35, 40, 65]);
  });
  it("handles empty catalogs and resets filters", () => {
    expect(filterCatalog([])).toEqual([]);
    expect(filterCatalog(javascriptPracticeCatalog, "", "all")).toHaveLength(
      13,
    );
  });
});
