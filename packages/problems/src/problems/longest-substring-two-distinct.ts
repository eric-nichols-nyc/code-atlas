import type { ProblemDefinition } from "../types.js";

export const longestSubstringTwoDistinctProblem = {
  id: "algorithms.longest-substring-two-distinct",
  slug: "longest-substring-two-distinct",
  subjectId: "algorithms",
  topicId: "sliding-window",
  kind: "longest-substring-two-distinct",
  title: "Longest Substring with At Most Two Distinct Characters",
  summary:
    "Find the longest contiguous window containing at most two different letters.",
  difficulty: "Medium",
  entryFunction: "lengthOfLongestSubstringTwoDistinct",
  inputError:
    "s must contain 1–100000 English letters (a–z or A–Z). Case matters.",
  starterCode: `function lengthOfLongestSubstringTwoDistinct(s) {
  // Return the length of the longest substring with at most two distinct letters.
}
`,
  samples: [
    {
      id: "third-letter",
      input: { s: "eceba" },
      expected: 3,
      explanation:
        'The longest valid substring is "ece", which contains only e and c.',
    },
    {
      id: "repeated-letters",
      input: { s: "ccaabbb" },
      expected: 5,
      explanation:
        'The substring "aabbb" has length 5 and contains only a and b.',
    },
    {
      id: "single-letter",
      input: { s: "a" },
      expected: 1,
      explanation:
        "A single letter already satisfies the distinct-character limit.",
    },
  ],
  constraints: [
    "1 ≤ s.length ≤ 100000.",
    "s contains only uppercase and lowercase English letters (A–Z and a–z).",
    "Characters are case-sensitive: A and a are distinct.",
    "A substring is contiguous; return its length as an integer, not the substring itself or a Promise.",
  ],
  hints: [
    "Keep a sliding window from left to right that contains at most two distinct letters.",
    "Track how many times each letter occurs inside the current window.",
    "When a third distinct letter enters, shrink from the left until a count reaches zero and can be removed.",
    "After restoring a valid window, compare right - left + 1 with the best length so far.",
  ],
  solution: `function lengthOfLongestSubstringTwoDistinct(s) {
  const counts = new Map();
  let left = 0;
  let longest = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    counts.set(char, (counts.get(char) ?? 0) + 1);

    while (counts.size > 2) {
      const outgoing = s[left];
      const remaining = counts.get(outgoing) - 1;
      if (remaining === 0) counts.delete(outgoing);
      else counts.set(outgoing, remaining);
      left++;
    }

    longest = Math.max(longest, right - left + 1);
  }

  return longest;
}`,
  solutionExplanation:
    "Expand the right boundary and count the new letter. If there are three distinct letters, " +
    "advance the left boundary while removing outgoing letters until only two remain. " +
    "The resulting window is valid, so record its length. Each boundary advances at most n times: " +
    "O(n) time and O(1) auxiliary space, since the map holds at most three distinct letters during an update. " +
    "Compare letters exactly; uppercase and lowercase forms are different characters.",
} satisfies ProblemDefinition;
