import type { MemoizeFunction, ProblemDefinition } from "../types.js";

export const memoizeFunctions: {
  id: MemoizeFunction;
  label: string;
  code: string;
}[] = [
  {
    id: "sum",
    label: "Sum all arguments",
    code: "function sum(...args) { let result = 0; for (const value of args) result += value; return result; }",
  },
  {
    id: "product",
    label: "Multiply all arguments",
    code: "function product(...args) { let result = 1; for (const value of args) result *= value; return result; }",
  },
  {
    id: "subtract",
    label: "Subtract two arguments",
    code: "function subtract(a, b) { return a - b; }",
  },
];

export const memoizeProblem: ProblemDefinition = {
  id: "javascript.memoize",
  slug: "memoize",
  subjectId: "javascript",
  topicId: "closures",
  kind: "memoize",
  inputError:
    "Choose a supplied fn and use 0–100 JSON calls of 0–4 integers from -100 to 100. subtract requires exactly two arguments per call.",
  title: "Memoize",
  summary: "Cache function results by the complete ordered argument list.",
  difficulty: "Medium",
  entryFunction: "memoize",
  starterCode: `/**
 * @param {Function} fn
 * @return {Function}
 */
function memoize(fn) {
  return function(...args) {
    // Reuse a cached result, or call fn and remember its result.
  };
}
`,
  samples: [
    {
      id: "sample-1",
      input: {
        fn: "sum",
        calls: [
          [2, 5],
          [2, 5],
          [5, 2],
        ],
      },
      expected: { values: [7, 7, 7], callCount: 2 },
      explanation:
        "The repeated ordered arguments [2,5] use the cache. [5,2] is a different key even though the numeric sum is equal.",
    },
    {
      id: "sample-2",
      input: { fn: "product", calls: [[0, 4], [0, 4], [], []] },
      expected: { values: [0, 0, 1, 1], callCount: 2 },
      explanation:
        "Zero is a cached value, not a cache miss. The empty argument list is another reusable key; its product is 1.",
    },
    {
      id: "sample-3",
      input: { fn: "subtract", calls: [] },
      expected: { values: [], callCount: 0 },
      explanation:
        "Creating the memoized function does not call fn. With no calls, the report stays empty.",
    },
  ],
  constraints: [
    "The panel provides a synchronous numeric fn: sum or product accepts 0–4 integers; subtract accepts exactly two. Every argument is from -100 to 100.",
    "calls contains 0–100 argument arrays. Each inner array represents one invocation of the function returned by memoize.",
    "Cache by all arguments in their original order. Different orders or argument counts are different keys, even when fn returns the same number.",
    "The first use of a key calls fn exactly once. Later uses return the stored value without calling fn again, including when that value is zero.",
    "Each call to memoize creates its own cache, even when wrapping the same fn twice. Different memoized functions must not share cached values or counters.",
    "Implement memoize generically for synchronous callbacks with finite numeric results, not only the representative panel callbacks.",
    "Return the memoized function, not the report object. The runner reports its returned values and the underlying fn callCount for you.",
    "Object arguments, asynchronous functions and this binding are outside this exercise.",
  ],
  hints: [
    "Use one Map inside memoize so the returned closure can access it across calls.",
    "For these integer-only argument arrays, JSON.stringify(args) distinguishes ordered values and argument counts. Check Map.has(key), since a cached zero is still present.",
  ],
  solution: `function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const value = fn(...args);
    cache.set(key, value);
    return value;
  };
}`,
  solutionExplanation:
    "A closure owns the Map for one memoized function. The serialized numeric argument list gives each permitted sequence a distinct key. Checking membership separately from the stored value keeps zero-valued results cached. Only a new key invokes fn and adds a result.",
};
