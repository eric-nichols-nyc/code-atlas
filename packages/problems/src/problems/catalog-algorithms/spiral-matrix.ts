import type { CatalogAlgorithmDefinition } from "../../types.js";

export const spiralMatrixProblem = {
  id: "algorithms.spiral-matrix",
  slug: "spiral-matrix",
  subjectId: "algorithms",
  topicId: "arrays",
  kind: "catalog-algorithm",
  title: "Spiral Matrix",
  summary:
    "Read a rectangular matrix in clockwise order from its outside edge inward.",
  difficulty: "Medium",
  entryFunction: "spiralOrder",
  inputError:
    "Enter a rectangular JSON matrix with 1–10 rows, 1–10 columns, and integers from −100 to 100.",
  parameters: [
    {
      name: "matrix",
      type: "matrix",
      minLength: 1,
      maxLength: 10,
      min: -100,
      max: 100,
    },
  ],
  starterCode: `function spiralOrder(matrix) {
  // Collect the cells in clockwise spiral order.
}`,
  samples: [
    {
      id: "square",
      input: {
        args: [
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
        ],
      },
      expected: [1, 2, 3, 6, 9, 8, 7, 4, 5],
      explanation: "Visit the outside edge first, then the center value 5.",
    },
    {
      id: "rectangle",
      input: {
        args: [
          [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
          ],
        ],
      },
      expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7],
      explanation:
        "After one lap around the outside, read 6 and 7 from left to right.",
    },
  ],
  constraints: [
    "The matrix has 1–10 rows and 1–10 columns.",
    "Every row has the same length and every entry is an integer from −100 to 100.",
    "Include every cell exactly once, even when values repeat.",
  ],
  hints: [
    "Keep track of the top, right, bottom, and left edges of the remaining rectangle.",
    "Move each edge inward after reading it. A single remaining row or column can finish the traversal.",
  ],
  solution: `function spiralOrder(matrix) {
  const values = [];
  let top = 0;
  let left = 0;
  let bottom = matrix.length - 1;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) values.push(matrix[top][col]);
    top++;

    for (let row = top; row <= bottom; row++) values.push(matrix[row][right]);
    right--;

    if (top <= bottom) {
      for (let col = right; col >= left; col--) values.push(matrix[bottom][col]);
      bottom--;
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row--) values.push(matrix[row][left]);
      left++;
    }
  }
  return values;
}`,
  solutionExplanation:
    "Read along each edge in clockwise order, then move that edge inward. Before reading back along the bottom or up the left, check that the corresponding edge still exists. Each cell is read once. Time: O(m × n). Extra space: O(1) excluding the returned array.",
} satisfies CatalogAlgorithmDefinition;
