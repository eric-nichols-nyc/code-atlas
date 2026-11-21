import type { CatalogAlgorithmDefinition } from "../../types.js";

export const reverseVowelsOfAStringProblem: CatalogAlgorithmDefinition = {
  id: "algorithms.reverse-vowels-of-a-string",
  slug: "reverse-vowels-of-a-string",
  subjectId: "algorithms",
  topicId: "two-pointers",
  kind: "catalog-algorithm",
  title: "Reverse Vowels of a String",
  summary:
    "Reverse the sequence of vowels while leaving other characters in place.",
  difficulty: "Easy",
  entryFunction: "reverseVowels",
  starterCode: "function reverseVowels(s) {\n  // Write your solution here.\n}",
  inputError: "Use 1 to 300,000 printable ASCII characters.",
  parameters: [
    {
      name: "s",
      type: "string",
      minLength: 1,
      maxLength: 300000,
      alphabet: "ascii",
    },
  ],
  samples: [
    {
      id: "case-1",
      input: {
        args: ["Game On!"],
      },
      expected: "GOme an!",
      explanation:
        "The vowels a, e, O become O, e, a in the same three positions.",
    },
    {
      id: "case-2",
      input: {
        args: ["rhythm"],
      },
      expected: "rhythm",
      explanation: "There are no vowels to exchange.",
    },
    {
      id: "case-3",
      input: {
        args: ["aE"],
      },
      expected: "Ea",
      explanation: "The uppercase E moves with its original case.",
    },
  ],
  constraints: ["Use 1 to 300,000 printable ASCII characters."],
  hints: [
    "Walk inward from both ends.",
    "Stop each pointer when it reaches a vowel, then swap the two vowels.",
    "Check both uppercase and lowercase vowels so each character keeps its case.",
  ],
  solutionExplanation:
    "Skip nonvowels and swap each pair of vowels from the outside in. Each pointer scans at most n positions. The running time is O(n) and JavaScript strings are immutable, so the working array takes O(n) extra space.",
  solution: `function reverseVowels(s) {
  const chars = s.split("");
  const vowels = {
    a: true, e: true, i: true, o: true, u: true,
    A: true, E: true, I: true, O: true, U: true,
  };
  let left = 0;
  let right = chars.length - 1;
  while (left < right) {
    while (left < right && !vowels[chars[left]]) left++;
    while (left < right && !vowels[chars[right]]) right--;
    if (left < right) {
      const vowel = chars[left];
      chars[left++] = chars[right];
      chars[right--] = vowel;
    }
  }
  return chars.join("");
}`,
};
