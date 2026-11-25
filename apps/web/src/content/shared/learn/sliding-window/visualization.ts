import type { SlidingWindowVisualizationDefinition } from "@/features/learning/lib/sliding-window-visualization";
import { slidingWindowExample, slidingWindowWalkthrough } from "./walkthrough";

export const slidingWindowVisualization = {
  id: "sliding-window-size-three",
  title: "Trace a fixed-size window",
  ...slidingWindowExample,
  source: slidingWindowWalkthrough.source,
  frames: [
    {
      id: "initial-window",
      phase: "initialize",
      start: 0,
      sum: 6,
      best: 6,
      lines: [2, 4, 6],
      explanation:
        "The first window contains 1, 3, and 2. Its sum is 6, which is also the first best sum.",
    },
    {
      id: "first-slide",
      phase: "slide",
      start: 1,
      sum: 10,
      best: 10,
      lines: [9, 10, 11, 12],
      explanation:
        "Remove 1 and add 5. The shared values 3 and 2 stay in the window, and 10 becomes the new best.",
    },
    {
      id: "second-slide",
      phase: "slide",
      start: 2,
      sum: 11,
      best: 11,
      lines: [9, 10, 11, 12],
      explanation:
        "Remove 3 and add 4. The window still holds three values, and its sum of 11 is the new best.",
    },
    {
      id: "third-slide",
      phase: "slide",
      start: 3,
      sum: 16,
      best: 16,
      lines: [9, 10, 11, 12],
      explanation:
        "Remove 2 and add 7. The last window contains 5, 4, and 7, giving the best sum of 16.",
    },
    {
      id: "return",
      phase: "complete",
      start: 3,
      sum: 16,
      best: 16,
      lines: [15],
      explanation:
        "Every three-value window has been checked. Return the largest sum, 16.",
    },
  ],
} as const satisfies SlidingWindowVisualizationDefinition;
