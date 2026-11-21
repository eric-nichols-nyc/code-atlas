import type { CatalogAlgorithmDefinition } from "../../types.js";

export const mergeStringsAlternatelyProblem: CatalogAlgorithmDefinition = {
  id: "algorithms.merge-strings-alternately",
  slug: "merge-strings-alternately",
  subjectId: "algorithms",
  topicId: "two-pointers",
  kind: "catalog-algorithm",
  title: "Merge Strings Alternately",
  summary: "Interleave two words and append the remainder of the longer word.",
  difficulty: "Easy",
  entryFunction: "mergeAlternately",
  starterCode:
    "function mergeAlternately(word1, word2) {\n  // Write your solution here.\n}",
  inputError: "Each word contains 1 to 100 lowercase English letters.",
  parameters: [
    {
      name: "word1",
      type: "string",
      minLength: 1,
      maxLength: 100,
      alphabet: "lowercase",
    },
    {
      name: "word2",
      type: "string",
      minLength: 1,
      maxLength: 100,
      alphabet: "lowercase",
    },
  ],
  samples: [
    {
      id: "case-1",
      input: {
        args: ["dog", "cat"],
      },
      expected: "dcoagt",
      explanation:
        "Each word has three letters, so the entire result alternates.",
    },
    {
      id: "case-2",
      input: {
        args: ["ab", "wxyz"],
      },
      expected: "awbxyz",
      explanation: "After a, w, b and x, append the remaining yz.",
    },
    {
      id: "case-3",
      input: {
        args: ["desk", "z"],
      },
      expected: "dzesk",
      explanation: "Start with d, then take z, then append esk.",
    },
  ],
  constraints: ["Each word contains 1 to 100 lowercase English letters."],
  hints: [
    "Read the first letter from the first word.",
    "Advance through both words at the same index while both have a letter.",
    "Append the unprocessed suffix of either word.",
  ],
  solutionExplanation:
    "Pair letters that share an index. Once one word runs out, append both suffixes, one of which is empty. This takes O(m + n) time and space for the result.",
  solution: `function mergeAlternately(word1, word2) {
  let result = "";
  const sharedLength = Math.min(word1.length, word2.length);
  for (let index = 0; index < sharedLength; index++) {
    result += word1[index] + word2[index];
  }
  return result + word1.slice(sharedLength) + word2.slice(sharedLength);
}`,
};
