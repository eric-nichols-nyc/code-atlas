import type { CatalogAlgorithmJudge } from "./types.js";

export const matrixCases = {
  "algorithms.remove-duplicates-from-sorted-array": {
    mode: "sorted-prefix",
    inputs: [
      { args: [[-100]] },
      { args: [[2, 2, 2, 2]] },
      { args: [[-100, -2, 0, 4, 100]] },
      { args: [[-7, -7, -3, -3, -3, 0, 0, 100, 100]] },
      {
        args: [
          Array.from({ length: 30_000 }, (_, i) => Math.floor(i / 150) - 100),
        ],
      },
    ],
    expected: ([nums]) => new Set(nums as number[]).size,
  },
  "algorithms.rotate-image": {
    mode: "in-place-matrix",
    inputs: [
      { args: [[[-1000]]] },
      {
        args: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
      },
      {
        args: [
          [
            [0, 0, 1000],
            [3, 5, -1],
            [9, 0, -1000],
          ],
        ],
      },
      {
        args: [
          Array.from({ length: 20 }, (_, row) =>
            Array.from({ length: 20 }, (_, col) => row * 20 + col - 200),
          ),
        ],
      },
    ],
    expected: ([value]) => {
      const matrix = value as number[][];
      const bottomToTop = [...matrix].reverse();
      return matrix.map((_, col) =>
        bottomToTop.map((row) => row[col] as number),
      );
    },
  },
  "algorithms.spiral-matrix": {
    inputs: [
      { args: [[[8]]] },
      { args: [[[-3, 0, -3, 6]]] },
      { args: [[[1], [1], [-2], [3]]] },
      {
        args: [
          [
            [1, 2],
            [3, 4],
            [5, 6],
            [7, 8],
          ],
        ],
      },
      {
        args: [
          Array.from({ length: 10 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => row * 10 + col),
          ),
        ],
      },
    ],
    expected: ([value]) => {
      const values: number[] = [];
      let [top, ...rest] = value as number[][];
      // Read the top row, then rotate the rest so its right edge becomes the top.
      while (top?.length) {
        values.push(...top);
        if (rest.length === 0) break;
        const rotated = top.map((_, col) =>
          rest.map((row) => row[row.length - col - 1] as number),
        );
        [top, ...rest] = rotated;
      }
      return values;
    },
  },
} satisfies Record<string, CatalogAlgorithmJudge>;
