import type { ProblemDefinition } from "../types.js";

export const fibonacciGeneratorProblem: ProblemDefinition = {
  id: "javascript.fibonacci-generator",
  slug: "fibonacci-generator",
  subjectId: "javascript",
  topicId: "generators",
  kind: "fibonacci-generator",
  inputError: "Use an integer count from 0 to 50.",
  title: "Fibonacci Generator",
  summary: "Yield a Fibonacci sequence one value at a time with a generator.",
  difficulty: "Easy",
  entryFunction: "fibonacciGenerator",
  starterCode: `/**
 * @yields {number}
 */
function* fibonacciGenerator() {
  // Yield the next Fibonacci number on every .next() call.
}
`,
  samples: [
    {
      id: "sample-1",
      input: { count: 5 },
      expected: [0, 1, 1, 2, 3],
      explanation: "Five .next() calls yield the first five Fibonacci numbers.",
    },
    {
      id: "sample-2",
      input: { count: 8 },
      expected: [0, 1, 1, 2, 3, 5, 8, 13],
      explanation:
        "Each number after the first two is the sum of the previous two.",
    },
    {
      id: "sample-3",
      input: { count: 0 },
      expected: [],
      explanation: "The judge creates the generator but requests no values.",
    },
  ],
  constraints: [
    "count is an integer from 0 to 50, inclusive, used only by the test harness.",
    "fibonacciGenerator takes no arguments and returns a synchronous iterable iterator.",
    "Every .next() call yields the next finite number with done equal to false.",
    "The sequence starts with 0 and 1 and continues without a fixed endpoint.",
    "Separately created generators must keep independent state.",
  ],
  hints: [
    "A function declared with function* pauses at yield and resumes on the next .next() call.",
    "Keep the current and next number in two local variables. Yield the current number, then advance both using their old values.",
  ],
  solution: `function* fibonacciGenerator() {
  let current = 0;
  let next = 1;
  while (true) {
    yield current;
    [current, next] = [next, current + next];
  }
}`,
  solutionExplanation:
    "yield pauses before the update, so the first result is 0. Resuming moves the pair forward and yields the next value. The loop is infinite, but each .next() call stops at one yield. Local bindings belong to each generator instance. This uses constant space and constant work per yielded value within the supported numeric range.",
};
