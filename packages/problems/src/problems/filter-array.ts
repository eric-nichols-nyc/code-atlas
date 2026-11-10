import type { FilterPredicate, ProblemDefinition } from "../types.js";
export const filterPredicates: {
  id: FilterPredicate;
  label: string;
  code: string;
}[] = [
  {
    id: "greaterThan10",
    label: "Greater than 10",
    code: "function greaterThan10(n) { return n > 10; }",
  },
  {
    id: "firstIndex",
    label: "First index",
    code: "function firstIndex(n, i) { return i === 0; }",
  },
  {
    id: "plusOne",
    label: "Value plus one",
    code: "function plusOne(n) { return n + 1; }",
  },
  {
    id: "evenIndex",
    label: "Even index",
    code: "function evenIndex(n, i) { return i % 2 === 0; }",
  },
  {
    id: "isPositive",
    label: "Positive values",
    code: "function isPositive(n) { return n > 0; }",
  },
  {
    id: "isTruthy",
    label: "Value truthiness",
    code: "function isTruthy(n) { return n; }",
  },
  {
    id: "alwaysFalse",
    label: "Always false",
    code: "function alwaysFalse() { return false; }",
  },
];
export const filterArrayProblem: ProblemDefinition = {
  id: "javascript.filter-elements-from-array",
  slug: "filter-elements-from-array",
  subjectId: "javascript",
  topicId: "arrays",
  kind: "filter-array",
  inputError:
    "Use a JSON array of 0–1000 integers from -1e9 to 1e9 and choose one of the supplied callbacks.",
  title: "Filter Elements from Array",
  summary:
    "Use callback values, original indices and truthiness to select array elements.",
  difficulty: "Easy",
  entryFunction: "filter",
  starterCode: `/**\n * @param {number[]} arr\n * @param {Function} fn\n * @return {number[]}\n */\nfunction filter(arr, fn) {\n  // Return original elements whose callback result is truthy.\n}\n`,
  samples: [
    {
      id: "sample-1",
      input: { arr: [0, 10, 20, 30], predicate: "greaterThan10" },
      expected: [20, 30],
      explanation:
        "Only 20 and 30 satisfy the supplied greater-than-10 callback.",
    },
    {
      id: "sample-2",
      input: { arr: [1, 2, 3], predicate: "firstIndex" },
      expected: [1],
      explanation: "The callback selects the element at original index zero.",
    },
    {
      id: "sample-3",
      input: { arr: [-2, -1, 0, 1, 2], predicate: "plusOne" },
      expected: [-2, 0, 1, 2],
      explanation:
        "n + 1 is falsy only for -1 here. Keep the original values, not the callback's return values.",
    },
  ],
  constraints: [
    "arr contains 0–1000 integers, each from -1e9 to 1e9.",
    "Call fn with the element and its original zero-based index.",
    "Keep original elements in their original order when the callback result is truthy.",
    "Do not use Array.prototype.filter; that built-in is disabled in this exercise.",
    "The test panel lets you edit arr and select a supplied fn callback. Non-boolean callback returns use normal JavaScript truthiness.",
  ],
  hints: [
    "Create an output array and visit each original index.",
    "Use if (fn(arr[i], i)) rather than comparing the callback result to true.",
  ],
  solution: `function filter(arr, fn) {\n  const result = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (fn(arr[i], i)) result.push(arr[i]);\n  }\n  return result;\n}`,
  solutionExplanation:
    "Each callback receives the original element and index. An if condition applies JavaScript truthiness, so nonzero numbers and other truthy returns qualify. Push the original element to preserve values and order.",
};
