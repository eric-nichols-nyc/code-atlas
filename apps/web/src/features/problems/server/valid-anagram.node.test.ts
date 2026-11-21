import {
  formatProblemInput,
  validAnagramProblem as problem,
  validProblemInput,
} from "@workspace/problems";
import { describe, expect, it, vi } from "vitest";
import type { ProgressService } from "@/features/catalog/server/progress-service";
import { inputDraft, parseInputDraft } from "../lib/input-drafts";

vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => true }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => "anagram-owner",
}));

import { createExecutionHandler } from "./handler";
import { executeProblem } from "./service";

const job = { problemId: problem.id, code: problem.solution };
describe("Valid Anagram contract", () => {
  it.each([
    { s: "", t: "" },
    { s: "aab", t: "aba" },
    { s: "a".repeat(1000), t: "b" },
  ])("round trips exact string inputs: %j", (input) => {
    expect(validProblemInput(problem, input)).toBe(true);
    expect(parseInputDraft(problem, inputDraft(input))).toEqual(input);
    expect(formatProblemInput(input)).toBe(
      `s = ${JSON.stringify(input.s)}, t = ${JSON.stringify(input.t)}`,
    );
  });
  it.each([
    { s: 1, t: "a" },
    { s: "A", t: "a" },
    { s: " a", t: "a" },
    { s: "a\n", t: "a" },
    { s: "é", t: "a" },
    { s: "a".repeat(1001), t: "a" },
    { s: "a", t: "a", extra: true },
    { s: "a" },
  ])("rejects invalid input: %j", (input) =>
    expect(validProblemInput(problem, input)).toBe(false),
  );
});

