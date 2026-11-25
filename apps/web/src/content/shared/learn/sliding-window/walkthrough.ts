import type { CodeWalkthroughDefinition } from "@/features/learning/lib/code-walkthrough";

export const slidingWindowExample = {
  values: [1, 3, 2, 5, 4, 7],
  size: 3,
} as const;

export const slidingWindowWalkthrough = {
  id: "sliding-window-maximum-sum",
  title: "Find the maximum window sum in JavaScript",
  source: `function maxWindowSum(values, size) {
  let sum = 0;
  for (let i = 0; i < size; i += 1) {
    sum += values[i];
  }
  let best = sum;

  for (let right = size; right < values.length; right += 1) {
    const left = right - size;
    sum -= values[left];
    sum += values[right];
    best = Math.max(best, sum);
  }

  return best;
}

maxWindowSum([${slidingWindowExample.values.join(", ")}], ${slidingWindowExample.size}); // 16`,
  steps: [
    {
      id: "initial-window",
      lines: [2, 3, 4],
      explanation:
        "Add the first three values to build the initial sum of 6. The rest of the scan reuses this total.",
    },
    {
      id: "initial-best",
      lines: [6],
      explanation:
        "Start best at the first window sum. This also works when every window sum is negative.",
    },
    {
      id: "find-boundaries",
      lines: [8, 9],
      explanation:
        "Start right at the first index outside the window. Subtract the window size from right to find the index that will leave.",
    },
    {
      id: "update-sum",
      lines: [10, 11],
      explanation:
        "Subtract the outgoing value and add the incoming value. All shared values are already included in the sum.",
    },
    {
      id: "update-best",
      lines: [12],
      explanation:
        "Compare the updated sum with best. This keeps the largest sum seen anywhere in the scan.",
    },
    {
      id: "return",
      lines: [15],
      explanation:
        "After the last window, return the largest sum. The example returns 16 from the window containing 5, 4, and 7.",
    },
  ],
} as const satisfies CodeWalkthroughDefinition;
