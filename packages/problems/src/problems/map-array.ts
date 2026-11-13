import type { MapTransform, ProblemDefinition } from "../types.js";

export const mapTransforms: {
  id: MapTransform;
  label: string;
  code: string;
}[] = [
  {
    id: "double",
    label: "Double each value",
    code: "function double(value) { return value * 2; }",
  },
  {
    id: "addIndex",
    label: "Add the original index",
    code: "function addIndex(value, index) { return value + index; }",
  },
  {
    id: "square",
    label: "Square each value",
    code: "function square(value) { return value * value; }",
  },
  {
    id: "negate",
    label: "Negate each value",
    code: "function negate(value) { return -value; }",
  },
  { id: "zero", label: "Return zero", code: "function zero() { return 0; }" },
];

export const mapArrayProblem: ProblemDefinition = {
  id: "javascript.map-array",
  slug: "map-array",
  subjectId: "javascript",
  topicId: "arrays",
  kind: "map-array",
  inputError:
    "Use a JSON array of 0–1000 integers from -10000 to 10000 and choose a supplied transform.",
  title: "Map Array",
  summary: "Build a new array from a callback's values and original indices.",
  difficulty: "Easy",
  entryFunction: "mapArray",
  starterCode: `/**
 * @param {number[]} arr
 * @param {Function} fn
 * @return {number[]}
 */
function mapArray(arr, fn) {
  // Apply fn(value, index) and collect each returned value.
}
`,
  samples: [
    {
      id: "sample-1",
      input: { arr: [-3, 0, 4], transform: "double" },
      expected: [-6, 0, 8],
      explanation: "Double each value, keeping zero and the original order.",
    },
    {
      id: "sample-2",
      input: { arr: [5, 5, 5], transform: "addIndex" },
      expected: [5, 6, 7],
      explanation:
        "The callbacks receive indices 0, 1 and 2, even though the values are equal.",
    },
    {
      id: "sample-3",
      input: { arr: [], transform: "square" },
      expected: [],
      explanation:
        "There are no elements to transform, so return a new empty array without calling fn.",
    },
  ],
  constraints: [
    "arr is a dense array of 0–1000 integers from -10000 to 10000.",
    "Call fn(arr[i], i) exactly once at each original index, from left to right.",
    "Return a new array containing the callback results in order; leave arr unchanged.",
    "Do not call Array.prototype.map; that method is disabled in this exercise.",
    "The test panel supplies synchronous numeric callbacks. Implement mapArray generically instead of recognizing the selected callback.",
  ],
  hints: [
    "A loop index gives you both the current element and the index expected by fn.",
    "Collect the callback's return value, rather than the original element or only truthy values.",
  ],
  solution: `function mapArray(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}`,
  solutionExplanation:
    "Visit each original position once and append the corresponding callback result. A separate result array preserves the input. Empty input naturally produces an empty result, and zero-valued callback results are kept like any other number.",
};
