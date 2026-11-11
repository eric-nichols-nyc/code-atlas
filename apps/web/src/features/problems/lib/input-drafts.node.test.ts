import {
  counterProblem,
  curryProblem,
  debounceProblem,
  delayEachPromiseProblem,
  fibonacciGeneratorProblem,
  filterArrayProblem,
  flattenNestedArrayProblem,
  publicProblems,
  validRunInputs,
} from "@workspace/problems";
import { expect, it } from "vitest";
import { inputDraft, parseInputDraft } from "./input-drafts";

it("round-trips nested arrays and rejects malformed or unsupported JSON", () => {
  const draft = inputDraft({ arr: [0, [1, [0]], []] });
  expect(parseInputDraft(flattenNestedArrayProblem, draft)).toEqual({
    arr: [0, [1, [0]], []],
  });
  expect(
    parseInputDraft(flattenNestedArrayProblem, { ...draft, json: "[]" }),
  ).toEqual({ arr: [] });
  for (const json of ["bad", "{}", "[null]", "[true]", '["1"]', "[1.5]"])
    expect(
      parseInputDraft(flattenNestedArrayProblem, { ...draft, json }),
    ).toBeUndefined();
});

it("validates editable curry callback and groups without requiring a numeric field", () => {
  const draft = inputDraft({ fn: "sum3", groups: [[], [1], [2, 3]] });
  expect(parseInputDraft(curryProblem, draft)).toEqual({
    fn: "sum3",
    groups: [[], [1], [2, 3]],
  });
  for (const json of ["bad", "[]", "[[1]]", "[[1,2,3],[]]"])
    expect(parseInputDraft(curryProblem, { ...draft, json })).toBeUndefined();
  expect(
    parseInputDraft(curryProblem, { ...draft, callback: "source" }),
  ).toBeUndefined();
});

it("validates editable Promise descriptors, including zero and empty inputs", () => {
  expect(
    parseInputDraft(delayEachPromiseProblem, {
      value: "0",
      json: "[]",
      calls: "",
      predicate: "",
    }),
  ).toEqual({ ms: 0, functions: [] });
  for (const [value, json] of [
    ["", "[]"],
    ["5", "bad"],
    ["5", '[{"t":0,"value":null}]'],
  ])
    expect(
      parseInputDraft(delayEachPromiseProblem, {
        value: value ?? "",
        json: json ?? "",
        calls: "",
        predicate: "",
      }),
    ).toBeUndefined();
});

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

it("bounds generator counts and rejects extra keys before running", () => {
  for (const value of ["", "-1", "51", "1.5", "Infinity"])
    expect(
      parseInputDraft(fibonacciGeneratorProblem, {
        ...inputDraft({ count: 5 }),
        value,
      }),
    ).toBeUndefined();
  for (const count of [0, 1, 50])
    expect(
      parseInputDraft(fibonacciGeneratorProblem, inputDraft({ count })),
    ).toEqual({ count });
  expect(
    validRunInputs(fibonacciGeneratorProblem, [{ count: 5, userId: "forged" }]),
  ).toBe(false);
});
