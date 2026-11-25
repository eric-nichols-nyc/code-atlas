import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { javascriptLearningCatalog } from "@/content/javascript/learn/catalog";
import { JavaScriptLearn } from "./javascript-learn";

it("lists the sample as a module with outlines, without practice account controls", () => {
  render(<JavaScriptLearn catalog={javascriptLearningCatalog} />);
  expect(screen.getByRole("link", { name: "Two Pointers" })).toHaveAttribute(
    "href",
    "/javascript/learn/two-pointers",
  );
  expect(screen.getByRole("status")).toHaveTextContent("5 modules");
  expect(
    screen.getAllByRole("columnheader").map((cell) => cell.textContent),
  ).toEqual(["Module", "Difficulty", "Topic", "Lesson outlines"]);
  expect(screen.getByRole("cell", { name: "3" })).toBeVisible();
  expect(screen.queryByRole("button", { name: /flag|run|submit/i })).toBeNull();
});

it("searches title and summary within a category and clears without leaving it", () => {
  render(<JavaScriptLearn catalog={javascriptLearningCatalog} />);
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Arrays" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByRole("searchbox", { name: "Search modules" }), {
    target: { value: "  PALINDROME CHECK  " },
  });
  expect(screen.getByRole("link", { name: "Two Pointers" })).toBeVisible();
  fireEvent.change(screen.getByRole("searchbox", { name: "Search modules" }), {
    target: { value: "unknown" },
  });
  expect(screen.getByRole("status")).toHaveTextContent("0 modules");
  expect(screen.getByText("No modules match your filters.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByRole("tab", { name: "Arrays" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("status")).toHaveTextContent("1 module");
});

it("combines difficulty and search and clears both filters", async () => {
  render(<JavaScriptLearn catalog={javascriptLearningCatalog} />);
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Arrays" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByRole("searchbox", { name: "Search modules" }), {
    target: { value: "two" },
  });
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Difficulty" }), {
    key: "Enter",
  });
  fireEvent.click(await screen.findByRole("option", { name: "Hard" }));
  expect(screen.queryByRole("link", { name: "Two Pointers" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByRole("searchbox", { name: "Search modules" })).toHaveValue(
    "",
  );
  expect(screen.getByRole("tab", { name: "Arrays" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("link", { name: "Two Pointers" })).toBeVisible();
});

it("does not publish planned modules or fabricate rows for an empty catalog", () => {
  render(
    <JavaScriptLearn
      catalog={javascriptLearningCatalog.map((entry) => ({
        ...entry,
        status: "planned",
      }))}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("0 modules");
  expect(screen.queryByRole("link")).toBeNull();
  expect(screen.queryByRole("tab", { name: "Arrays" })).toBeNull();
  expect(
    screen.getByText("Learning modules are on the way. Check back soon."),
  ).toBeVisible();
});
