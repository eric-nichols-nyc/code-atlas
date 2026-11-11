import {
  curryProblem,
  type ExecutionResult,
  validRunInputs,
} from "@workspace/problems";
import { describe, expect, it, vi } from "vitest";
import type { ProgressService } from "@/features/catalog/server/progress-service";

vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => true }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => "curry-test-owner",
}));

import { createExecutionHandler } from "./handler";
import { executeProblem } from "./service";

const job = { problemId: curryProblem.id, code: curryProblem.solution };

describe("isolated Curry judging", () => {
  it("runs grouped arguments, empty calls, zero arity, extra arguments and numeric zero", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [
        { fn: "sum3", groups: [[], [1], [], [2, 3]] },
        { fn: "constant", groups: [[]] },
        { fn: "countArgs", groups: [[1], [2, 3, 4]] },
        { fn: "subtract3", groups: [[5, 2], [3]] },
        { fn: "product4", groups: [[-2], [3, 4], [5]] },
      ],
    });
    expect(result).toMatchObject({ verdict: "accepted", passed: 5, total: 5 });
    expect(result.cases.map((item) => item.actual)).toEqual([
      6, 42, 4, 0, -120,
    ]);
  });

  it("accepts the full suite and redacts private input, output and logs", async () => {
    const result = await executeProblem({ ...job, action: "submit" });
    expect(result).toMatchObject({
      verdict: "accepted",
      passed: 11,
      total: 11,
    });
    for (const item of result.cases.filter((item) => item.hidden)) {
      expect(item).not.toHaveProperty("input");
      expect(item).not.toHaveProperty("expected");
      expect(item).not.toHaveProperty("actual");
      expect(item.logs).toEqual([]);
    }
  });

  it.each([
    ["function curry(){return 42}", "runtime-error"],
    ["async function curry(fn){return fn}", "runtime-error"],
    ["function curry(fn){return (...args)=>fn(...args)}", "wrong-answer"],
    ["function curry(fn){fn();return ()=>42}", "wrong-answer"],
    [
      "function curry(fn){return function c(...args){if(args.length>=fn.length){fn(...args);return fn(...args)}return (...next)=>c(...args,...next)}}",
      "wrong-answer",
    ],
    [
      "function curry(fn){return function c(...args){if(args.length>=fn.length)return Promise.resolve(fn(...args));return (...next)=>c(...args,...next)}}",
      "wrong-answer",
    ],
    ["function curry(){return ()=>{while(true){}}}", "time-limit-exceeded"],
    [
      "function curry(){return new Proxy(function(){},{apply(){while(true){}}})}",
      "time-limit-exceeded",
    ],
    ["function curry(){throw new Error('broken')}", "runtime-error"],
    ["function curry( {", "compile-error"],
  ])("fails honestly for %s", async (code, verdict) => {
    expect(
      (await executeProblem({ ...job, code, action: "run" })).verdict,
    ).toBe(verdict);
  });

  it.each([
    // Reaching exactly fn.length misses extra arguments.
    "function curry(fn){return function c(...args){if(args.length===fn.length)return fn(...args);return (...next)=>c(...args,...next)}}",
    // Shared accumulation passes the examples but breaks reuse of a partial.
    "function curry(fn){const args=[];return function c(...next){args.push(...next);return args.length>=fn.length?fn(...args):c}}",
    // Each new curry call overwrites another closure's callback.
    "let callback;function curry(fn){callback=fn;return function c(...args){if(args.length>=callback.length)return callback(...args);return (...next)=>c(...args,...next)}}",
    // Dropping zero arguments only fails cases outside the examples.
    "function curry(fn){return function c(...args){if(args.length>=fn.length)return fn(...args.filter(Boolean));return (...next)=>c(...args,...next)}}",
  ])(
    "rejects sample-only solutions and hides failing private diagnostics: %s",
    async (code) => {
      expect(
        (await executeProblem({ ...job, code, action: "run" })).verdict,
      ).toBe("accepted");
      const result = await executeProblem({ ...job, code, action: "submit" });
      expect(result.verdict).not.toBe("accepted");
      expect(result.cases.at(-1)).toMatchObject({
        hidden: true,
        logs: [],
        message:
          "A hidden test failed. Check the function for all supported inputs.",
      });
      expect(result.cases.at(-1)).not.toHaveProperty("actual");
    },
  );

  it("uses pristine judge intrinsics and recovers after interruption", async () => {
    expect(
      (
        await executeProblem({
          ...job,
          action: "run",
          code: "function curry(){while(true){}}",
        })
      ).verdict,
    ).toBe("time-limit-exceeded");
    const code = `Reflect.apply=()=>0; Number.isFinite=()=>false; JSON.parse=()=>[]; ${job.code}`;
    expect(
      (await executeProblem({ ...job, action: "submit", code })).verdict,
    ).toBe("accepted");
  });

  it("constructs judge input and diagnostics without invoking polluted prototype setters", async () => {
    const code = `Object.defineProperty(Array.prototype, "0", {set(){while(true){}}});
      Object.defineProperty(Object.prototype, "status", {set(){while(true){}}, get(){while(true){}}});
      ${job.code}`;
    expect(
      (await executeProblem({ ...job, action: "submit", code })).verdict,
    ).toBe("accepted");
  });

  it("rejects malformed, incomplete, excessive and already-completed groups", () => {
    for (const input of [
      { fn: "unknown", groups: [[1, 2, 3]] },
      { fn: "sum3", groups: [] },
      { fn: "sum3", groups: [[1], [2]] },
      { fn: "sum3", groups: [[1, 2, 3], []] },
      { fn: "sum3", groups: [[1, 2, 1001]] },
      { fn: "sum3", groups: [[1, 2, 0.5]] },
      { fn: "sum3", groups: [[1, 2, null]] },
      { fn: "sum3", groups: ["1,2,3"] },
      { fn: "sum3", groups: [Array(13).fill(1)] },
      {
        fn: "sum3",
        groups: [...Array.from({ length: 10 }, () => []), [1, 2, 3]],
      },
      { fn: "constant", groups: [[], []] },
      { fn: "sum3", groups: [[1, 2, 3]], code: "source" },
    ])
      expect(validRunInputs(curryProblem, [input])).toBe(false);
  });
});

