import type { CatalogAlgorithmDefinition } from "../../types.js";

export const maximumSumSubarrayOfSizeKProblem = {
  id: "algorithms.maximum-sum-subarray-of-size-k",
  slug: "maximum-sum-subarray-of-size-k",
  title: "Maximum Sum Subarray of Size K",
  summary: "Find the largest sum among contiguous windows of a fixed size.",
  difficulty: "Easy",
  subjectId: "algorithms",
  topicId: "sliding-window",
  kind: "catalog-algorithm",
  entryFunction: "maxSumSubarray",
  inputError:
    "Use a JSON array of 1–100,000 integers between −10,000 and 10,000 and an integer k between 1 and arr.length.",
  parameters: [
    {
      name: "arr",
      type: "integers",
      minLength: 1,
      maxLength: 100_000,
      min: -10_000,
      max: 10_000,
    },
    {
      name: "k",
      type: "integer",
      min: 1,
      max: 100_000,
      maxLengthOfArgument: 0,
    },
  ],
  starterCode: `function maxSumSubarray(arr, k) {
  // Return the largest sum of exactly k consecutive values.
}`,
  samples: [
    {
      id: "middle-window",
      input: { args: [[2, 7, 3, 5, 1], 3] },
      expected: 15,
      explanation: "The largest window is [7, 3, 5], with a sum of 15.",
    },
    {
      id: "negative-values",
      input: { args: [[-8, -2, -4, -9], 2] },
      expected: -6,
      explanation: "The largest window is [−2, −4], with a sum of −6.",
    },
    {
      id: "full-width",
      input: { args: [[4, -1, 5], 3] },
      expected: 8,
      explanation: "The whole array is the only window of size 3.",
    },
  ],
  constraints: [
    "1 ≤ k ≤ arr.length ≤ 100,000.",
    "Every element is an integer from −10,000 through 10,000.",
  ],
  hints: [
    "Use the sum of the first k values as your initial maximum.",
    "When a window advances, add the incoming value and subtract the outgoing value.",
  ],
  solution: `function maxSumSubarray(arr, k) {
  let sum = 0;
  for (let index = 0; index < k; index++) {
    sum += arr[index];
  }

  let best = sum;
  for (let right = k; right < arr.length; right++) {
    sum += arr[right] - arr[right - k];
    best = Math.max(best, sum);
  }

  return best;
}`,
  solutionExplanation:
    "After summing the first window, advance one index at a time. Only two values change membership at each step, so every new sum takes constant time. The algorithm takes O(n) time and uses O(1) extra space.",
} satisfies CatalogAlgorithmDefinition;
