import type { CatalogAlgorithmDefinition } from "../../types.js";

export const validPalindromeProblem: CatalogAlgorithmDefinition = {
  id: "algorithms.valid-palindrome",
  slug: "valid-palindrome",
  subjectId: "algorithms",
  topicId: "two-pointers",
  kind: "catalog-algorithm",
  title: "Valid Palindrome",
  summary:
    "Check whether the letters and digits read the same in both directions.",
  difficulty: "Easy",
  entryFunction: "isPalindrome",
  starterCode: "function isPalindrome(s) {\n  // Write your solution here.\n}",
  inputError: "Use 0 to 200,000 printable ASCII characters.",
  parameters: [
    {
      name: "s",
      type: "string",
      minLength: 0,
      maxLength: 200000,
      alphabet: "ascii",
    },
  ],
  samples: [
    {
      id: "case-1",
      input: {
        args: ["Madam, I'm Adam"],
      },
      expected: true,
      explanation: "The normalized text is madamimadam.",
    },
    {
      id: "case-2",
      input: {
        args: ["0P"],
      },
      expected: false,
      explanation: "The digit 0 and the letter p are different.",
    },
    {
      id: "case-3",
      input: {
        args: [" ?! "],
      },
      expected: true,
      explanation:
        "After removing punctuation and spaces, the empty sequence reads the same both ways.",
    },
  ],
  constraints: ["Use 0 to 200,000 printable ASCII characters."],
  hints: [
    "Compare one character from each end at a time.",
    "Read character codes and advance each pointer past anything outside the ASCII ranges for a letter or digit.",
    "Compare letters in the same case.",
  ],
  solutionExplanation:
    "Use a fixed ASCII lookup table to fold letters to a single case, keep digits, and mark ignored characters with zero. Move two pointers inward, skipping zeros and comparing each remaining pair. Each pointer passes each position at most once, so the solution uses O(n) time and O(1) extra space.",
  solution: `function isPalindrome(s) {
  const folded = new Uint8Array(128);
  for (let digit = 48; digit <= 57; digit++) folded[digit] = digit;
  for (let letter = 65; letter <= 90; letter++) {
    folded[letter] = letter;
    folded[letter + 32] = letter;
  }

  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    let first = folded[s.charCodeAt(left)];
    while (first === 0 && left < right) first = folded[s.charCodeAt(++left)];

    let last = folded[s.charCodeAt(right)];
    while (last === 0 && left < right) last = folded[s.charCodeAt(--right)];

    if (first !== last) return false;
    left++;
    right--;
  }
  return true;
}`,
};
