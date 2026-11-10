import type { ProblemDefinition } from "../types.js";
export const counterProblem: ProblemDefinition = {
  id: "javascript.counter",
  slug: "counter",
  subjectId: "javascript",
  topicId: "closures",
  kind: "counter",
  inputError:
    "Use an integer n from -1000 to 1000 and an integer call count from 0 to 1000.",
  title: "Counter",
  summary: "Keep private state between calls with a JavaScript closure.",
  difficulty: "Easy",
  entryFunction: "createCounter",
  starterCode: `/**\n * @param {number} n\n * @return {function(): number}\n */\nfunction createCounter(n) {\n  return function() {\n    // Return the current count, then advance it by one.\n  };\n}\n`,
  samples: [
    {
      id: "sample-1",
      input: { n: 10, calls: 3 },
      expected: [10, 11, 12],
      explanation: "Starting at 10, three calls return 10, 11, and 12.",
    },
    {
      id: "sample-2",
      input: { n: -2, calls: 5 },
      expected: [-2, -1, 0, 1, 2],
      explanation:
        "The count increases by one on every call, including when the starting value is negative.",
    },
  ],
  constraints: [
    "n is an integer between -1000 and 1000, inclusive.",
    "The returned function can be called between 0 and 1000 times.",
    "Every invocation returns the current number before increasing it by one.",
    "Counters created separately must keep independent state.",
    "The calls input in this workspace is the number of counter() invocations; zero calls produces an empty output array.",
  ],
  hints: [
    "A returned function can still access variables from the call that created it.",
    "Keep the count inside createCounter. Return its current value before increasing it, so the first call returns n.",
  ],
  solution: `function createCounter(n) {\n  let current = n;\n  return function() {\n    return current++;\n  };\n}`,
  solutionExplanation:
    "Each call to createCounter creates a new current binding. The returned function closes over that binding, so it survives between calls. Post-increment returns the old value, then updates the count. Different counters capture different bindings.",
};
