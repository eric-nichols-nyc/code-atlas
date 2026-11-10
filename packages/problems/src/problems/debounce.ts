import type { ProblemDefinition } from "../types.js";
export const debounceProblem: ProblemDefinition = {
  id: "javascript.debounce",
  slug: "debounce",
  subjectId: "javascript",
  topicId: "async",
  kind: "debounce",
  inputError:
    "Use t from 0 to 1000 and a JSON calls array containing 1–10 scheduled calls. Each call needs t from 0 to 1000 and up to 10 integer inputs from -1e9 to 1e9.",
  title: "Debounce",
  summary: "Delay a callback and cancel superseded calls with timers.",
  difficulty: "Medium",
  entryFunction: "debounce",
  starterCode: `/**\n * @param {Function} fn\n * @param {number} t\n * @return {Function}\n */\nfunction debounce(fn, t) {\n  return function(...args) {\n    // Run fn after t milliseconds; cancel a pending call first.\n  };\n}\n`,
  samples: [
    {
      id: "sample-1",
      input: {
        t: 50,
        calls: [
          { t: 50, inputs: [1] },
          { t: 75, inputs: [2] },
        ],
      },
      expected: [{ t: 125, inputs: [2] }],
      explanation:
        "The call at 75ms replaces the pending call. Only its arguments are delivered, at 125ms.",
    },
    {
      id: "sample-2",
      input: {
        t: 20,
        calls: [
          { t: 50, inputs: [1] },
          { t: 100, inputs: [2] },
        ],
      },
      expected: [
        { t: 70, inputs: [1] },
        { t: 120, inputs: [2] },
      ],
      explanation:
        "Each call has time to finish its waiting window before the next call arrives.",
    },
    {
      id: "sample-3",
      input: {
        t: 150,
        calls: [
          { t: 50, inputs: [1, 2] },
          { t: 300, inputs: [3, 4] },
          { t: 300, inputs: [5, 6] },
        ],
      },
      expected: [
        { t: 200, inputs: [1, 2] },
        { t: 450, inputs: [5, 6] },
      ],
      explanation:
        "Calls sharing a timestamp run in their listed order. The final call at 300ms wins that burst.",
    },
  ],
  constraints: [
    "t is an integer from 0 to 1000 milliseconds.",
    "Provide 1–10 calls, each with a timestamp from 0 to 1000ms and 0–10 integer arguments from -1e9 to 1e9.",
    "Forward every argument from the latest call after the full waiting window.",
    "Use setTimeout and clearTimeout; external libraries are unavailable.",
    "The judge uses a deterministic clock. Date.now follows that clock; scheduled calls at a timestamp run before timers due at that same timestamp.",
  ],
  hints: [
    "Keep the pending timeout identifier in the closure returned by debounce.",
    "Cancel the previous timeout on every call, then schedule fn with the latest arguments.",
  ],
  solution: `function debounce(fn, t) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), t);\n  };\n}`,
  solutionExplanation:
    "The closure owns one pending timer. Replacing it on every call delays the callback until a quiet period of t milliseconds. The scheduled closure captures the latest arguments.",
};
