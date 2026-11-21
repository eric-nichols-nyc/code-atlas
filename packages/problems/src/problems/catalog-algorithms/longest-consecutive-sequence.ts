import type { CatalogAlgorithmDefinition } from "../../types.js";

export const longestConsecutiveSequenceProblem = {
  id: "algorithms.longest-consecutive-sequence",
  slug: "longest-consecutive-sequence",
  title: "Longest Consecutive Sequence",
  summary: "Find the longest run of consecutive integers in an unsorted array.",
  difficulty: "Medium",
  subjectId: "algorithms",
  topicId: "hash-maps",
  kind: "catalog-algorithm",
  entryFunction: "longestConsecutiveSequence",
  inputError: "Use a JSON array of up to 100,000 signed 32-bit integers.",
  parameters: [
    {
      name: "nums",
      type: "integers",
      minLength: 0,
      maxLength: 100_000,
      min: -2_147_483_648,
      max: 2_147_483_647,
    },
  ],
  starterCode: `function longestConsecutiveSequence(nums) {
  // Return the length of the longest consecutive sequence.
}`,
  samples: [
    {
      id: "unsorted-with-gaps",
      input: { args: [[50, 4, 7, 2, 5, 3, 1]] },
      expected: 5,
      explanation: "The numbers 1 through 5 are all present.",
    },
    {
      id: "repeats",
      input: { args: [[2, 0, -1, 2, 1, -1]] },
      expected: 4,
      explanation: "The run extends from −1 to 2. Repeated values count once.",
    },
    {
      id: "empty",
      input: { args: [[]] },
      expected: 0,
      explanation: "There are no integers in an empty array.",
    },
  ],
  constraints: [
    "0 ≤ nums.length ≤ 100,000.",
    "Every element is a signed 32-bit integer.",
    "Aim for O(n) average time.",
  ],
  hints: [
    "Create a Set so you can look up a neighboring value in constant time on average.",
    "A run starts at a number whose predecessor is missing.",
  ],
  solution: `function longestConsecutiveSequence(nums) {
  const values = new Set(nums);
  let best = 0;

  for (const start of values) {
    if (values.has(start - 1)) continue;

    let next = start + 1;
    while (values.has(next)) {
      next++;
    }
    best = Math.max(best, next - start);
  }

  return best;
}`,
  solutionExplanation:
    "A Set collapses duplicates and makes neighbor lookups fast. Walk a sequence only from its smallest value so each distinct integer belongs to just one walk. The algorithm uses O(n) space and takes O(n) time on average.",
} satisfies CatalogAlgorithmDefinition;
