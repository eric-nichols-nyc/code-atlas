import type { QuizQuestion } from "@/features/learning/lib/lesson-quiz";

export const slidingWindowQuestions = [
  {
    id: "contiguous-range",
    prompt: "Which selection is a window in [8, 4, 7, 2]?",
    options: ["8 and 7", "4 followed by 7", "7 followed by 4", "8, 4, and 2"],
    correctIndex: 1,
    explanation:
      "4 and 7 occupy neighboring indices in the original array. A window includes every index between its two edges.",
  },
  {
    id: "rolling-sum",
    prompt:
      "The three-value window moves from [1, 3, 2] to [3, 2, 5]. How do you update its sum of 6?",
    options: [
      "Add 5 and subtract 2.",
      "Add 1 and subtract 5.",
      "Subtract 1 and add 5.",
      "Add 3 and 2 again.",
    ],
    correctIndex: 2,
    explanation:
      "1 leaves and 5 enters. The shared values 3 and 2 are already in the sum, so the new total is 6 − 1 + 5 = 10.",
  },
  {
    id: "keep-best",
    prompt:
      "Your best window sum is 16. The next window sums to 12. Which values should you keep?",
    options: [
      "Current sum 12 and best sum 16.",
      "Current sum 16 and best sum 12.",
      "Current sum 12 and best sum 12.",
      "Current sum 16 and best sum 16.",
    ],
    correctIndex: 0,
    explanation:
      "Carry 12 forward to calculate the next window. Keep 16 separately because it is still the largest sum seen.",
  },
  {
    id: "restore-uniqueness",
    prompt:
      "Adding a b turns a unique-character window from “ab” into “abb”. How far should the left edge move?",
    options: [
      "Leave it at a.",
      "Move it past a only.",
      "Drop the newest b from the right.",
      "Move it past a and the first b.",
    ],
    correctIndex: 3,
    explanation:
      "After a leaves, “bb” still has a repeated character. Removing the first b leaves a valid window containing just the newer b.",
  },
  {
    id: "shortest-window",
    prompt:
      "A window now contains all the characters you need. What should a shortest-window search try next?",
    options: [
      "Record it and widen the window as far as possible.",
      "Record it and shrink from the left while it stays valid.",
      "Keep both edges still for the next iteration.",
      "Reset the left edge to the start of the input.",
    ],
    correctIndex: 1,
    explanation:
      "Shrinking a valid window can reveal a shorter valid range with the same right edge.",
  },
  {
    id: "total-moves",
    prompt:
      "Why can a variable-size scan take O(n) time even if one change to the right edge triggers several left moves?",
    options: [
      "Every right move triggers exactly one left move.",
      "The left edge resets after every valid window.",
      "Across the whole scan, each edge only travels forward through the input once.",
      "The number of possible substrings is linear.",
    ],
    correctIndex: 2,
    explanation:
      "Count moves over the entire scan. Each edge advances at most n times, and each update takes constant time in this example.",
  },
  {
    id: "mixed-sign-sums",
    prompt:
      "Why does a sum comparison alone give unreliable pointer moves when the array can contain negative numbers?",
    options: [
      "Removing a negative value raises the sum.",
      "Adding a negative value always raises the sum.",
      "The window length can become negative.",
      "A running sum requires unique values.",
    ],
    correctIndex: 0,
    explanation:
      "Removing −3 increases the sum by 3. For an exact sum with mixed signs, use prefix sums and a map to look for the matching earlier prefix.",
  },
  {
    id: "alphabet-counts",
    prompt:
      "You are matching anagrams in a string made of lowercase English letters. What compact state tracks duplicates too?",
    options: [
      "A set of the letters present.",
      "The sum of the character codes.",
      "The first and last letters only.",
      "A 26-slot array of occurrence counts.",
    ],
    correctIndex: 3,
    explanation:
      "Each slot records how often one letter occurs. Anagrams require matching counts, including repeated letters.",
  },
  {
    id: "deque-front",
    prompt:
      "In a sliding maximum, which candidate does the front of a decreasing deque hold?",
    options: [
      "The most recently added index.",
      "The index of the largest value still in the window.",
      "The index of the smallest value still in the window.",
      "The first index that already left the window.",
    ],
    correctIndex: 1,
    explanation:
      "Remove expired indices from the front and smaller candidates from the back. The front then identifies the largest current value.",
  },
  {
    id: "median-state",
    prompt:
      "Which pair of heaps gives direct access to the values on either side of a window’s median?",
    options: [
      "Two min-heaps, both holding the lower half.",
      "One min-heap for the lower half and one max-heap for the upper half.",
      "A max-heap for the lower half and a min-heap for the upper half.",
      "Two max-heaps, both holding the upper half.",
    ],
    correctIndex: 2,
    explanation:
      "The two roots expose the largest value in the lower half and the smallest in the upper half. Keep the heaps balanced and remove values that leave the window.",
  },
] as const satisfies readonly [QuizQuestion, ...QuizQuestion[]];
