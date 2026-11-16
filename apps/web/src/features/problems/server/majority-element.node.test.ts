import {
  findProblem,
  formatProblemInput,
  majorityElementProblem as problem,
  validProblemInput,
} from "@workspace/problems";
import { describe, expect, it } from "vitest";
import { inputDraft, parseInputDraft } from "../lib/input-drafts";
import { privateSuites } from "./private-suites";
import { executeProblem } from "./service";

const job = { problemId: problem.id, code: problem.solution };

describe("Majority Element inputs", () => {
  it("registers the JavaScript route and round trips nums without reducer fields", () => {
    expect(findProblem("majority-element")).toBe(problem);
    for (const input of [
      ...problem.samples.map((sample) => sample.input),
      ...privateSuites[problem.kind],
    ]) {
      expect(validProblemInput(problem, input)).toBe(true);
      expect(parseInputDraft(problem, inputDraft(input))).toEqual(input);
    }
    expect(formatProblemInput({ nums: [0, 1, 0] })).toBe("nums = [0,1,0]");
  });
  it.each([
    { nums: [] },
    { nums: [1, 2] },
    { nums: [1, 1, 2, 2] },
    { nums: [1, 2, 3, 3] },
    { nums: [null] },
    { nums: ["1"] },
    { nums: [1.5] },
    { nums: [1e9 + 1] },
    { nums: [-1e9 - 1] },
    { nums: [Infinity] },
    { nums: Array(1001).fill(1) },
    { nums: [1], extra: true },
    { arr: [1] },
  ])("rejects invalid or majority-free inputs: %j", (input) => {
    expect(validProblemInput(problem, input)).toBe(false);
  });
  it("rejects malformed JSON and custom cases without a strict majority", () => {
    const draft = inputDraft({ nums: [0] });
    for (const json of ["bad", "[]", "[1,2]", "[1,1,2,2]", "[null]"])
      expect(parseInputDraft(problem, { ...draft, json })).toBeUndefined();
  });
});

describe("isolated Majority Element judging", () => {
  it("runs edited zero, negative and boundary values with numeric output", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [
        { nums: [0, 1, 0] },
        { nums: [-2, -2, 7] },
        { nums: [1e9, -1e9, 1e9] },
        { nums: [1, 2, 9, 9, 9] },
        { nums: [1, 2, 3, 3, 3, 3] },
      ],
    });
    expect(result).toMatchObject({ verdict: "accepted", passed: 5, total: 5 });
    expect(result.cases.map((test) => test.actual)).toEqual([0, -2, 1e9, 9, 3]);
  });
  it.each([
    problem.solution,
    "function majorityElement(nums) { nums.sort((a,b)=>a-b); return nums[Math.floor(nums.length/2)]; }",
    "function majorityElement(nums) { const counts = new Map(); for(const n of nums){ const count=(counts.get(n)||0)+1; counts.set(n,count); if(count>nums.length/2)return n; } }",
    `JSON.parse=()=>[123]; Reflect.apply=()=>123; Number.isInteger=()=>true; ${problem.solution}`,
  ])(
    "accepts correct voting, sorting and counting approaches: %s",
    async (code) => {
      const result = await executeProblem({ ...job, code, action: "submit" });
      expect(result).toMatchObject({
        verdict: "accepted",
        passed: 14,
        total: 14,
      });
    },
  );
  it.each([
    ["function majorityElement( {", "compile-error"],
    ["function majorityElement(){throw new Error('broken')}", "runtime-error"],
    ["function majorityElement(){while(true){}}", "time-limit-exceeded"],
    ["function majorityElement(){return '0'}", "wrong-answer"],
    ["function majorityElement(){return NaN}", "wrong-answer"],
    ["function majorityElement(){return Infinity}", "wrong-answer"],
    ["function majorityElement(){return new Number(0)}", "wrong-answer"],
    ["async function majorityElement(){return 0}", "wrong-answer"],
    [
      "function majorityElement(){return new Proxy({}, {get(){while(true){}}})}",
      "wrong-answer",
    ],
  ])(
    "bounds invalid source and hostile return values: %s",
    async (code, verdict) => {
      expect(
        (
          await executeProblem({
            ...job,
            code,
            action: "run",
            inputs: [{ nums: [0] }],
          })
        ).verdict,
      ).toBe(verdict);
    },
  );
  it.each([
    "function majorityElement(nums){return nums[0]}",
    "function majorityElement(nums){return nums[Math.floor(nums.length/2)]}",
    "function majorityElement(nums){return nums.length}",
    "function majorityElement(nums){return Math.max(...nums)}",
  ])("rejects shortcuts on private cases: %s", async (code) => {
    expect(
      (await executeProblem({ ...job, code, action: "submit" })).verdict,
    ).toBe("wrong-answer");
  });
  it("selects the full Submit suite and redacts private values and diagnostics", async () => {
    const result = await executeProblem({
      ...job,
      action: "submit",
      inputs: [{ nums: [123] }],
      code: "function majorityElement(nums){console.log(nums[0]);throw new Error('secret:'+nums[0])}",
    });
    expect(result.total).toBe(14);
    for (const test of result.cases.filter((test) => test.hidden)) {
      expect(test).not.toHaveProperty("input");
      expect(test).not.toHaveProperty("expected");
      expect(test).not.toHaveProperty("actual");
      expect(test.logs).toEqual([]);
      expect(test.message).toBe("Hidden case failed.");
    }
  });
});
