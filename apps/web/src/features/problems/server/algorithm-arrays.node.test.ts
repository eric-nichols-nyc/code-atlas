import {
  maxConsecutiveOnesProblem,
  moveZeroesProblem,
  validProblemInput,
} from "@workspace/problems";
import { expect, it } from "vitest";
import { inputDraft, parseInputDraft } from "../lib/input-drafts";
import { executeProblem } from "./service";

it.each([
  { problem: moveZeroesProblem, nums: [0, -2147483648, 2147483647] },
  { problem: maxConsecutiveOnesProblem, nums: [0, 1, 0] },
])(
  "accepts and round-trips edited JSON for $problem.title",
  ({ problem, nums }) => {
    expect(parseInputDraft(problem, inputDraft({ nums }))).toEqual({ nums });
    expect(
      parseInputDraft(problem, { ...inputDraft({ nums }), json: "[]" }),
    ).toBeUndefined();
    expect(validProblemInput(problem, { nums: ["1"] })).toBe(false);
    expect(validProblemInput(problem, { nums: [0.5] })).toBe(false);
  },
);

it("judges the original array after mutation and accepts a void return", async () => {
  const problem = moveZeroesProblem;
  const nums = [0, 7, -3, 0, 7, 2, 0];
  const result = await executeProblem({
    problemId: problem.id,
    action: "run",
    code: problem.solution.replace("return nums;", ""),
    inputs: [{ nums }],
  });
  expect(result.verdict).toBe("accepted");
  expect(result.cases[0]).toMatchObject({
    input: { nums },
    actual: [7, -3, 7, 2, 0, 0, 0],
    expected: [7, -3, 7, 2, 0, 0, 0],
  });
});

it.each([
  "return nums.filter(n => n !== 0).concat([0]);",
  "nums.sort((a, b) => (a === 0) - (b === 0) || a - b);",
  "delete nums[0];",
  "Object.defineProperty(nums, '0', { get: () => 3 });",
])(
  "rejects Move Zeroes shortcuts that break the input contract: %s",
  async (body) => {
    const result = await executeProblem({
      problemId: moveZeroesProblem.id,
      action: "run",
      code: `function moveZeroes(nums) { ${body} }`,
      inputs: [{ nums: [0, 3, 1] }],
    });
    expect(result.verdict).toBe("wrong-answer");
  },
);

it("counts only consecutive numeric ones and reports a zero-length streak", async () => {
  const problem = maxConsecutiveOnesProblem;
  const inputs = [{ nums: [1, 1, 0, 1] }, { nums: [0, 0, 0] }];
  const job = { problemId: problem.id, action: "run" as const, inputs };
  const result = await executeProblem({ ...job, code: problem.solution });
  expect(result.verdict).toBe("accepted");
  expect(result.cases.map(({ actual }) => actual)).toEqual([2, 0]);
  for (const expression of ["3", "'2'", "Promise.resolve(2)"]) {
    const wrong = await executeProblem({
      ...job,
      code: `function findMaxConsecutiveOnes() { return ${expression}; }`,
    });
    expect(wrong.verdict).toBe("wrong-answer");
  }
});

it.each([moveZeroesProblem, maxConsecutiveOnesProblem])(
  "accepts the $title reference on maximum-size private cases and redacts their data",
  async (problem) => {
    const result = await executeProblem({
      problemId: problem.id,
      action: "submit",
      code: problem.solution.replace(
        "(nums) {",
        "(nums) { console.log(nums.length);",
      ),
    });
    expect(result.verdict).toBe("accepted");
    expect(result.passed).toBe(result.total);
    const hidden = result.cases.filter((item) => item.hidden);
    expect(hidden.length).toBeGreaterThan(0);
    for (const item of hidden) {
      expect(item.input).toBeUndefined();
      expect(item.actual).toBeUndefined();
      expect(item.expected).toBeUndefined();
      expect(item.logs).toEqual([]);
    }
  },
);
