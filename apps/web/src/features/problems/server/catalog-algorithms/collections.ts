import type { CatalogAlgorithmJudge } from "./types.js";

// Private fixtures and independent expected values for the isolated judge.
export const collectionCases = {
  "algorithms.find-difference-two-arrays": {
    mode: "unordered-rows",
    inputs: [
      { args: [[8], [-2]] },
      {
        args: [
          [5, 5, 2, 1, 2],
          [4, 4, 5, 3],
        ],
      },
      {
        args: [
          [1000, -1000, 0],
          [-1000, 0, 1000],
        ],
      },
      { args: [Array(1000).fill(1000), Array(1000).fill(-1000)] },
    ],
    expected: ([first, second]) => {
      const membership = new Uint8Array(2001);
      for (const value of first as number[]) membership[value + 1000] = 1;
      for (const value of second as number[]) {
        const index = value + 1000;
        membership[index] = (membership[index] ?? 0) | 2;
      }
      const onlyInFirst: number[] = [];
      const onlyInSecond: number[] = [];
      for (let index = 0; index < membership.length; index++) {
        if (membership[index] === 1) onlyInFirst.push(index - 1000);
        if (membership[index] === 2) onlyInSecond.push(index - 1000);
      }
      return [onlyInFirst, onlyInSecond];
    },
  },
  "algorithms.sort-array-by-increasing-frequency": {
    inputs: [
      { args: [[5]] },
      { args: [[100, -100, 0, -100, 100, 0]] },
      { args: [[-7, 3, -7, 3, -7, 8, 8, 4]] },
      { args: [Array.from({ length: 100 }, (_, index) => (index % 11) - 5)] },
    ],
    expected: ([input]) => {
      const nums = input as number[];
      const counts = new Uint8Array(201);
      for (const value of nums) {
        const index = value + 100;
        counts[index] = (counts[index] ?? 0) + 1;
      }
      const ordered: number[] = [];
      for (let frequency = 1; frequency <= nums.length; frequency++) {
        for (let index = 200; index >= 0; index--) {
          if (counts[index] !== frequency) continue;
          for (let occurrence = 0; occurrence < frequency; occurrence++) {
            ordered.push(index - 100);
          }
        }
      }
      return ordered;
    },
  },
  "algorithms.group-anagrams": {
    mode: "unordered-groups",
    inputs: [
      { args: [["ab", "ba", "aab", "baa", "aba", "abb"]] },
      { args: [["", "x", "x", "xx", "", "xyz", "yxz"]] },
      {
        args: [
          Array.from({ length: 1000 }, (_, index) => {
            const count = (index % 99) + 1;
            const first = "a".repeat(count);
            const second = "z".repeat(100 - count);
            return index % 2 ? first + second : second + first;
          }),
        ],
      },
    ],
    expected: ([input]) => {
      const groups = new Map<string, string[]>();
      for (const word of input as string[]) {
        const counts = new Uint8Array(26);
        for (let index = 0; index < word.length; index++) {
          const letter = word.charCodeAt(index) - 97;
          counts[letter] = (counts[letter] ?? 0) + 1;
        }
        const key = counts.join(",");
        const group = groups.get(key);
        if (group) group.push(word);
        else groups.set(key, [word]);
      }
      return [...groups.values()];
    },
  },
} satisfies Record<string, CatalogAlgorithmJudge>;
