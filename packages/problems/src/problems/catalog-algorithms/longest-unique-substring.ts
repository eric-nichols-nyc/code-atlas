import type { CatalogAlgorithmDefinition } from "../../types.js";

export const longestUniqueSubstringProblem: CatalogAlgorithmDefinition = {
  id: "algorithms.longest-unique-substring",
  slug: "longest-unique-substring",
  subjectId: "algorithms",
  topicId: "sliding-window",
  kind: "catalog-algorithm",
  title: "Longest Unique Substring",
  summary:
    "Find the length of the longest contiguous window with no repeated characters.",
  difficulty: "Easy",
  entryFunction: "longestUnique",
  starterCode:
    "function longestUnique(str) {\n  // Write your solution here.\n}",
  inputError: "Use 0 to 50,000 JavaScript UTF-16 code units.",
  parameters: [
    {
      name: "str",
      type: "string",
      minLength: 0,
      maxLength: 50000,
    },
  ],
  samples: [
    {
      id: "case-1",
      input: {
        args: ["pwwkew"],
      },
      expected: 3,
      explanation: "Both wke and kew are windows of length three.",
    },
    {
      id: "case-2",
      input: {
        args: ["n n"],
      },
      expected: 2,
      explanation:
        "The space counts as a character. A window containing both copies of n is invalid.",
    },
    {
      id: "case-3",
      input: {
        args: [""],
      },
      expected: 0,
      explanation: "The empty string has no nonempty window.",
    },
  ],
  constraints: ["Use 0 to 50,000 JavaScript UTF-16 code units."],
  hints: [
    "Track the characters inside a window in a Set.",
    "When the next character is already present, remove characters from the left until you can add it.",
    "Record the longest window after extending it.",
  ],
  solutionExplanation:
    "The Set contains exactly the characters in the current window. Remove from the left only until the next character can be added. Each position is added and removed at most once, so the scan takes O(n) time and O(u) extra space for u distinct code units.",
  solution: `function longestUnique(str) {
  const seen = new Set();
  let left = 0;
  let best = 0;
  for (let right = 0; right < str.length; right++) {
    const next = str[right];
    while (seen.has(next)) seen.delete(str[left++]);
    seen.add(next);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
};
