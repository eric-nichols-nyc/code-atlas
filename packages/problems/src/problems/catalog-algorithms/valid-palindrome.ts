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
    "Move two pointers inward. Skip characters outside the checked alphabet and compare each remaining pair case-insensitively. Each pointer passes each position at most once, so the solution uses O(n) time and O(1) extra space.",
  solution: `function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    const first = s.charCodeAt(left);
    const last = s.charCodeAt(right);
    // In ASCII, setting bit 5 folds uppercase letters to lowercase.
    const firstLower = first | 32;
    const lastLower = last | 32;
    const firstIsDigit = first >= 48 && first <= 57;
    const firstIsLetter = firstLower >= 97 && firstLower <= 122;
    const lastIsDigit = last >= 48 && last <= 57;
    const lastIsLetter = lastLower >= 97 && lastLower <= 122;
    if (!firstIsDigit && !firstIsLetter) {
      left++;
    } else if (!lastIsDigit && !lastIsLetter) {
      right--;
    } else {
      if (firstLower !== lastLower) return false;
      left++;
      right--;
    }
  }
  return true;
}`,
};
