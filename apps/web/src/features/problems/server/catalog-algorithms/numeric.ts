import type { CatalogAlgorithmJudge } from "./types";

export const numericCases = {
  "algorithms.longest-consecutive-sequence": {
    inputs: [
      { args: [[9, 1, 4, 7, 3, -1, 0, 5, 8, -2, 6]] },
      { args: [[-2_147_483_648, 2_147_483_647, -2_147_483_647]] },
      { args: [[11, 11, 11]] },
      { args: [Array.from({ length: 100_000 }, (_, index) => 49_999 - index)] },
    ],
    expected: ([input]) => {
      const ordered = [...new Set(input as number[])].sort((a, b) => a - b);
      let longest = 0;
      let run = 0;
      let previous = Number.NEGATIVE_INFINITY;
      for (const value of ordered) {
        run = value === previous + 1 ? run + 1 : 1;
        longest = Math.max(longest, run);
        previous = value;
      }
      return longest;
    },
  },
  "algorithms.count-pairs-with-sum": {
    inputs: [
      { args: [[0, 0, 0], 0] },
      { args: [[-10_000, 10_000, -10_000, 10_000], 0] },
      { args: [[-5, -3, -2, -2, 1, 1], -4] },
      { args: [[1, 2, 5, 6], 20] },
      { args: [Array<number>(10_000).fill(0), 0] },
    ],
    expected: ([input, target]) => {
      const totals = new Map<number, number>();
      for (const value of input as number[]) {
        totals.set(value, (totals.get(value) ?? 0) + 1);
      }

      let pairs = 0;
      for (const [value, count] of totals) {
        const complement = (target as number) - value;
        if (value < complement) {
          pairs += count * (totals.get(complement) ?? 0);
        } else if (value === complement) {
          pairs += (count * (count - 1)) / 2;
        }
      }
      return pairs;
    },
  },
  "algorithms.maximum-sum-subarray-of-size-k": {
    inputs: [
      { args: [[6], 1] },
      { args: [[-10_000, 10_000, -10_000, 10_000], 1] },
      { args: [[5, 1, -3, 6, 8], 2] },
      { args: [[-2, -1, -7, -4], 3] },
      { args: [Array<number>(100_000).fill(10_000), 99_999] },
    ],
    expected: ([input, window]) => {
      const values = input as number[];
      const size = window as number;
      const prefix = [0];
      let sum = 0;
      for (const value of values) {
        sum += value;
        prefix.push(sum);
      }

      let max = Number.NEGATIVE_INFINITY;
      for (let end = size; end <= values.length; end++) {
        const throughWindow = prefix[end] as number;
        const beforeWindow = prefix[end - size] as number;
        max = Math.max(max, throughWindow - beforeWindow);
      }
      return max;
    },
  },
} satisfies Record<string, CatalogAlgorithmJudge>;
