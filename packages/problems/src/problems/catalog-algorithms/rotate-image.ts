import type { CatalogAlgorithmDefinition } from "../../types.js";

export const rotateImageProblem = {
  id: "algorithms.rotate-image",
  slug: "rotate-image",
  subjectId: "algorithms",
  topicId: "arrays",
  kind: "catalog-algorithm",
  title: "Rotate Image",
  summary: "Rotate a square matrix 90 degrees clockwise in place.",
  difficulty: "Medium",
  entryFunction: "rotate",
  inputError:
    "Enter a square JSON matrix of size 1–20 with integers from −1000 to 1000.",
  parameters: [
    {
      name: "matrix",
      type: "matrix",
      minLength: 1,
      maxLength: 20,
      min: -1000,
      max: 1000,
      square: true,
    },
  ],
  starterCode: `function rotate(matrix) {
  // Rotate the cells clockwise in place.
  return matrix;
}`,
  samples: [
    {
      id: "three-by-three",
      input: {
        args: [
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
        ],
      },
      expected: [
        [7, 4, 1],
        [8, 5, 2],
        [9, 6, 3],
      ],
      explanation:
        "The original left column becomes the top row, read from bottom to top.",
    },
    {
      id: "two-by-two",
      input: {
        args: [
          [
            [3, -2],
            [7, 5],
          ],
        ],
      },
      expected: [
        [7, 3],
        [5, -2],
      ],
      explanation: "Each corner moves clockwise to the next corner.",
    },
  ],
  constraints: [
    "The matrix has between 1 and 20 rows and the same number of columns.",
    "Every entry is an integer from −1000 to 1000.",
    "Modify the input matrix and return it.",
  ],
  hints: [
    "Transposing the matrix swaps its rows and columns. Touch only cells above the main diagonal when swapping.",
    "After transposing, reverse each row to put its cells in clockwise orientation.",
  ],
  solution: `function rotate(matrix) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = row + 1; col < matrix.length; col++) {
      const cell = matrix[row][col];
      matrix[row][col] = matrix[col][row];
      matrix[col][row] = cell;
    }
  }
  for (const row of matrix) row.reverse();
  return matrix;
}`,
  solutionExplanation:
    "The transpose sends a cell from row r, column c to row c, column r. Reversing the rows then sends that cell to row c, column n - 1 - r, its clockwise destination. Time: O(n²). Extra space: O(1).",
} satisfies CatalogAlgorithmDefinition;
