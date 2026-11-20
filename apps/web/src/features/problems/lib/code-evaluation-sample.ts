import type { CodeEvaluation } from "./code-evaluation-contract";

// A fixed public example for layout review; never derived from the learner's code.
export const SAMPLE_EVALUATION_SOURCE = `function majorityElement(nums) {
  let majority = 0;
  for (let i = 1; i < nums.length; i++) {
    const count = nums.filter(value => value === nums[i]).length;
    if (count > nums.length / 2) majority = nums[i];
  }
  return majority;
}`;
export const SAMPLE_EVALUATION: CodeEvaluation = {
  rubricVersion: "1",
  summary:
    "The counting approach usually finds the majority, but it skips single-element inputs and repeats work for every value.",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(n)",
  criteria: {
    correctness: {
      score: 3,
      explanation:
        "Counting occurrences identifies the majority for arrays with at least two elements. However, starting the loop at index 1 means [5] returns the initial value 0 instead of 5.",
    },
    efficiency: {
      score: 1,
      explanation:
        "Each iteration filters the entire array and allocates a temporary array. A single-pass voting approach would reduce the running time to O(n) and auxiliary space to O(1).",
    },
    quality: {
      score: 2,
      explanation:
        "The majority and count names communicate their roles clearly. The function has a straightforward structure and returns a number as required.",
    },
    edgeCases: {
      score: 0,
      explanation:
        "A single-element array is allowed by the problem. Try [5] or [-2]: the loop never runs and returns 0. The special case [0] passes only because it matches the initial value.",
    },
  },
  improvements: [
    "Handle the allowed single-element case instead of relying on the initial value of majority.",
    "Avoid filtering the full array repeatedly; use a strategy that visits each element once.",
  ],
};
