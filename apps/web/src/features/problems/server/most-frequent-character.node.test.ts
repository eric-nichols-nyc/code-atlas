import {
  formatProblemInput,
  mostFrequentCharacterProblem as problem,
  validProblemInput,
} from "@workspace/problems";
import { describe, expect, it } from "vitest";
import { inputDraft, parseInputDraft } from "../lib/input-drafts";
import { aiProblem, problemAiContext } from "./problem-ai-context";
import { executeProblem } from "./service";

const job = { problemId: problem.id, code: problem.solution };

describe("Most Frequent Character contract", () => {
  it.each(["", "javascript", "abba", " a\n😀 ", "x".repeat(1000)])(
    "round trips exact input %j",
    (str) => {
      const input = { str };
      expect(validProblemInput(problem, input)).toBe(true);
      expect(parseInputDraft(problem, inputDraft(input))).toEqual(input);
      expect(formatProblemInput(input)).toBe(`str = ${JSON.stringify(str)}`);
    },
  );
  it.each([
    null,
    "abc",
    {},
    { str: 1 },
    { str: "x".repeat(1001) },
    { str: "a", extra: true },
  ])("rejects invalid input %j", (input) =>
    expect(validProblemInput(problem, input)).toBe(false),
  );
  it("registers authored context for existing AI features without exposing the reference", async () => {
    expect(aiProblem(problem.id)?.id).toBe(problem.id);
    const context = await problemAiContext(problem);
    expect(context.statement).toContain("Tie rule");
    expect(context).not.toHaveProperty("solution");
    expect(context.examples[1]?.expected).toBe("b");
  });
});

describe("isolated character frequency judging", () => {
  it("accepts edited cases, empty output and the supplied one-pass tie rule", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [
        { str: "javascript" },
        { str: "abba" },
        { str: "" },
        { str: "aAAbb" },
        { str: "😀a😀" },
      ],
    });
    expect(result).toMatchObject({ verdict: "accepted", passed: 5, total: 5 });
    expect(result.cases.map((item) => item.actual)).toEqual([
      "a",
      "b",
      "",
      "A",
      "😀",
    ]);
  });
  it.each([
    ["function findMostFrequentChar( {", "compile-error"],
    [
      "function findMostFrequentChar(){throw new Error('broken')}",
      "runtime-error",
    ],
    ["function findMostFrequentChar(){while(true){}}", "time-limit-exceeded"],
    ["function findMostFrequentChar(){return 2}", "wrong-answer"],
    ["function findMostFrequentChar(){return new String('a')}", "wrong-answer"],
    [
      "function findMostFrequentChar(){return Promise.resolve('a')}",
      "wrong-answer",
    ],
    [
      "function findMostFrequentChar(){return new Proxy({}, {get(){while(true){}}})}",
      "wrong-answer",
    ],
    [
      "function findMostFrequentChar(){return 'a'.repeat(100000)}",
      "wrong-answer",
    ],
  ])("bounds invalid learner results: %s", async (code, verdict) => {
    expect(
      (
        await executeProblem({
          ...job,
          action: "run",
          inputs: [{ str: "aa" }],
          code,
        })
      ).verdict,
    ).toBe(verdict);
  });
  it("accepts the complete suite and never exposes private values or logs", async () => {
    const result = await executeProblem({
      ...job,
      action: "submit",
      inputs: [{ str: "forged" }],
    });
    expect(result.verdict).toBe("accepted");
    expect(result.total).toBeGreaterThan(problem.samples.length);
    for (const item of result.cases.filter((entry) => entry.hidden)) {
      expect(item).not.toHaveProperty("input");
      expect(item).not.toHaveProperty("actual");
      expect(item).not.toHaveProperty("expected");
      expect(item.logs).toEqual([]);
    }
    const failed = await executeProblem({
      ...job,
      action: "submit",
      code: "function findMostFrequentChar(str){console.log(str);throw new Error(str)}",
    });
    for (const item of failed.cases.filter((entry) => entry.hidden)) {
      expect(item.message).toBe("Hidden case failed.");
      expect(item.logs).toEqual([]);
    }
  });
  it("rejects first-occurrence and last-to-tie shortcuts", async () => {
    const firstOccurrence = `function findMostFrequentChar(str){const counts=new Map();for(const char of str)counts.set(char,(counts.get(char)||0)+1);let winner='',max=0;for(const [char,count] of counts)if(count>max){max=count;winner=char}return winner}`;
    const lastToTie = problem.solution.replace(
      "counts[char] > maxCount",
      "counts[char] >= maxCount",
    );
    for (const code of [firstOccurrence, lastToTie]) {
      expect(
        (await executeProblem({ ...job, action: "submit", code })).verdict,
      ).toBe("wrong-answer");
    }
  });
  it("captures call intrinsics before learner code", async () => {
    expect(
      (
        await executeProblem({
          ...job,
          action: "submit",
          code: `Reflect.apply=()=>'';\n${problem.solution}`,
        })
      ).verdict,
    ).toBe("accepted");
  });
});
