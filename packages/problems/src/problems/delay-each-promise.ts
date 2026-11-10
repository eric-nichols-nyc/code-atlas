import type { ProblemDefinition } from "../types.js";

export const delayEachPromiseProblem: ProblemDefinition = {
  id: "javascript.delay-the-resolution-of-each-promise",
  slug: "delay-the-resolution-of-each-promise",
  subjectId: "javascript",
  topicId: "async",
  kind: "delay-all",
  inputError:
    "Use an integer ms from 0 to 1000 and 0–10 function descriptors. Each needs integer t from 0 to 1000 and integer value from -1e9 to 1e9.",
  title: "Delay the Resolution of Each Promise",
  summary:
    "Wrap async functions while preserving their values and adding a fulfillment delay.",
  difficulty: "Medium",
  entryFunction: "delayAll",
  starterCode: `/**
 * @param {Array<() => Promise<number>>} functions
 * @param {number} ms
 * @return {Array<() => Promise<number>>}
 */
function delayAll(functions, ms) {
  return functions.map(fn => function() {
    // Start fn now, then delay its fulfillment by ms.
  });
}
`,
  samples: [
    {
      id: "sample-1",
      input: {
        ms: 50,
        functions: [
          { t: 30, value: 1 },
          { t: 10, value: 2 },
        ],
      },
      expected: [
        { t: 80, value: 1 },
        { t: 60, value: 2 },
      ],
      explanation:
        "Both functions start at time 0. Their wrappers fulfill at 30 + 50 = 80ms and 10 + 50 = 60ms. Output stays in input order.",
    },
    {
      id: "sample-2",
      input: { ms: 0, functions: [{ t: 20, value: -4 }] },
      expected: [{ t: 20, value: -4 }],
      explanation:
        "A zero additional delay preserves the original fulfillment time and value.",
    },
    {
      id: "sample-3",
      input: { ms: 100, functions: [] },
      expected: [],
      explanation:
        "An empty list produces an empty array of wrappers and no results.",
    },
  ],
  constraints: [
    "ms is an integer from 0 to 1000 milliseconds.",
    "functions contains 0–10 functions, each taking no arguments and returning a promise that fulfills with a number.",
    "In the test panel, each descriptor {t, value} means a function that fulfills with value after t milliseconds. t is an integer from 0 to 1000; value is an integer from -1e9 to 1e9.",
    "Do not invoke the original functions while creating the wrapper array. Start each original synchronously when its wrapper is called.",
    "The judge calls all wrappers once at time 0 on a deterministic clock. Date.now follows that clock; outputs are recorded in input order.",
    "Do not change the fulfillment values. Rejection handling is outside this exercise's supplied inputs.",
  ],
  hints: [
    "Use map to return functions, rather than invoking all the input functions immediately.",
    "Inside each wrapper, await the original promise, await a timer-backed promise for ms, then return the original value.",
  ],
  solution: `function delayAll(functions, ms) {
  return functions.map(fn => async function() {
    const value = await fn();
    await new Promise(resolve => setTimeout(resolve, ms));
    return value;
  });
}`,
  solutionExplanation:
    "Each wrapper starts its own original function before the first await. After that promise fulfills, a second promise adds ms to its fulfillment time. Returning the saved value preserves the result. map preserves input order, and independent wrappers allow the functions to run concurrently. Creating the wrappers takes O(n) time and space.",
};
