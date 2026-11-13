import type { ProblemDefinition, ReduceFunction } from "../types.js";

export const reduceFunctions: {
  id: ReduceFunction;
  label: string;
  code: string;
}[] = [
  {
    id: "sum",
    label: "Add each value",
    code: "function sum(acc, value) { return acc + value; }",
  },
  {
    id: "subtract",
    label: "Subtract each value",
    code: "function subtract(acc, value) { return acc - value; }",
  },
  {
    id: "max",
    label: "Keep the larger value",
    code: "function max(acc, value) { return Math.max(acc, value); }",
  },
  {
    id: "countEven",
    label: "Count even values",
    code: "function countEven(acc, value) { return acc + (value % 2 === 0 ? 1 : 0); }",
  },
];

export const reduceArrayProblem: ProblemDefinition = {
  id: "javascript.reduce-array",
  slug: "reduce-array",
  subjectId: "javascript",
  topicId: "arrays",
  kind: "reduce-array",
  inputError:
    "Use a JSON nums array of 0–1000 integers from -10000 to 10000, an integer init from -1e9 to 1e9, and a supplied reducer.",
  title: "Reduce Array",
  summary: "Carry an accumulator through an array using a reducer callback.",
  difficulty: "Easy",
  entryFunction: "reduceArray",
  starterCode: `/**
 * @param {number[]} nums
 * @param {Function} fn
 * @param {number} init
 * @return {number}
 */
function reduceArray(nums, fn, init) {
  // Pass the current accumulator and each value to fn.
}
`,
  samples: [
    {
      id: "sample-1",
      input: { nums: [4, -2, 7], reducer: "sum", init: 10 },
      expected: 19,
      explanation: "The accumulator changes from 10 to 14, then 12, then 19.",
    },
    {
      id: "sample-2",
      input: { nums: [2, 3, -4, 0], reducer: "countEven", init: 1 },
      expected: 4,
      explanation:
        "Start at 1 and add one for each of the three even values, including zero.",
    },
    {
      id: "sample-3",
      input: { nums: [], reducer: "max", init: -8 },
      expected: -8,
      explanation:
        "With no values, return init unchanged and do not invoke fn.",
    },
  ],
  constraints: [
    "nums is a dense array of 0–1000 integers from -10000 to 10000; init is an integer from -1e9 to 1e9.",
    "Start with init. Visit each original element once, from left to right, assigning accumulator = fn(accumulator, value).",
    "Call fn exactly once per element and leave nums unchanged. Empty input returns init without any callback calls.",
    "Do not call Array.prototype.reduce or Array.prototype.reduceRight; both methods are disabled in this exercise.",
    "The test panel provides synchronous numeric reducers. Your implementation must work with the supplied callback rather than a hardcoded operation.",
  ],
  hints: [
    "Store init in a local accumulator before beginning the loop.",
    "Each callback's return value becomes the first argument of the next callback call.",
  ],
  solution: `function reduceArray(nums, fn, init) {
  let accumulator = init;
  for (let i = 0; i < nums.length; i++) {
    accumulator = fn(accumulator, nums[i]);
  }
  return accumulator;
}`,
  solutionExplanation:
    "The accumulator represents all values processed so far. Updating it with the callback's return value chains the calculations in their original order. Starting with init handles empty input directly and ensures the first array value is processed too.",
};
