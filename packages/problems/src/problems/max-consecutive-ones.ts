import type { ProblemDefinition } from "../types.js";

export const MAX_CONSECUTIVE_ONES_LENGTH = 100_000;

export const maxConsecutiveOnesProblem = {
  id: "algorithms.max-consecutive-ones",
  slug: "max-consecutive-ones",
  subjectId: "algorithms",
  topicId: "sliding-window",
  kind: "max-consecutive-ones",
  title: "Max Consecutive Ones",
  summary: "Find the longest uninterrupted streak of ones in a binary array.",
  difficulty: "Easy",
  entryFunction: "findMaxConsecutiveOnes",
  inputError: "Use a JSON array of 1–100,000 numbers, each 0 or 1.",
  starterCode: `function findMaxConsecutiveOnes(nums) {
  // Return the length of the longest run of 1s.
  return 0;
}`,
  samples: [
    {
      id: "longest-at-end",
      input: { nums: [1, 1, 0, 1, 1, 1] },
      expected: 3,
      explanation: "The final three ones form the longest streak.",
    },
    {
      id: "longest-in-middle",
      input: { nums: [1, 0, 1, 1, 0, 1] },
      expected: 2,
      explanation: "The longest streak starts at index 2 and ends at index 3.",
    },
  ],
  constraints: [
    "1 ≤ nums.length ≤ 100,000.",
    "Each entry is the number 0 or 1.",
    "Return the streak length as an integer.",
  ],
  hints: [
    "Track the length of the streak that ends at your current position.",
    "A zero ends the current streak. Remember the longest streak so far before moving on.",
  ],
  solution: `function findMaxConsecutiveOnes(nums) {
  let current = 0;
  let longest = 0;

  for (const bit of nums) {
    current = bit === 1 ? current + 1 : 0;
    longest = Math.max(longest, current);
  }

  return longest;
}`,
  solutionExplanation:
    "Each one extends the current streak and each zero resets it. Update the best length as you read so a streak at the end counts too. " +
    "Time: O(n). Extra space: O(1).",
} satisfies ProblemDefinition;
