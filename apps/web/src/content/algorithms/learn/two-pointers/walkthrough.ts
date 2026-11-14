import type { CodeWalkthroughDefinition } from "@/features/learning/lib/code-walkthrough";
import { twoPointersExample } from "./example";

export const twoPointersWalkthrough = {
  id: "two-pointers-find-pair",
  title: "Find a pair in a sorted array",
  source: `function findPair(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) return [left, right];
    if (sum < target) left += 1;
    else right -= 1;
  }

  return null;
}

findPair([${twoPointersExample.numbers.join(", ")}], ${twoPointersExample.target});
// Expected result: [1, 3] — values 2 and 7.`,
  steps: [
    {
      id: "initialize",
      lines: [2, 3],
      explanation:
        "Start left at the first index and right at the last. The array is sorted, so moving either pointer inward lets us try a larger or smaller sum.",
    },
    {
      id: "loop",
      lines: [5],
      explanation:
        "Keep searching while left is before right. This keeps the two indices distinct. When they meet or cross, there are no more pairs to check.",
    },
    {
      id: "sum",
      lines: [6],
      explanation:
        "Add the values at the two current indices. Comparing this sum with the target tells us whether we have a match or which pointer to move.",
    },
    {
      id: "match",
      lines: [8],
      explanation:
        "If the sum equals the target, return the two indices immediately. For the example below the function, indices 1 and 3 hold 2 and 7, which add up to 9.",
    },
    {
      id: "move",
      lines: [9, 10],
      explanation:
        "If the sum is too small, move left forward to try a larger value. Otherwise the sum is too large, so move right backward to try a smaller value. Each move narrows the search.",
    },
    {
      id: "no-match",
      lines: [13],
      explanation:
        "If the loop ends without finding a pair, return null. This is the alternative no-match outcome; the target-9 example finds a pair and returns earlier.",
    },
  ],
} as const satisfies CodeWalkthroughDefinition;
