import type { CodeWalkthroughDefinition } from "@/features/learning/lib/code-walkthrough";

export const palindromeExample = "racecar";

export const twoPointersWalkthrough = {
  id: "two-pointers-palindrome-check",
  title: "Check a palindrome in JavaScript",
  source: `function isPalindrome(text) {
  let left = 0;
  let right = text.length - 1;

  while (left < right) {
    const matches = text[left] === text[right];

    if (!matches) return false;
    left += 1;
    right -= 1;
  }

  return true;
}

isPalindrome("${palindromeExample}"); // true
isPalindrome("hello"); // false`,
  steps: [
    {
      id: "initialize",
      lines: [2, 3],
      explanation:
        "Put left at the first letter and right at the last. For racecar, the pointers start at indices 0 and 6.",
    },
    {
      id: "loop",
      lines: [5],
      explanation:
        "Keep comparing while left is before right. When the pointers meet or cross, every mirrored pair has already been checked.",
    },
    {
      id: "compare",
      lines: [6],
      explanation:
        "Read the two letters at the current indices. On the first pass through racecar, both letters are r.",
    },
    {
      id: "mismatch",
      lines: [8],
      explanation:
        "A single mismatch is enough to return false. In hello, the first and last letters are h and o, so the function exits here.",
    },
    {
      id: "move-inward",
      lines: [9, 10],
      explanation:
        "After a match, advance left and move right back. The next pass compares the next pair toward the center.",
    },
    {
      id: "complete",
      lines: [13],
      explanation:
        "If the loop finishes, all mirrored pairs matched. For racecar, the pointers meet at e and the function returns true.",
    },
  ],
} as const satisfies CodeWalkthroughDefinition;