describe("isolated Valid Anagram judging", () => {
  it("captures the sorted array passed to console.log", async () => {
    const result = await executeProblem({
      ...job,
      code: `function isAnagram(s, t) {
        const sort1 = s.split("").sort();
        console.log("sort1=", sort1);
        return true;
      }`,
      action: "run",
      inputs: [{ s: "anagram", t: "nagaram" }],
    });
    expect(result.verdict).toBe("accepted");
    expect(result.cases[0]?.logs).toEqual([
      'sort1= ["a","a","a","g","m","n","r"]',
    ]);
  });
  it("captures nested values, cycles and accessor markers without executing getters", async () => {
    const result = await executeProblem({
      ...job,
      code: `function isAnagram() {
        const value = { items: [0, false, null, { text: "hello" }] };
        value.self = value;
        Object.defineProperty(value, "secret", {
          enumerable: true,
          get() { throw new Error("getter must not run"); }
        });
        value.toJSON = () => { throw new Error("toJSON must not run"); };
        console.warn("value=", value);
        console.error([], {}, null, 12n);
        return true;
      }`,
      action: "run",
      inputs: [{ s: "ab", t: "ba" }],
    });
    expect(result.verdict).toBe("accepted");
    expect(result.cases[0]?.logs).toEqual([
      'value= {"items":[0,false,null,{"text":"hello"}],"self":[Circular],"secret":[Getter],"toJSON":[Function]}',
      "[] {} null 12n",
    ]);
  });
  it("keeps console inspection bounded and independent of learner-modified intrinsics", async () => {
    const result = await executeProblem({
      ...job,
      code: `function isAnagram() {
        const value = Array(1000).fill("a");
        JSON.stringify = Object.keys = Object.getOwnPropertyDescriptor = () => { throw new Error("replaced"); };
        console.log(value);
        for (let i = 0; i < 100; i++) console.log({ value });
        return true;
      }`,
      action: "run",
      inputs: [{ s: "ab", t: "ba" }],
    });
    expect(result.verdict).toBe("accepted");
    expect(result.cases[0]?.logs[0]).toBe(
      `[${Array(25).fill('"a"').join(",")},…]`,
    );
    expect(result.cases[0]?.logs.length).toBeLessThanOrEqual(41);
    expect(result.cases[0]?.logs.every((line) => line.length <= 1024)).toBe(
      true,
    );
  });
  it("interrupts hostile console proxies and recovers for the next execution", async () => {
    const result = await executeProblem({
      ...job,
      code: `function isAnagram() {
        console.log(new Proxy({}, { ownKeys() { while (true) {} } }));
        while (true) {}
      }`,
      action: "run",
      inputs: [{ s: "ab", t: "ba" }],
    });
    expect(result.verdict).toBe("time-limit-exceeded");
    expect(
      (
        await executeProblem({
          ...job,
          action: "run",
          inputs: [{ s: "ab", t: "ba" }],
        })
      ).verdict,
    ).toBe("accepted");
  });
  it("evaluates current edited cases including false and empty values", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [
        { s: "anagram", t: "nagaram" },
        { s: "aab", t: "abb" },
        { s: "ab", t: "a" },
        { s: "", t: "" },
        { s: "", t: "a" },
      ],
    });
    expect(result).toMatchObject({ verdict: "accepted", passed: 5, total: 5 });
    expect(result.cases.map((item) => item.actual)).toEqual([
      true,
      false,
      false,
      true,
      false,
    ]);
  });
  it.each([
    ["function isAnagram( {", "compile-error"],
    ["function isAnagram(){throw new Error('broken')}", "runtime-error"],
    ["function isAnagram(){while(true){}}", "time-limit-exceeded"],
    ["function isAnagram(){return 'true'}", "wrong-answer"],
    ["function isAnagram(){return 1}", "wrong-answer"],
    ["function isAnagram(){return new Boolean(true)}", "wrong-answer"],
    ["function isAnagram(){return Promise.resolve(true)}", "wrong-answer"],
    [
      "function isAnagram(){return new Proxy({}, {get(){while(true){}}})}",
      "wrong-answer",
    ],
  ])("bounds failures for %s", async (code, verdict) => {
    expect(
      (
        await executeProblem({
          ...job,
          code,
          action: "run",
          inputs: [{ s: "ab", t: "ba" }],
        })
      ).verdict,
    ).toBe(verdict);
  });
  it("accepts other correct algorithms and captured intrinsics", async () => {
    const code = `Reflect.apply=()=>true;
    function isAnagram(s,t){if(s.length!==t.length)return false;const counts={};for(const c of s)counts[c]=(counts[c]||0)+1;for(const c of t){if(!counts[c])return false;counts[c]--;}return true;}`;
    expect(
      (await executeProblem({ ...job, code, action: "submit" })).verdict,
    ).toBe("accepted");
  });
  it("selects private cases independently and redacts values, logs, and diagnostics", async () => {
    const result = await executeProblem({
      ...job,
      action: "submit",
      inputs: [{ s: "forged", t: "forged" }],
    });
    expect(result.verdict).toBe("accepted");
    expect(result.total).toBeGreaterThan(problem.samples.length);
    for (const item of result.cases.filter((item) => item.hidden)) {
      expect(item).not.toHaveProperty("input");
      expect(item).not.toHaveProperty("expected");
      expect(item).not.toHaveProperty("actual");
      expect(item.logs).toEqual([]);
    }
    const failed = await executeProblem({
      ...job,
      action: "submit",
      code: "function isAnagram(s){console.log([s],{input:s});throw new Error('secret:'+s)}",
    });
    for (const item of failed.cases.filter((item) => item.hidden)) {
      expect(item.message).toBe("Hidden case failed.");
      expect(item.logs).toEqual([]);
    }
  });
  it.each([
    "function isAnagram(s,t){return s.length===t.length}",
    "function isAnagram(s,t){return s==='anagram'&&t==='nagaram'}",
    "function isAnagram(s,t){return [...new Set(s)].sort().join('')===[...new Set(t)].sort().join('')}",
  ])("rejects incomplete shortcuts: %s", async (code) =>
    expect(
      (await executeProblem({ ...job, code, action: "submit" })).verdict,
    ).toBe("wrong-answer"),
  );
  it("uses verified ownership and reports persistence failures honestly", async () => {
    const recordExecution = vi.fn(async () => false);
    const post = createExecutionHandler({
      progress: { recordExecution } as unknown as ProgressService,
    });
    const response = await post(
      new Request(`http://localhost:3000/api/problems/${problem.id}/submit`, {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: problem.solution,
          inputs: [{ forged: true }],
          userId: "forged",
        }),
      }),
      { params: Promise.resolve({ problemId: problem.id, action: "submit" }) },
    );
    expect(await response.json()).toMatchObject({
      verdict: "accepted",
      persistence: "unavailable",
    });
    expect(recordExecution).toHaveBeenCalledWith(
      "anagram-owner",
      problem.id,
      problem.solution,
      expect.any(Date),
      "submit",
      expect.objectContaining({ verdict: "accepted" }),
    );
  });
});
