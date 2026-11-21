import {
  type CatalogAlgorithmInput,
  catalogAlgorithmProblems,
  catalogAlgorithmRunBodyLimit,
  findProblem,
  validProblemInput,
} from "@workspace/problems";
import { expect, it } from "vitest";
import { inputDraft, parseInputDraft } from "../lib/input-drafts";
import { catalogAlgorithmJudges } from "./catalog-algorithms";
import { executeProblem } from "./service";

it("registers all 14 published exercises and editable inputs", () => {
  expect(catalogAlgorithmProblems).toHaveLength(14);
  expect(Object.keys(catalogAlgorithmJudges).sort()).toEqual(
    catalogAlgorithmProblems.map((problem) => problem.id).sort(),
  );
  for (const problem of catalogAlgorithmProblems) {
    expect(findProblem(problem.slug)).toEqual(problem);
    const judge = catalogAlgorithmJudges[problem.id];
    if (!judge) throw new Error(`Missing judge for ${problem.id}`);
    expect(judge.inputs.length).toBeGreaterThan(0);
    for (const input of [
      ...judge.inputs,
      ...problem.samples.map((sample) => sample.input),
    ]) {
      expect(validProblemInput(problem, input), problem.id).toBe(true);
      expect(parseInputDraft(problem, inputDraft(input)), problem.id).toEqual(
        input,
      );
    }
  }
});

it.each(catalogAlgorithmProblems)(
  "runs the authored examples and submits against private cases for $title",
  async (problem) => {
    const judge = catalogAlgorithmJudges[problem.id];
    if (!judge) throw new Error(`Missing judge for ${problem.id}`);
    expect(
      problem.samples.map(({ input }) => judge.expected(input.args)),
    ).toEqual(problem.samples.map(({ expected }) => expected));
    const result = await executeProblem({
      problemId: problem.id,
      action: "submit",
      code: problem.solution,
    });
    expect(result.cases.filter((item) => !item.passed)).toEqual([]);
    expect(
      result.cases.slice(0, problem.samples.length).map((item) => item.actual),
    ).toEqual(problem.samples.map(({ expected }) => expected));
    expect(result).toMatchObject({ verdict: "accepted", passed: result.total });
    expect(result.passed).toBeGreaterThan(problem.samples.length);
  },
);

it.each([
  ["maximum-sum-subarray-of-size-k", { args: [[1, 2], 3] }],
  ["maximum-sum-subarray-of-size-k", { args: [[1, 2], "2"] }],
  ["remove-duplicates-from-sorted-array", { args: [[1, 0]] }],
  ["find-difference-two-arrays", { args: [[2], []], expected: [2] }],
  ["valid-palindrome", { args: ["é"] }],
  ["group-anagrams", { args: [["abc", "ABC"]] }],
  ["rotate-image", { args: [[[1, 2]]] }],
  ["spiral-matrix", { args: [[[1, 2], [3]]] }],
  ["merge-strings-alternately", { args: ["abc"] }],
])("rejects invalid %s inputs", (slug, input) => {
  const problem = findProblem(slug);
  if (!problem) throw new Error("Missing problem");
  expect(validProblemInput(problem, input)).toBe(false);
});

it.each([
  [
    "find-difference-two-arrays",
    {
      args: [
        [1, 2, 3],
        [2, 4, 6],
      ],
    },
    "function findDifference() { return [[3,1],[6,4]]; }",
    "accepted",
  ],
  [
    "find-difference-two-arrays",
    {
      args: [
        [1, 2, 3],
        [2, 4, 6],
      ],
    },
    "function findDifference() { return [[6,4],[3,1]]; }",
    "wrong-answer",
  ],
  [
    "group-anagrams",
    { args: [["ab", "x", "ba", "ab"]] },
    'function groupAnagrams() { return [["x"],["ba","ab","ab"]]; }',
    "accepted",
  ],
  [
    "group-anagrams",
    { args: [["ab", "x", "ba", "ab"]] },
    'function groupAnagrams() { return [["x"],["ba","ab"]]; }',
    "wrong-answer",
  ],
  [
    "rotate-image",
    {
      args: [
        [
          [1, 2],
          [3, 4],
        ],
      ],
    },
    "function rotate() { return [[3,1],[4,2]]; }",
    "wrong-answer",
  ],
  [
    "remove-duplicates-from-sorted-array",
    { args: [[1, 1, 2]] },
    "function removeDuplicates() { return 2; }",
    "wrong-answer",
  ],
  [
    "spiral-matrix",
    {
      args: [
        [
          [1, 2],
          [3, 4],
        ],
      ],
    },
    "Array.prototype.toJSON = () => [1,2,4,3]; function spiralOrder() { return [1,2,3,4]; }",
    "wrong-answer",
  ],
  [
    "spiral-matrix",
    { args: [[[1]]] },
    "function spiralOrder() { return [getters()]; } function getters() { return { valueOf() { return 1; } }; }",
    "wrong-answer",
  ],
  [
    "merge-strings-alternately",
    { args: ["a", "b"] },
    'async function mergeAlternately() { return "ab"; }',
    "wrong-answer",
  ],
  [
    "valid-palindrome",
    { args: ["a"] },
    "function isPalindrome() { while (true) {} }",
    "time-limit-exceeded",
  ],
] satisfies [string, CatalogAlgorithmInput, string, string][])(
  "judges edited %s cases with the published result contract",
  async (problemId, input, code, verdict) => {
    const result = await executeProblem({
      problemId,
      action: "run",
      code,
      inputs: [input],
    });
    expect(result.verdict).toBe(verdict);
  },
);

it("redacts private inputs, outputs and learner diagnostics", async () => {
  const problem = catalogAlgorithmProblems.find(
    ({ slug }) => slug === "reverse-vowels-of-a-string",
  );
  if (!problem) throw new Error("Missing problem");
  const examples = JSON.stringify(
    problem.samples.map(({ input }) => input.args[0]),
  );
  const result = await executeProblem({
    problemId: problem.id,
    action: "submit",
    code: `${problem.solution}
      const solve = reverseVowels;
      reverseVowels = (s) => {
        console.log(s);
        if (${examples}.includes(s)) return solve(s);
        throw new Error(s);
      };
    `,
  });
  expect(result.passed).toBe(problem.samples.length);
  expect(result.cases[0]?.logs.length).toBeGreaterThan(0);
  expect(result.cases.filter((test) => test.hidden)).toEqual([
    {
      id: "hidden-1",
      hidden: true,
      passed: false,
      verdict: "runtime-error",
      logs: [],
      message:
        "A hidden test failed. Check the function for all supported inputs.",
    },
  ]);
});

it("budgets five maximum learner inputs and escaped code in a Run request", () => {
  const problem = catalogAlgorithmProblems.find(
    ({ slug }) => slug === "reverse-vowels-of-a-string",
  );
  if (!problem) throw new Error("Missing problem");
  const input = { args: ['"'.repeat(300_000)] };
  expect(validProblemInput(problem, input)).toBe(true);
  const body = JSON.stringify({
    code: "\u0000".repeat(32 * 1024),
    inputs: Array(5).fill(input),
  });
  expect(Buffer.byteLength(body)).toBeLessThanOrEqual(
    catalogAlgorithmRunBodyLimit(problem.parameters),
  );
});
