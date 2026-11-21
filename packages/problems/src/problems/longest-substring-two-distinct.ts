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
    "Remember the last letter, the other letter in the window, and the length of the trailing run of the last letter.",
    "When a third distinct letter enters, the new window contains only the trailing run and the new letter.",
    "Compare the length of each valid window with the best length so far.",
  ],
  solution: `function lengthOfLongestSubstringTwoDistinct(s) {
  let longest = 0;
  let windowLength = 0;
  let tailLength = 0;
  let last = -1;
  let other = -1;

  for (let index = 0; index < s.length; index++) {
    const letter = s.charCodeAt(index);
    if (letter === last) {
      tailLength++;
      windowLength++;
    } else {
      windowLength = (letter === other ? windowLength : tailLength) + 1;
      other = last;
      last = letter;
      tailLength = 1;
    }
    if (windowLength > longest) longest = windowLength;
  }

  return longest;
}`,
  solutionExplanation:
    "Track the longest valid window ending at the current index and the length of its trailing run of one letter. " +
    "A letter already in the window extends it. A third letter starts a new window with the trailing run, which is the longest suffix containing only the most recent letter. " +
    "One pass takes O(n) time and uses O(1) extra space. Character codes preserve the distinction between uppercase and lowercase.",
} satisfies ProblemDefinition;
