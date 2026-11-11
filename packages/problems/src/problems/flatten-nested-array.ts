import type { ProblemDefinition } from "../types.js";

export const MAX_FLATTEN_DEPTH = 20;
export const MAX_FLATTEN_NODES = 1000;

export const flattenNestedArrayProblem: ProblemDefinition = {
  id: "javascript.flatten-nested-array",
  slug: "flatten-nested-array",
  subjectId: "javascript",
  topicId: "arrays",
  kind: "flatten-array",
  inputError:
    "Use a nested JSON integer array: at most 20 array levels and 1000 total array/number nodes, with integers from -1e9 to 1e9.",
  title: "Flatten Nested Array",
  summary:
    "Traverse nested arrays recursively while preserving every value and its order.",
  difficulty: "Medium",
  entryFunction: "flatten",
  starterCode: `/**
 * @param {Array<number | Array>} arr
 * @return {number[]}
 */
function flatten(arr) {
  // Return every number in a new, fully flattened array.
  // Keep the input unchanged. Do not use flat() or flatMap().
  return [];
}
`,
  samples: [
    {
      id: "sample-1",
      input: { arr: [1, [2, [3, 4]], 5] },
      expected: [1, 2, 3, 4, 5],
      explanation:
        "Visit nested arrays from left to right, continuing until only numbers remain.",
    },
    {
      id: "sample-2",
      input: { arr: [[], [1, []], [[2]], 3] },
      expected: [1, 2, 3],
      explanation:
        "Empty arrays contribute no values, regardless of their nesting level.",
    },
    {
      id: "sample-3",
      input: { arr: [] },
      expected: [],
      explanation: "An empty input returns a new empty array.",
    },
  ],
  constraints: [
    "arr is a dense JSON array whose elements are integers or nested arrays of the same form.",
    "Array nesting is at most 20 levels, including the outer array. There are at most 1000 array/number nodes in total, including the outer array.",
    "Every integer is from -1e9 to 1e9. Zero, negative values and duplicates must be preserved.",
    "Return a new array of numbers in left-to-right order. Do not change the input array or any nested array.",
    "Do not use Array.prototype.flat or flatMap; these built-ins are disabled for this exercise.",
    "Flatten every nesting level. Depth limits, sparse arrays, strings, objects, booleans and null are outside this exercise.",
  ],
  hints: [
    "Visit each item from left to right. Array.isArray(item) tells you whether to keep traversing or append a number.",
    "A helper can visit each nested array and append numbers into one result array. Avoid shift, splice or pop on the input.",
  ],
  solution: `function flatten(arr) {
  const result = [];
  function visit(items) {
    for (const item of items) {
      if (Array.isArray(item)) visit(item);
      else result.push(item);
    }
  }
  visit(arr);
  return result;
}`,
  solutionExplanation:
    "The helper performs a depth-first traversal in the same order as the input. It recursively visits arrays and appends numbers unchanged. Empty arrays add nothing. Only the result is modified, so the input remains intact. Traversal takes O(n) time for n nodes, with O(d) call-stack space for depth d, plus the output array.",
};
