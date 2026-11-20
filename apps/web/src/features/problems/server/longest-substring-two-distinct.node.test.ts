import {
  formatProblemInput,
  longestSubstringTwoDistinctProblem as problem,
  validProblemInput,
} from "@workspace/problems";
import { describe, expect, it } from "vitest";
import { inputDraft, parseInputDraft } from "../lib/input-drafts";
import { executeProblem } from "./service";

const job = { problemId: problem.id, code: problem.solution };
describe("Two-distinct substring contract", () => {
  it("round trips exact case-sensitive strings through testcase drafts", () => {
    for (const s of ["a", "aAaBb", "Z".repeat(100000)]) {
      const input = { s };
      expect(validProblemInput(problem, input)).toBe(true);
      expect(parseInputDraft(problem, inputDraft(input))).toEqual(input);
      expect(formatProblemInput(input)).toBe(`s = ${JSON.stringify(s)}`);
    }
  });
  it("rejects unsupported, empty and oversized inputs without normalization", () => {
    for (const input of [
      { s: "" },
      { s: "a b" },
      { s: "a\n" },
      { s: "a1" },
      { s: "é" },
      { s: 1 },
      { s: "a".repeat(100001) },
      { s: "ab", t: "c" },
      {},
    ])
      expect(validProblemInput(problem, input)).toBe(false);
    expect(
      parseInputDraft(problem, { ...inputDraft({ s: "a" }), s: " a" }),
    ).toBeUndefined();
  });
});

describe("isolated two-distinct substring judging", () => {
  it("runs edited cases with shrinking, contiguous windows and case-sensitive letters", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [
        { s: "abaccc" },
        { s: "aAaAb" },
        { s: "abcde" },
        { s: "abab" },
        { s: "abbbbbcccccc" },
      ],
    });
    expect(result).toMatchObject({ verdict: "accepted", passed: 5, total: 5 });
    expect(result.cases.map((c) => c.actual)).toEqual([4, 4, 2, 4, 11]);
  });
  it("accepts the reference through maximum-size private cases and redacts them", async () => {
    const result = await executeProblem({
      ...job,
      action: "submit",
      inputs: [{ s: "forged" }],
    });
    expect(result).toMatchObject({
      verdict: "accepted",
      passed: 17,
      total: 17,
    });
    for (const item of result.cases.filter((c) => c.hidden)) {
      expect(item).not.toHaveProperty("input");
      expect(item).not.toHaveProperty("actual");
      expect(item).not.toHaveProperty("expected");
      expect(item.logs).toEqual([]);
    }
  });
  it.each([
    ["function lengthOfLongestSubstringTwoDistinct( {", "compile-error"],
    [
      "function lengthOfLongestSubstringTwoDistinct(){throw new Error('broken')}",
      "runtime-error",
    ],
    [
      "function lengthOfLongestSubstringTwoDistinct(){while(true){}}",
      "time-limit-exceeded",
    ],
    [
      "function lengthOfLongestSubstringTwoDistinct(){return '3'}",
      "wrong-answer",
    ],
    [
      "function lengthOfLongestSubstringTwoDistinct(){return 3.5}",
      "wrong-answer",
    ],
    [
      "function lengthOfLongestSubstringTwoDistinct(){return NaN}",
      "wrong-answer",
    ],
    [
      "function lengthOfLongestSubstringTwoDistinct(){return Infinity}",
      "wrong-answer",
    ],
    [
      "function lengthOfLongestSubstringTwoDistinct(){return Promise.resolve(3)}",
      "wrong-answer",
    ],
    [
      "function lengthOfLongestSubstringTwoDistinct(){return new Proxy({}, {get(){while(true){}}})}",
      "wrong-answer",
    ],
    [
      "Number.isInteger=()=>true; function lengthOfLongestSubstringTwoDistinct(){return 3.5}",
      "wrong-answer",
    ],
    [
      "Reflect.apply=()=>3; function lengthOfLongestSubstringTwoDistinct(){return 0}",
      "wrong-answer",
    ],
  ])("bounds invalid learner output: %s", async (code, verdict) => {
    expect(
      (
        await executeProblem({
          ...job,
          code,
          action: "run",
          inputs: [{ s: "eceba" }],
        })
      ).verdict,
    ).toBe(verdict);
  });
  it.each([
    "function lengthOfLongestSubstringTwoDistinct(s){return s.length}",
    "function lengthOfLongestSubstringTwoDistinct(s){return Math.min(2,s.length)}",
    // Case normalization changes the meaning of distinct characters.
    problem.solution.replace(
      "const counts = new Map();",
      "s = s.toLowerCase(); const counts = new Map();",
    ),
    // Removing a letter too early loses counts for duplicates still in the window.
    problem.solution.replace("counts.get(outgoing) - 1", "0"),
  ])("rejects incomplete solutions: %s", async (code) => {
    expect(
      (await executeProblem({ ...job, code, action: "submit" })).verdict,
    ).toBe("wrong-answer");
  });
  it("redacts diagnostics and logs for failing private cases", async () => {
    const result = await executeProblem({
      ...job,
      action: "submit",
      code: "function lengthOfLongestSubstringTwoDistinct(s){console.log(s);throw new Error(s)}",
    });
    for (const item of result.cases.filter((c) => c.hidden)) {
      expect(item.message).toBe("Hidden case failed.");
      expect(item.logs).toEqual([]);
    }
  });
});
