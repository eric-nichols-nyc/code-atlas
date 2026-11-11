import type { CurryFunction, ProblemDefinition } from "../types.js";

export const curryFunctions: {
  id: CurryFunction;
  label: string;
  arity: number;
  code: string;
}[] = [
  {
    id: "sum3",
    label: "Sum three numbers",
    arity: 3,
    code: "function sum3(a, b, c) { return a + b + c; }",
  },
  {
    id: "product4",
    label: "Multiply four numbers",
    arity: 4,
    code: "function product4(a, b, c, d) { return a * b * c * d; }",
  },
  {
    id: "subtract3",
    label: "Subtract in order",
    arity: 3,
    code: "function subtract3(a, b, c) { return a - b - c; }",
  },
  {
    id: "identity",
    label: "Return the first argument",
    arity: 1,
    code: "function identity(value) { return value; }",
  },
  {
    id: "constant",
    label: "Constant (no parameters)",
    arity: 0,
    code: "function constant() { return 42; }",
  },
  {
    id: "countArgs",
    label: "Count forwarded arguments",
    arity: 3,
    code: "function countArgs(a, b, c) { return arguments.length; }",
  },
];

export const curryProblem: ProblemDefinition = {
  id: "javascript.curry",
  slug: "curry",
  subjectId: "javascript",
  topicId: "closures",
  kind: "curry",
  inputError:
    "Choose a supplied fn and use 1–10 JSON argument groups with at most 12 integers from -1000 to 1000. Only the final group may reach fn.length.",
  title: "Curry",
  summary:
    "Collect arguments across calls using closures and reusable partial application.",
  difficulty: "Medium",
  entryFunction: "curry",
  starterCode: `/**
 * @param {Function} fn
 * @return {Function}
 */
function curry(fn) {
  return function curried(...args) {
    // Collect arguments until there are enough to call fn.
  };
}
`,
  samples: [
    {
      id: "sample-1",
      input: { fn: "sum3", groups: [[1], [2], [3]] },
      expected: 6,
      explanation:
        "curry(sum3)(1)(2)(3) collects three arguments, then returns 1 + 2 + 3.",
    },
    {
      id: "sample-2",
      input: { fn: "product4", groups: [[], [2, 3], [], [4], [5]] },
      expected: 120,
      explanation:
        "Empty calls keep waiting. The final call completes four arguments and returns 2 × 3 × 4 × 5.",
    },
    {
      id: "sample-3",
      input: { fn: "subtract3", groups: [[10, 2, 3]] },
      expected: 5,
      explanation:
        "All arguments can arrive together. Preserve their order: 10 - 2 - 3 = 5.",
    },
  ],
  constraints: [
    "fn is a synchronous numeric callback with a fixed arity from 0 to 4. The panel supplies representative callbacks; curry must work generically.",
    "groups contains 1–10 arrays and at most 12 integer arguments total, each from -1000 to 1000.",
    "Each group represents one call. Only the final group reaches or exceeds fn.length; no calls follow a completed result.",
    "Before enough arguments arrive, return a function without invoking fn. Empty groups do not discard earlier arguments.",
    "Once enough arguments arrive, invoke fn exactly once with all collected arguments in their original order, including extra arguments.",
    "A zero-arity callback executes on the first call, including an empty call.",
    "Partial functions and separately created curried functions must keep independent argument lists and remain reusable.",
    "Placeholders, this binding, default/rest parameter inference and async callbacks are outside this exercise.",
  ],
  hints: [
    "A function's length property is its declared parameter count. Compare the collected argument count with fn.length.",
    "When more arguments are needed, return a new closure that combines the previous arguments with the next group. Keep earlier arrays unchanged so partial calls can be reused.",
  ],
  solution: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}`,
  solutionExplanation:
    "Each returned closure remembers an immutable argument prefix. New calls append their arguments in order. Reaching fn.length invokes the callback once and returns its value; an empty call just retains the prefix. Creating a new combined list allows the same partial function to be reused without sharing mutable state.",
};
