import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { javascriptPracticeCatalog } from "@/content/javascript/practice/catalog";
import { JavaScriptPractice } from "./components/javascript-practice";

it("keeps an empty practice catalog honest without problem links", () => {
  render(<JavaScriptPractice catalog={[]} />);
  expect(
    screen.getByText("Practice problems are on the way. Check back soon."),
  ).toBeVisible();
  expect(screen.queryByRole("list")).toBeNull();
  expect(screen.getByRole("tab", { name: "Recommended" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
it("clears an empty query result back to the practice problems", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  fireEvent.change(screen.getByRole("searchbox", { name: "Search problems" }), {
    target: { value: "no matching concept" },
  });
  expect(screen.getByRole("status")).toHaveTextContent("0 problems");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByRole("status")).toHaveTextContent("1 problem");
});

it("opens the canonical practice problem without listing planned learning topics", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  expect(screen.getByRole("link", { name: /Sleep/ })).toHaveAttribute(
    "href",
    "/javascript/practice/sleep",
  );
  expect(screen.queryByText("Scope and shadowing")).toBeNull();
});

it("lists Sleep in both Recommended and Async and searches within the selected category", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  expect(
    screen.getByRole("heading", { name: "Recommended problems" }),
  ).toBeVisible();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Async" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.getByRole("tab", { name: "Async" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("heading", { name: "Async problems" })).toBeVisible();
  expect(screen.getByRole("link", { name: /Sleep/ })).toHaveAttribute(
    "href",
    "/javascript/practice/sleep",
  );
  fireEvent.change(screen.getByRole("searchbox", { name: "Search problems" }), {
    target: { value: "missing" },
  });
  expect(screen.queryByRole("link", { name: /Sleep/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByRole("tab", { name: "Async" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("link", { name: /Sleep/ })).toBeVisible();
});
