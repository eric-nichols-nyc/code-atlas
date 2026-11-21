import type { ProblemDefinition } from "../types.js";

export const MAX_MOVE_ZEROES_LENGTH = 10_000;

export const moveZeroesProblem = {
  id: "algorithms.move-zeroes",
  slug: "move-zeroes",
  subjectId: "algorithms",
  topicId: "two-pointers",
  kind: "move-zeroes",
  title: "Move Zeroes",
  summary: "Move zeroes to the end of an array in place.",
  difficulty: "Easy",
  entryFunction: "moveZeroes",
  inputError: "Use a JSON array of 1–10,000 signed 32-bit integers.",
  starterCode: `function moveZeroes(nums) {
  // Move the zeroes to the end of nums in place.
  return nums;
}`,
  samples: [
    {
      id: "interleaved",
      input: { nums: [0, 1, 0, 3, 12] },
      expected: [1, 3, 12, 0, 0],
      explanation: "The nonzero values stay in their original order: 1, 3, 12.",
    },
    {
      id: "single-zero",
      input: { nums: [0] },
      expected: [0],
      explanation: "The only element is already a zero.",
    },
  ],
  constraints: [
    "1 ≤ nums.length ≤ 10,000.",
    "Every value is a signed 32-bit integer (−2,147,483,648 through 2,147,483,647).",
    "Modify nums in place and keep the relative order of nonzero values.",
  ],
  hints: [
    "Keep a write index for the next position a nonzero value should occupy.",
    "Read from left to right. Write each nonzero value and advance the write index. What should fill the rest of the array?",
  ],
  solution: `function moveZeroes(nums) {
  let write = 0;

  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      nums[write] = nums[read];
      write++;
    }
  }

  while (write < nums.length) {
    nums[write] = 0;
    write++;
  }
  return nums;
}`,
  solutionExplanation:
    "The read index visits each element in order, while the write index marks the next open position. " +
    "It never advances past the read index, so the scan cannot overwrite a value it still needs. " +
    "Fill the remaining positions with zeroes. Time: O(n). Extra space: O(1).",
} satisfies ProblemDefinition;
