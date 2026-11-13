import type { ProblemDefinition } from "../types.js";

export const chunkArrayProblem: ProblemDefinition = {
  id: "javascript.chunk-array",
  slug: "chunk-array",
  subjectId: "javascript",
  topicId: "arrays",
  kind: "chunk-array",
  inputError:
    "Use a JSON array of 0–1000 integers from -1e9 to 1e9 and an integer size from 1 to 1000.",
  title: "Chunk Array",
  summary:
    "Split an array into consecutive groups while preserving its contents.",
  difficulty: "Easy",
  entryFunction: "chunkArray",
  starterCode: `/**
 * @param {number[]} arr
 * @param {number} size
 * @return {number[][]}
 */
function chunkArray(arr, size) {
  // Return consecutive groups of at most size elements.
}
`,
  samples: [
    {
      id: "sample-1",
      input: { arr: [8, 0, -3, 8, 2], size: 2 },
      expected: [[8, 0], [-3, 8], [2]],
      explanation:
        "Take two elements at a time. The final group contains the remaining element.",
    },
    {
      id: "sample-2",
      input: { arr: [7, -1], size: 5 },
      expected: [[7, -1]],
      explanation:
        "A size larger than the input produces one group containing all input values.",
    },
    {
      id: "sample-3",
      input: { arr: [], size: 3 },
      expected: [],
      explanation:
        "Empty input has no groups; do not add an empty final group.",
    },
  ],
  constraints: [
    "arr is a dense array of 0–1000 integers from -1e9 to 1e9; size is an integer from 1 to 1000.",
    "Preserve the original element order, duplicates, zero and negative values.",
    "Every group has size elements except the last, which may be shorter. Do not include empty groups.",
    "Return a new outer array and a distinct new array for each group, including groups with identical values. Leave arr unchanged.",
    "Standard JavaScript array methods such as slice are allowed. No external library is available.",
  ],
  hints: [
    "Each new group starts size positions after the previous one.",
    "slice(start, end) copies the selected range without removing elements from the input.",
  ],
  solution: `function chunkArray(arr, size) {
  const chunks = [];
  for (let start = 0; start < arr.length; start += size) {
    chunks.push(arr.slice(start, start + size));
  }
  return chunks;
}`,
  solutionExplanation:
    "Move the start index forward by size after each copied range. slice stops at the end of the input when the requested range is longer than the remaining values, so the final group needs no special padding. The loop does not run for an empty input.",
};
