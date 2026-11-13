import type { CompositionFunction, ProblemDefinition } from "../types.js";

export const compositionFunctions: {
  id: CompositionFunction;
  label: string;
  code: string;
}[] = [
  {
    id: "addOne",
    label: "Add one",
    code: "function addOne(value) { return value + 1; }",
  },
  {
    id: "double",
    label: "Double",
    code: "function double(value) { return value * 2; }",
  },
  {
    id: "negate",
    label: "Negate",
    code: "function negate(value) { return -value; }",
  },
];

export const functionCompositionProblem: ProblemDefinition = {
  id: "javascript.function-composition",
  slug: "function-composition",
  subjectId: "javascript",
  topicId: "closures",
  kind: "function-composition",
  inputError:
    "Use a JSON list of 0–10 supplied function names (addOne, double, negate) and an integer x from -10000 to 10000.",
  title: "Function Composition",
  summary:
    "Return a reusable function that applies a sequence from right to left.",
  difficulty: "Easy",
  entryFunction: "compose",
  starterCode: `/**
 * @param {Function[]} functions
 * @return {Function}
 */
function compose(functions) {
  return function(x) {
    // Apply the last function first, then work toward the first.
  };
}
`,
  samples: [
    {
      id: "sample-1",
      input: { functions: ["double", "addOne"], x: 4 },
      expected: 10,
      explanation: "Apply addOne first, then double: double(addOne(4)) = 10.",
    },
    {
      id: "sample-2",
      input: { functions: ["addOne", "double", "negate"], x: 3 },
      expected: -5,
      explanation: "The values flow from 3 to -3, then -6, then -5.",
    },
    {
      id: "sample-3",
      input: { functions: [], x: -7 },
      expected: -7,
      explanation:
        "An empty sequence produces the identity function, which returns its input.",
    },
  ],
  constraints: [
    "functions contains 0–10 synchronous numeric functions. The test panel accepts the names addOne, double and negate, including repeats.",
    "x is an integer from -10000 to 10000.",
    "Implement composition generically for synchronous callbacks with finite numeric results; the panel functions are representative examples, not special cases to recognize.",
    "Return a function. On every invocation, apply each listed function exactly once, from the last position to the first.",
    "An empty list returns x unchanged. A one-function list applies that function once.",
    "The returned function must remain reusable, and separately composed functions must keep independent sequences.",
    "Do not consume or reorder the supplied function list. Asynchronous functions and this binding are outside this exercise.",
  ],
  hints: [
    "Start a local result at x and traverse the function indices backward.",
    "Keep the traversal index inside the returned function so each invocation starts a fresh pass.",
  ],
  solution: `function compose(functions) {
  return function(x) {
    let result = x;
    for (let i = functions.length - 1; i >= 0; i--) {
      result = functions[i](result);
    }
    return result;
  };
}`,
  solutionExplanation:
    "The closure remembers the function list, while each call creates its own result and index. Working backward matches nested function calls. With no functions, the loop is skipped and the original x is returned. The function list remains available for later invocations.",
};
