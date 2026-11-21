import type { CatalogAlgorithmDefinition } from "../../types.js";

export const countPairsWithSumProblem = {
  id: "algorithms.count-pairs-with-sum",
  slug: "count-pairs-with-sum",
  title: "Count Pairs With Sum",
  summary: "Count pairs of distinct indices whose values add up to a target.",
  difficulty: "Easy",
  subjectId: "algorithms",
  topicId: "hash-maps",
  kind: "catalog-algorithm",
  entryFunction: "countPairs",
  inputError:
    "Use a JSON array of 1–10,000 integers for arr and an integer for target, all between −10,000 and 10,000.",
  parameters: [
    {
      name: "arr",
      type: "integers",
      minLength: 1,
      maxLength: 10_000,
      min: -10_000,
      max: 10_000,
    },
    { name: "target", type: "integer", min: -10_000, max: 10_000 },
  ],
  starterCode: `function countPairs(arr, target) {
  // Return the number of index pairs that sum to target.
}`,
  samples: [
    {
      id: "mixed-values",
      input: { args: [[5, 2, -1, 8, 3], 7] },
      expected: 2,
      explanation: "The matching pairs use values 5 and 2, and −1 and 8.",
    },
    {
      id: "equal-values",
      input: { args: [[2, 2, 2], 4] },
      expected: 3,
      explanation: "The matching index pairs are (0, 1), (0, 2), and (1, 2).",
    },
    {
      id: "single-element",
      input: { args: [[4], 8] },
      expected: 0,
      explanation: "A pair must use two different indices.",
    },
  ],
  constraints: [
    "1 ≤ arr.length ≤ 10,000.",
    "The values and target are integers from −10,000 through 10,000.",
    "Each pair uses two different indices, counted once in increasing index order.",
  ],
  hints: [
    "For each value, look for earlier occurrences of target − value.",
    "Look up the complement before recording the current occurrence, especially when the two values are equal.",
  ],
  solution: `function countPairs(arr, target) {
  const seen = new Map();
  let pairs = 0;

  for (const value of arr) {
    pairs += seen.get(target - value) ?? 0;
    seen.set(value, (seen.get(value) ?? 0) + 1);
  }

  return pairs;
}`,
  solutionExplanation:
    "At each index the map counts only earlier values, so looking up the complement counts every pair once at its second index. The algorithm takes O(n) expected time and uses O(n) extra space in the worst case.",
} satisfies CatalogAlgorithmDefinition;
