import {
  counterProblem,
  debounceProblem,
  filterArrayProblem,
  publicProblems,
} from "@workspace/problems";
import { expect, it } from "vitest";
import { inputDraft, parseInputDraft } from "./input-drafts";

it.each(publicProblems)(
  "round-trips $title examples through editable case fields",
  (problem) => {
    for (const sample of problem.samples)
      expect(parseInputDraft(problem, inputDraft(sample.input))).toEqual(
        sample.input,
      );
  },
);
it("rejects malformed schedules/arrays, blank numbers and unknown callbacks", () => {
  expect(
    parseInputDraft(debounceProblem, {
      value: "20",
      calls: "",
      json: "[bad",
      predicate: "",
    }),
  ).toBeUndefined();
  expect(
    parseInputDraft(filterArrayProblem, {
      value: "",
      calls: "",
      json: "[1,2]",
      predicate: "userScript",
    }),
  ).toBeUndefined();
  expect(
    parseInputDraft(counterProblem, {
      value: "",
      calls: "3",
      json: "",
      predicate: "",
    }),
  ).toBeUndefined();
});