it("uses the verified Next identity, actual verdicts and server-selected Submit cases without writing a real account", async () => {
  const recordExecution = vi.fn(async () => true);
  const progress = { recordExecution } as unknown as ProgressService;
  const post = createExecutionHandler({ progress });
  const request = (code: string, inputs: unknown) =>
    new Request("http://localhost:3000/api/problems/javascript.curry/run", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        inputs,
        userId: "forged-owner",
        solvedAt: "forged",
      }),
    });
  const context = (action: string) => ({
    params: Promise.resolve({ problemId: job.problemId, action }),
  });
  expect(
    (
      await post(
        request(job.code, [{ fn: "sum3", groups: [[1]] }]),
        context("run"),
      )
    ).status,
  ).toBe(400);
  expect(recordExecution).not.toHaveBeenCalled();
  const run = await post(
    request(job.code, [{ fn: "sum3", groups: [[0], [0, 0]] }]),
    context("run"),
  );
  expect(await run.json()).toMatchObject({
    verdict: "accepted",
    total: 1,
    persistence: "saved",
    cases: [{ actual: 0 }],
  });
  const submit = await post(
    request(job.code, [{ fn: "unknown", groups: [] }]),
    context("submit"),
  );
  const result = (await submit.json()) as ExecutionResult;
  expect(result).toMatchObject({ verdict: "accepted", passed: 11, total: 11 });
  expect(recordExecution).toHaveBeenLastCalledWith(
    "curry-test-owner",
    job.problemId,
    job.code,
    expect.any(Date),
    "submit",
    expect.objectContaining({ verdict: "accepted" }),
  );
  await post(request(curryProblem.starterCode, undefined), context("submit"));
  expect(recordExecution).toHaveBeenLastCalledWith(
    "curry-test-owner",
    job.problemId,
    curryProblem.starterCode,
    expect.any(Date),
    "submit",
    expect.objectContaining({ verdict: "wrong-answer" }),
  );
});
