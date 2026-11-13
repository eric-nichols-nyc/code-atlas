import {
  chunkArrayProblem,
  findProblem,
  functionCompositionProblem,
  mapArrayProblem,
  memoizeProblem,
  reduceArrayProblem,
  validProblemInput,
} from "@workspace/problems";
import { expect, it } from "vitest";
import { inputDraft, parseInputDraft } from "./input-drafts";

it("rejects malformed, forged and out-of-bounds inputs for all five exercises", () => {
  for (const [problem, values] of [
    [
      mapArrayProblem,
      [
        { arr: [null], transform: "double" },
        { arr: [10001], transform: "double" },
        { arr: [], transform: "unknown" },
        { arr: [], transform: "double", userId: "forged" },
      ],
    ],
    [
      reduceArrayProblem,
      [
        { nums: [], reducer: "sum", init: null },
        { nums: [1.5], reducer: "sum", init: 0 },
        { nums: [], reducer: "unknown", init: 0 },
        { nums: [], reducer: "sum", init: 1e9 + 1 },
      ],
    ],
    [
      chunkArrayProblem,
      [
        { arr: [], size: 0 },
        { arr: [], size: 1001 },
        { arr: [], size: 1.5 },
        { arr: Array(1001).fill(1), size: 1 },
      ],
    ],
    [
      functionCompositionProblem,
      [
        { functions: ["source"], x: 0 },
        { functions: Array(11).fill("double"), x: 0 },
        { functions: [], x: 10001 },
        { functions: [], x: "0" },
      ],
    ],
    [
      memoizeProblem,
      [
        { fn: "subtract", calls: [[1]] },
        { fn: "sum", calls: [[1, 2, 3, 4, 5]] },
        { fn: "sum", calls: [[101]] },
        { fn: "sum", calls: Array(101).fill([]) },
        { fn: "unknown", calls: [] },
      ],
    ],
  ] as const)
    for (const input of values)
      expect(validProblemInput(problem, input)).toBe(false);
});
it("accepts upper bounds and meaningful zero/empty inputs", () => {
  expect(
    validProblemInput(mapArrayProblem, {
      arr: Array(1000).fill(-10000),
      transform: "zero",
    }),
  ).toBe(true);
  expect(
    validProblemInput(reduceArrayProblem, {
      nums: [],
      reducer: "sum",
      init: 0,
    }),
  ).toBe(true);
  expect(
    validProblemInput(chunkArrayProblem, {
      arr: Array(1000).fill(1e9),
      size: 1000,
    }),
  ).toBe(true);
  expect(
    validProblemInput(functionCompositionProblem, { functions: [], x: 0 }),
  ).toBe(true);
  expect(
    validProblemInput(memoizeProblem, {
      fn: "sum",
      calls: Array(100).fill([0]),
    }),
  ).toBe(true);
});
it("requires numeric fields while JSON-only exercises remain runnable", () => {
  for (const problem of [
    reduceArrayProblem,
    chunkArrayProblem,
    functionCompositionProblem,
  ]) {
    const sample = problem.samples[0];
    if (!sample) throw new Error("Missing sample");
    const draft = inputDraft(sample.input);
    expect(parseInputDraft(problem, { ...draft, value: " " })).toBeUndefined();
    expect(parseInputDraft(problem, { ...draft, json: "bad" })).toBeUndefined();
  }
  for (const problem of [mapArrayProblem, memoizeProblem]) {
    const sample = problem.samples[0];
    if (!sample) throw new Error("Missing sample");
    const draft = inputDraft(sample.input);
    expect(parseInputDraft(problem, draft)).toEqual(sample.input);
    expect(
      parseInputDraft(problem, { ...draft, callback: "source" }),
    ).toBeUndefined();
  }
});
it("publishes five stable routes without replacing the existing problems", () => {
  for (const slug of [
    "map-array",
    "reduce-array",
    "chunk-array",
    "function-composition",
    "memoize",
    "sleep",
    "curry",
    "flatten-nested-array",
  ])
    expect(findProblem(slug)?.id).toBe(`javascript.${slug}`);
});
