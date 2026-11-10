import type { ProblemDefinition } from "../types.js";
export const sleepProblem: ProblemDefinition = {
  id: "javascript.sleep",
  slug: "sleep",
  subjectId: "javascript",
  topicId: "async",
  kind: "delay",
  inputError: "Use integer delays between 1 and 1000 milliseconds.",
  title: "Sleep",
  summary: "Build a Promise-based delay with JavaScript timers.",
  difficulty: "Easy",
  entryFunction: "sleep",
  starterCode: `/**\n * @param {number} millis\n * @return {Promise<void>}\n */\nasync function sleep(millis) {\n  // Resolve a Promise after millis milliseconds.\n}\n`,
  samples: [
    {
      id: "sample-1",
      input: 100,
      explanation:
        "The returned Promise should settle about 100 milliseconds after the call.",
    },
    {
      id: "sample-2",
      input: 200,
      explanation: "Waiting twice as long should take about 200 milliseconds.",
    },
  ],
  constraints: [
    "millis is an integer between 1 and 1000, inclusive.",
    "Return a Promise; its resolved value can be anything.",
    "Use asynchronous timing. Small scheduling delays are allowed.",
    "This workspace supports single-file JavaScript with bounded timers and console output; external modules are unavailable.",
  ],
  hints: [
    "A Promise can stay pending until a callback calls resolve.",
    "setTimeout schedules a callback after the requested delay. Pass resolve as that callback.",
  ],
  solution: `function sleep(millis) {\n  return new Promise((resolve) => {\n    setTimeout(resolve, millis);\n  });\n}`,
  solutionExplanation:
    "The Promise starts pending. setTimeout schedules resolve, so the caller can await the delay without blocking the JavaScript thread. Returning the Promise lets the caller observe when the wait finishes.",
};
