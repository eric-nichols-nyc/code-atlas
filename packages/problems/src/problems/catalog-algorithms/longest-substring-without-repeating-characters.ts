import type { CatalogAlgorithmDefinition } from "../../types.js";

export const longestSubstringWithoutRepeatingCharactersProblem: CatalogAlgorithmDefinition =
  {
    id: "algorithms.longest-substring-without-repeating-characters",
    slug: "longest-substring-without-repeating-characters",
    subjectId: "algorithms",
    topicId: "sliding-window",
    kind: "catalog-algorithm",
    title: "Longest Substring Without Repeating Characters",
    summary:
      "Find the length of the longest contiguous substring whose characters are all distinct.",
    difficulty: "Medium",
    entryFunction: "lengthOfLongestSubstring",
    starterCode:
      "function lengthOfLongestSubstring(s) {\n  // Write your solution here.\n}",
    inputError: "Use 0 to 50,000 JavaScript UTF-16 code units.",
    parameters: [
      {
        name: "s",
        type: "string",
        minLength: 0,
        maxLength: 50000,
      },
    ],
    samples: [
      {
        id: "case-1",
        input: {
          args: ["tmmzuxt"],
        },
        expected: 5,
        explanation: "The window mzuxt has five distinct characters.",
      },
      {
        id: "case-2",
        input: {
          args: ["abba"],
        },
        expected: 2,
        explanation:
          "The two copies of b force the window to move. The longest valid substring has length two.",
      },
      {
        id: "case-3",
        input: {
          args: ["aA1!"],
        },
        expected: 4,
        explanation:
          "Case, digits and punctuation count as distinct characters here.",
      },
    ],
    constraints: ["Use 0 to 50,000 JavaScript UTF-16 code units."],
    hints: [
      "Store the most recent index of every character.",
      "On a repeat inside the window, jump the left boundary past the previous occurrence.",
      "Never move the left boundary backward when a prior occurrence is outside the window.",
    ],
    solutionExplanation:
      "Use a map to jump past the last conflicting position. Taking the maximum of the old boundary and the new position keeps the window from moving backward. The scan takes O(n) time and O(u) extra space for u distinct code units.",
    solution: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const previous = lastSeen.get(s[right]);
    if (previous !== undefined) left = Math.max(left, previous + 1);
    lastSeen.set(s[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
  };
