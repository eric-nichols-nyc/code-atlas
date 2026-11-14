import type { ProblemDefinition } from "../types.js";

export const validAnagramProblem = {
  id: "algorithms.valid-anagram",
  slug: "valid-anagram",
  subjectId: "algorithms",
  topicId: "two-pointers",
  kind: "valid-anagram",
  title: "Valid Anagram",
  summary:
    "Compare two strings and check whether their character counts match.",
  difficulty: "Easy",
  entryFunction: "isAnagram",
  inputError: "s and t must be lowercase strings of 0–1000 characters each.",
  starterCode: `function isAnagram(s, t) {
  // Return true if t is an anagram of s.
}
`,
  samples: [
    {
      id: "reordered",
      input: { s: "anagram", t: "nagaram" },
      expected: true,
      explanation:
        "Both strings contain the same letters with the same counts.",
    },
    {
      id: "different",
      input: { s: "rat", t: "car" },
      expected: false,
      explanation: "The letter t in the first string is replaced by c.",
    },
    {
      id: "repeated",
      input: { s: "aab", t: "abb" },
      expected: false,
      explanation:
        "Using the same distinct letters is not enough: their counts must match.",
    },
  ],
  constraints: [
    "0 ≤ s.length, t.length ≤ 1000.",
    "s and t contain only lowercase English letters a–z.",
    "Empty strings are allowed. Do not trim or normalize the inputs.",
    "Return a boolean, not a string, number, or Promise.",
  ],
  hints: [
    "Anagrams must have the same length and the same number of each letter.",
    "Sorting character copies puts matching letters in the same order.",
    "Use one pointer in each sorted copy. Compare the current letters, then move both pointers forward.",
  ],
  solution: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const first = s.split("").sort();
  const second = t.split("").sort();
  let left = 0;
  let right = 0;

  while (left < first.length && right < second.length) {
    if (first[left] !== second[right]) return false;
    left += 1;
    right += 1;
  }

  return left === first.length && right === second.length;
}`,
  solutionExplanation:
    "Reject unequal lengths, then sort character copies so repeated letters line up. " +
    "One forward pointer scans each copy. A mismatch proves the strings are not anagrams; " +
    "finishing both copies proves all character counts match, including two empty strings. " +
    "For strings of length n, sorting takes O(n log n) time and the comparison scan takes O(n). " +
    "Overall: O(n log n) time and O(n) additional space for the character copies. " +
    "A correct character-frequency solution is also accepted.",
} satisfies ProblemDefinition;
