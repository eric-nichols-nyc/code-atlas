import type { CatalogAlgorithmDefinition } from "../../types.js";

export const removeDuplicatesFromSortedArrayProblem = {
  id: "algorithms.remove-duplicates-from-sorted-array",
  slug: "remove-duplicates-from-sorted-array",
  subjectId: "algorithms",
  topicId: "two-pointers",
  kind: "catalog-algorithm",
  title: "Remove Duplicates from Sorted Array",
  summary:
    "Compact a sorted array so its prefix contains each distinct value once.",
  difficulty: "Easy",
  entryFunction: "removeDuplicates",
  inputError:
    "Enter a sorted JSON array of 1–30,000 integers from −100 to 100.",
  parameters: [
    {
      name: "nums",
      type: "integers",
      minLength: 1,
      maxLength: 30_000,
      min: -100,
      max: 100,
      sorted: true,
    },
  ],
  starterCode: `function removeDuplicates(nums) {
  // Keep the distinct values at the front and return their count.
}`,
  samples: [
    {
      id: "short-run",
      input: { args: [[1, 1, 2]] },
      expected: 2,
      explanation: "The first two positions must contain 1 and 2.",
    },
    {
      id: "several-runs",
      input: { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]] },
      expected: 5,
      explanation: "The required prefix is [0,1,2,3,4].",
    },
  ],
  constraints: [
    "1 ≤ nums.length ≤ 30,000.",
    "The integers range from −100 to 100 and appear in nondecreasing order.",
    "Modify nums in place. Return the number of distinct values.",
  ],
  hints: [
    "In a sorted array, all copies of a given value form a continuous run.",
    "When you reach the start of a run, write that value to the next slot in the prefix.",
  ],
  solution: `function removeDuplicates(nums) {
  let write = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[read - 1]) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write;
}`,
  solutionExplanation:
    "The first value is always part of the answer. The read index spots the start of each later run, while the write index tracks the next slot in the prefix. Writing at or before the read index preserves the values still needed for later comparisons. Time: O(n). Extra space: O(1).",
} satisfies CatalogAlgorithmDefinition;
