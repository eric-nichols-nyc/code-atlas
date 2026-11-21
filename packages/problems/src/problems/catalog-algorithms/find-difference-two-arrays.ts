import type { CatalogAlgorithmDefinition } from "../../types.js";

export const findDifferenceTwoArraysProblem = {
  id: "algorithms.find-difference-two-arrays",
  slug: "find-difference-two-arrays",
  subjectId: "algorithms",
  topicId: "hash-maps",
  kind: "catalog-algorithm",
  title: "Find the Difference of Two Arrays",
  summary: "Find the values exclusive to each of two arrays.",
  difficulty: "Easy",
  entryFunction: "findDifference",
  parameters: [
    {
      name: "nums1",
      type: "integers",
      minLength: 1,
      maxLength: 1000,
      min: -1000,
      max: 1000,
    },
    {
      name: "nums2",
      type: "integers",
      minLength: 1,
      maxLength: 1000,
      min: -1000,
      max: 1000,
    },
  ],
  inputError:
    "Enter two JSON integer arrays with 1–1,000 values from −1,000 through 1,000 in each.",
  starterCode: `function findDifference(nums1, nums2) {
  // Return a pair of arrays with the numbers unique to each side.
  return [[], []];
}`,
  samples: [
    {
      id: "duplicates-and-overlap",
      input: {
        args: [
          [4, -2, 7, 4],
          [7, 3, -2],
        ],
      },
      expected: [[4], [3]],
      explanation:
        "Both arrays contain 7 and −2. The remaining numbers appear once in their respective result lists.",
    },
    {
      id: "matching-sets",
      input: {
        args: [
          [0, 5, 0],
          [5, 0, 5],
        ],
      },
      expected: [[], []],
      explanation:
        "The arrays have the same distinct values, even though their order and counts differ.",
    },
  ],
  constraints: [
    "Each array contains 1–1,000 integers.",
    "Each integer is between −1,000 and 1,000 inclusive.",
    "Return the exclusive numbers from nums1 first and the exclusive numbers from nums2 second. The order within either list is arbitrary.",
  ],
  hints: [
    "Use a Set to keep one copy of each value and make membership checks fast.",
    "Scan one set at a time. Which values are missing from the other set?",
  ],
  solution: `function findDifference(nums1, nums2) {
  const first = new Set(nums1);
  const second = new Set(nums2);

  const onlyInFirst = [...first].filter(value => !second.has(value));
  const onlyInSecond = [...second].filter(value => !first.has(value));
  return [onlyInFirst, onlyInSecond];
}`,
  solutionExplanation:
    "A set removes duplicates before we compare membership. Each scan filters out the values that appear on both sides. " +
    "With typical constant-time set lookups, this takes O(n + m) time and O(n + m) extra space.",
} satisfies CatalogAlgorithmDefinition;
