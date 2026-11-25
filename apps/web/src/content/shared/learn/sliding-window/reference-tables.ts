export const windowStrategies = [
  [
    "Fixed-size optimization",
    "Build the first window, then move both edges together.",
    "Largest sum of k consecutive values",
  ],
  [
    "Longest valid range",
    "Extend to the right, then advance the left edge until the window is valid again.",
    "Longest substring with at most k distinct characters",
  ],
  [
    "Shortest valid range",
    "Extend until the window is valid. Record candidates while shrinking from the left.",
    "Shortest substring containing all required characters",
  ],
  [
    "Exact sum with positive values",
    "Extend when the sum is below the target and shrink when it is above.",
    "Find a contiguous range with a target sum",
  ],
] as const;

export const windowStates = [
  [
    "Largest sum of k consecutive values",
    "A running sum and a separate best result.",
  ],
  ["Range with sum at most a limit (positive values)", "A running sum."],
  [
    "Longest substring with at most k distinct characters",
    "A map of character frequencies and a count of distinct characters.",
  ],
  [
    "Find All Anagrams in a String (LC 438)",
    "For lowercase English letters, use a 26-slot frequency array and compare it with the target counts.",
  ],
  [
    "Longest substring without repeated characters",
    "A set of current characters or a map of last-seen indices.",
  ],
  [
    "Sliding Window Maximum (LC 239)",
    "A decreasing deque of indices that can still supply a maximum.",
  ],
  [
    "Sliding Window Median (LC 480)",
    "An ordered multiset, or a max-heap for the lower half and a min-heap for the upper half with a way to remove expired values.",
  ],
] as const;
