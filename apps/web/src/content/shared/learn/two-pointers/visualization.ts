import type { TwoPointerVisualizationDefinition } from "@/features/learning/lib/two-pointer-visualization";
import { palindromeExample, twoPointersWalkthrough } from "./walkthrough";

export const twoPointersVisualization = {
  id: "two-pointers-racecar",
  title: "Trace the pointers in racecar",
  word: palindromeExample,
  source: twoPointersWalkthrough.source,
  frames: [
    {
      id: "start",
      phase: "initialize",
      left: 0,
      right: 6,
      lines: [2, 3],
      explanation: "Start with one pointer at each end of racecar.",
    },
    {
      id: "compare-outer",
      phase: "compare",
      left: 0,
      right: 6,
      lines: [6, 9, 10],
      explanation: "Both ends contain r. Move each pointer inward one place.",
    },
    {
      id: "compare-next",
      phase: "compare",
      left: 1,
      right: 5,
      lines: [6, 9, 10],
      explanation:
        "The two a characters match. Move both pointers inward again.",
    },
    {
      id: "compare-inner",
      phase: "compare",
      left: 2,
      right: 4,
      lines: [6, 9, 10],
      explanation:
        "Both pointers are at c. One more inward move brings them together.",
    },
    {
      id: "complete",
      phase: "complete",
      left: 3,
      right: 3,
      lines: [5, 13],
      explanation:
        "The pointers meet at e. Every mirrored pair matched, so racecar is a palindrome.",
    },
  ],
} as const satisfies TwoPointerVisualizationDefinition;
