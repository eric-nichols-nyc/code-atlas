import type { ProblemDefinition } from "../types.js";

export const mostFrequentCharacterProblem = {
  id: "algorithms.most-frequent-character",
  slug: "most-frequent-character",
  subjectId: "algorithms",
  topicId: "hash-maps",
  kind: "most-frequent-character",
  title: "Most Frequent Character",
  summary: "Count characters in a string and track the most frequent one.",
  difficulty: "Easy",
  entryFunction: "findMostFrequentChar",
  inputError: "str must be a string of 0–1000 UTF-16 code units.",
  starterCode: `function findMostFrequentChar(str) {
  // Return the most frequent character, or an empty string for empty input.
}
`,
  samples: [
    {
      id: "javascript",
      input: { str: "javascript" },
      expected: "a",
      explanation:
        "The letter a occurs twice; every other character occurs once.",
    },
    {
      id: "tie",
      input: { str: "abba" },
      expected: "b",
      explanation:
        "Both letters occur twice. The second b appears before the second a, so b reaches the winning count first.",
    },
    {
      id: "empty",
      input: { str: "" },
      expected: "",
      explanation: "There are no characters, so return the empty string.",
    },
  ],
  constraints: [
    "0 ≤ str.length ≤ 1000, measured in JavaScript UTF-16 code units.",
    "Characters are counted as Unicode code points, as with JavaScript for...of. Do not normalize the input.",
    "Comparisons are case-sensitive. Spaces, punctuation and digits count as characters.",
    "For a tie, return the character that first reaches the highest final frequency during a left-to-right scan.",
    "Return a primitive string containing the winning character, or an empty string for empty input; do not return a count, object or Promise.",
  ],
  hints: [
    "Keep a frequency table keyed by character. An object or Map can store the counts.",
    "Scan with for...of and increment the current character's count.",
    "Keep maxChar and maxCount. Replace the winner only when the new count is strictly greater than maxCount.",
    "Initialize maxChar to an empty string and maxCount to zero so empty input works without a special case.",
  ],
  solution: `function findMostFrequentChar(str) {
  const counts = {};
  let maxChar = '';
  let maxCount = 0;

  for (const char of str) {
    counts[char] = (counts[char] || 0) + 1;

    if (counts[char] > maxCount) {
      maxCount = counts[char];
      maxChar = char;
    }
  }

  return maxChar;
}`,
  solutionExplanation:
    "The frequency table records each character's count in the prefix scanned so far. " +
    "Whenever a count exceeds the previous maximum, update both the count and winning character. " +
    "The strict > comparison keeps the first character to reach a tied winning count; " +
    "this is not necessarily the character whose first occurrence is earliest. " +
    "For example, abba returns b because b reaches two occurrences first. " +
    "The empty input returns the initial empty string. Case, whitespace and Unicode code points are preserved. " +
    "Time: O(n). Extra space: O(k), where k is the number of distinct code points.",
} satisfies ProblemDefinition;
