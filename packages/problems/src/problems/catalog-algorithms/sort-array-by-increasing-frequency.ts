import type { CatalogAlgorithmDefinition } from "../../types.js";

export const sortArrayByIncreasingFrequencyProblem = {
  id: "algorithms.sort-array-by-increasing-frequency",
  slug: "sort-array-by-increasing-frequency",
  subjectId: "algorithms",
  topicId: "hash-maps",
  kind: "catalog-algorithm",
  title: "Sort Array by Increasing Frequency",
  summary: "Order values by how often they occur and break ties by value.",
  difficulty: "Easy",
  entryFunction: "frequencySort",
  parameters: [
    {
      name: "nums",
      type: "integers",
      minLength: 1,
      maxLength: 100,
      min: -100,
      max: 100,
    },
  ],
  inputError: "Enter a JSON array of 1–100 integers from −100 through 100.",
  starterCode: `function frequencySort(nums) {
  // Return the values ordered by their frequency.
  return nums;
}`,
  samples: [
    {
      id: "frequency-and-tie",
      input: { args: [[2, 2, -1, 4, -1, 0]] },
      expected: [4, 0, 2, 2, -1, -1],
      explanation:
        "4 and 0 appear once, so both come before 2 and −1. Within each frequency, the larger value comes first.",
    },
    {
      id: "equal-frequencies",
      input: { args: [[-9, 6, 1]] },
      expected: [6, 1, -9],
      explanation:
        "Every number appears once, so descending numeric order decides the entire result.",
    },
  ],
  constraints: [
    "nums contains 1–100 integers between −100 and 100 inclusive.",
    "Keep every occurrence of every value in the returned array.",
  ],
  hints: [
    "Count each value once before sorting. The comparator can reuse those counts.",
    "Compare frequency first, from smallest to largest. Equal frequencies require the reverse comparison for the values.",
  ],
  solution: `function frequencySort(nums) {
  const frequencies = new Map();
  for (const value of nums) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }

  return [...nums].sort((a, b) => {
    const byFrequency = frequencies.get(a) - frequencies.get(b);
    return byFrequency || b - a;
  });
}`,
  solutionExplanation:
    "The frequency table gives the comparator both counts without rescanning the array. " +
    "A zero difference means the counts tie, so the comparator puts the larger integer first. " +
    "Counting and sorting takes O(n log n) time and O(n) extra space.",
} satisfies CatalogAlgorithmDefinition;
