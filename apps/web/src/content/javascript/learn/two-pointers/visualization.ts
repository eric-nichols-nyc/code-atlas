import type { TwoPointerVisualizationDefinition } from "@/features/learning/lib/two-pointer-visualization";
import { twoPointersExample } from "./example";
import { twoPointersWalkthrough } from "./walkthrough";

export const twoPointersVisualization = {
  id: "two-pointers-sorted-pair",
  title: "Watch left and right find a pair",
  ...twoPointersExample,
  source: twoPointersWalkthrough.source,
  frames: [
    {
      id: "start",
      phase: "initialize",
      left: 0,
      right: 4,
      lines: [2, 3],
      explanation:
        "Start left at index 0 and right at index 4. We are looking for two values that add up to 9.",
    },
    {
      id: "compare-12",
      phase: "compare",
      left: 0,
      right: 4,
      lines: [6],
      explanation:
        "1 + 11 = 12. The sum is greater than 9, so we need a smaller value on the right.",
    },
    {
      id: "move-right",
      phase: "move-right",
      left: 0,
      right: 3,
      lines: [10],
      explanation:
        "Move right from index 4 to index 3. The value 11 is ruled out; left stays at index 0.",
    },
    {
      id: "compare-8",
      phase: "compare",
      left: 0,
      right: 3,
      lines: [6],
      explanation:
        "1 + 7 = 8. The sum is less than 9, so we need a larger value on the left.",
    },
    {
      id: "move-left",
      phase: "move-left",
      left: 1,
      right: 3,
      lines: [9],
      explanation:
        "Move left from index 0 to index 1. The value 1 is ruled out; right stays at index 3.",
    },
    {
      id: "compare-9",
      phase: "compare",
      left: 1,
      right: 3,
      lines: [6],
      explanation:
        "2 + 7 = 9. The sum matches the target, so both pointers stop.",
    },
    {
      id: "found",
      phase: "found",
      left: 1,
      right: 3,
      lines: [8],
      explanation:
        "Pair found: return indices [1, 3]. Their values are 2 and 7. No more pointer movement is needed.",
    },
  ],
} as const satisfies TwoPointerVisualizationDefinition;
