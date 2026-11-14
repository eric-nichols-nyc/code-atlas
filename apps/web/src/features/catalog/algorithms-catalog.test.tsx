import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import {
  algorithmsLearningCatalog,
  learningTopics,
} from "@/content/algorithms/learn/catalog";
import {
  algorithmsPracticeCatalog,
  algorithmTopics,
} from "@/content/algorithms/practice/catalog";
import { LearningCatalog } from "@/features/learning/components/javascript-learn";
import { PracticeCatalog } from "./components/javascript-practice";

it("uses the Algorithms learning title and destination with working filters", () => {
  render(
    <LearningCatalog
      title="Algorithms Learn"
      topics={learningTopics}
      basePath="/algorithms/learn"
      catalog={algorithmsLearningCatalog}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Algorithms Learn" }),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "Two Pointers" })).toHaveAttribute(
    "href",
    "/algorithms/learn/two-pointers",
  );
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "missing" },
  });
  expect(screen.getByRole("status")).toHaveTextContent("0 modules");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByRole("status")).toHaveTextContent("1 module");
});
it("lists only Algorithms problems and uses the supplied Two Pointers category", () => {
  render(
    <PracticeCatalog
      title="Algorithms practice"
      topics={algorithmTopics}
      catalog={algorithmsPracticeCatalog}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Algorithms practice" }),
  ).toBeVisible();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Two Pointers" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.getByRole("link", { name: "Valid Anagram" })).toHaveAttribute(
    "href",
    "/algorithms/practice/valid-anagram",
  );
  expect(screen.queryByRole("link", { name: "Sleep" })).toBeNull();
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "unknown" },
  });
  expect(screen.getByRole("status")).toHaveTextContent("0 problems");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByRole("tab", { name: "Two Pointers" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("status")).toHaveTextContent("1 problem");
});
