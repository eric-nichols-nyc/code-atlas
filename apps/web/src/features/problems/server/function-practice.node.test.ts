import {
  type ExecutionResult,
  functionCompositionProblem,
  memoizeProblem,
  validRunInputs,
} from "@workspace/problems";
import { describe, expect, it, vi } from "vitest";
import type { ProgressService } from "@/features/catalog/server/progress-service";

vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => true }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => "function-practice-owner",
}));

import { createExecutionHandler } from "./handler";
import { executeProblem } from "./service";

const composition = {
  problemId: functionCompositionProblem.id,
  code: functionCompositionProblem.solution,
};
const memoize = { problemId: memoizeProblem.id, code: memoizeProblem.solution };

describe("isolated Function Composition", () => {
  it("evaluates right-to-left order, the empty identity, zero and boundary-sized pipelines", async () => {
    const result = await executeProblem({
      ...composition,
      action: "run",
      inputs: [
        { functions: ["double", "addOne"], x: 4 },
        { functions: [], x: 0 },
        { functions: ["negate", "addOne", "double"], x: -3 },
        {
          functions: Array.from({ length: 10 }, () => "double" as const),
          x: 10000,
        },
      ],
    });
    expect(result).toMatchObject({ verdict: "accepted", passed: 4, total: 4 });
    expect(result.cases.map((item) => item.actual)).toEqual([
      10, 0, 5, 10240000,
    ]);
  });

  it.each([
    ["function compose(){return 0}", "runtime-error"],
    ["function compose(){return ()=>NaN}", "wrong-answer"],
    [
      "function compose(functions){return x=>functions.reduce((v,fn)=>fn(v),x)}",
      "wrong-answer",
    ],
    [
      "function compose(functions){functions.reverse();return x=>functions.reduce((v,fn)=>fn(v),x)}",
      "wrong-answer",
    ],
    [
      "function compose(functions){return x=>{for(let i=functions.length-1;i>=0;i--){functions[i](x);x=functions[i](x)}return x}}",
      "wrong-answer",
    ],
    [
      "function compose(functions){return x=>{while(functions.length)x=functions.pop()(x);return x}}",
      "wrong-answer",
    ],
    [
      "let fns;function compose(functions){fns=functions;return x=>fns.reduceRight((v,fn)=>fn(v),x)}",
      "wrong-answer",
    ],
    [
      "function compose(){return new Proxy(function(){},{apply(){while(true){}}})}",
      "time-limit-exceeded",
    ],
    ["function compose(){throw new Error('broken')}", "runtime-error"],
    ["function compose( {", "compile-error"],
  ])(
    "rejects incorrect or unbounded composition: %s",
    async (code, verdict) => {
      expect(
        (
          await executeProblem({
            ...composition,
            code,
            action: "run",
            inputs: [{ functions: ["double", "addOne"], x: 4 }],
          })
        ).verdict,
      ).toBe(verdict);
    },
  );

  it("does not coerce or inspect hostile returned objects outside the guest", async () => {
    const code =
      "function compose(){return ()=>new Proxy({}, {get(){while(true){}}})}";
    expect(
      (await executeProblem({ ...composition, code, action: "run" })).verdict,
    ).toBe("wrong-answer");
    expect(
      (await executeProblem({ ...composition, action: "submit" })).verdict,
    ).toBe("accepted");
  });
});

describe("isolated Memoize", () => {
  it("caches falsy zero and distinguishes order, arity and argument boundaries", async () => {
    const result = await executeProblem({
      ...memoize,
      action: "run",
      inputs: [
        { fn: "sum", calls: [[1, 23], [12, 3], [1, 23], [], [0]] },
        {
          fn: "subtract",
          calls: [
            [9, 2],
            [2, 9],
            [9, 2],
          ],
        },
        { fn: "product", calls: [[0, 4], [0, 4], [], []] },
        { fn: "sum", calls: [] },
        {
          fn: "product",
          calls: Array.from({ length: 100 }, () => [100, 100, -100, -100]),
        },
      ],
    });
    expect(result).toMatchObject({ verdict: "accepted", passed: 5, total: 5 });
    expect(result.cases[0]?.actual).toEqual({
      values: [24, 15, 24, 0, 0],
      callCount: 4,
    });
    expect(result.cases[1]?.actual).toEqual({
      values: [7, -7, 7],
      callCount: 2,
    });
    expect(result.cases[2]?.actual).toEqual({
      values: [0, 0, 1, 1],
      callCount: 2,
    });
    expect(result.cases[3]?.actual).toEqual({ values: [], callCount: 0 });
    expect(result.cases[4]?.actual).toEqual({
      values: Array(100).fill(100000000),
      callCount: 1,
    });
  });

  it.each([
    ["function memoize(){return 0}", "runtime-error"],
    ["function memoize(fn){return (...args)=>fn(...args)}", "wrong-answer"],
    [
      "function memoize(fn){const cache={};return (...args)=>{const key=JSON.stringify(args);if(!cache[key])cache[key]=fn(...args);return cache[key]}}",
      "wrong-answer",
    ],
    [
      "function memoize(fn){const cache={};return (...args)=>{const key=args.join('');if(!(key in cache))cache[key]=fn(...args);return cache[key]}}",
      "wrong-answer",
    ],
    [
      "const cache=new Map();function memoize(fn){return (...args)=>{const key=JSON.stringify(args);if(!cache.has(key))cache.set(key,fn(...args));return cache.get(key)}}",
      "wrong-answer",
    ],
    ["function memoize(fn){fn();return fn}", "wrong-answer"],
    ["function memoize(){return ()=>Promise.resolve(0)}", "wrong-answer"],
    [
      "function memoize(){return ()=>new Proxy({}, {get(){while(true){}}})}",
      "wrong-answer",
    ],
    [
      "function memoize(){return new Proxy(function(){},{apply(){while(true){}}})}",
      "time-limit-exceeded",
    ],
    ["function memoize(){throw new Error('broken')}", "runtime-error"],
    ["function memoize( {", "compile-error"],
  ])(
    "rejects incorrect or unbounded memoization: %s",
    async (code, verdict) => {
      expect(
        (
          await executeProblem({
            ...memoize,
            code,
            action: "run",
            inputs: [{ fn: "sum", calls: [[0], [0]] }],
          })
        ).verdict,
      ).toBe(verdict);
    },
  );
});

it.each([composition, memoize])(
  "accepts the full server-selected suite and redacts hidden results for $problemId",
  async (job) => {
    const result = await executeProblem({ ...job, action: "submit" });
    expect(result.verdict).toBe("accepted");
    expect(result.passed).toBe(result.total);
    expect(result.cases.some((item) => item.hidden)).toBe(true);
    for (const item of result.cases.filter((item) => item.hidden)) {
      expect(item).not.toHaveProperty("input");
      expect(item).not.toHaveProperty("expected");
      expect(item).not.toHaveProperty("actual");
      expect(item.logs).toEqual([]);
    }
  },
);

it.each([composition, memoize])(
  "captures judge intrinsics before learner pollution for $problemId",
  async (job) => {
    // QuickJS's JSON.stringify itself can consult polluted array internals.
    // Use an equivalent numeric key builder so this test isolates judge behavior.
    const source =
      job.problemId === memoize.problemId
        ? `function memoize(fn){const cache=new Map();return function(...args){let key=args.length+":";for(let i=0;i<args.length;i++)key+=args[i]+",";if(cache.has(key))return cache.get(key);const value=fn(...args);cache.set(key,value);return value}}`
        : job.code;
    const code = `Reflect.apply=()=>0; JSON.parse=()=>[]; Number.isFinite=()=>false;
    Object.defineProperty(Object.prototype, "status", {get(){while(true){}},set(){while(true){}}});
    Object.defineProperty(Array.prototype, "0", {set(){while(true){}}});
    ${source}`;
    expect(
      (await executeProblem({ ...job, code, action: "submit" })).verdict,
    ).toBe("accepted");
  },
);

it("rejects malformed callbacks, input bounds and extra fields before judging", () => {
  for (const input of [
    { functions: ["unknown"], x: 0 },
    { functions: [], x: 10001 },
    { functions: Array(11).fill("double"), x: 1 },
    { functions: [], x: 1.5 },
    { functions: [], x: 1, extra: true },
  ])
    expect(validRunInputs(functionCompositionProblem, [input])).toBe(false);
  for (const input of [
    { fn: "unknown", calls: [] },
    { fn: "sum", calls: Array(101).fill([]) },
    { fn: "sum", calls: [[101]] },
    { fn: "sum", calls: [[1, 2, 3, 4, 5]] },
    { fn: "subtract", calls: [[1]] },
    { fn: "sum", calls: [[null]] },
    { fn: "sum", calls: [], extra: true },
  ])
    expect(validRunInputs(memoizeProblem, [input])).toBe(false);
});

it("passes verified ownership and actual Run/Submit outcomes to persistence for both problems", async () => {
  const recordExecution = vi.fn(async () => true);
  const post = createExecutionHandler({
    progress: { recordExecution } as unknown as ProgressService,
  });
  for (const job of [composition, memoize]) {
    const request = (code: string) =>
      new Request(
        `http://localhost:3000/api/problems/${job.problemId}/submit`,
        {
          method: "POST",
          headers: {
            origin: "http://localhost:3000",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            inputs: [{ forged: true }],
            userId: "forged-owner",
          }),
        },
      );
    const context = {
      params: Promise.resolve({ problemId: job.problemId, action: "submit" }),
    };
    const response = await post(request(job.code), context);
    const result = (await response.json()) as ExecutionResult;
    expect(response.status).toBe(200);
    expect(result).toMatchObject({ verdict: "accepted", persistence: "saved" });
    expect(recordExecution).toHaveBeenLastCalledWith(
      "function-practice-owner",
      job.problemId,
      job.code,
      expect.any(Date),
      "submit",
      expect.objectContaining({ verdict: "accepted" }),
    );
    const failed = await post(
      request(
        `function ${job.problemId.endsWith("memoize") ? "memoize" : "compose"}(){return 0}`,
      ),
      context,
    );
    expect(await failed.json()).toMatchObject({
      verdict: "runtime-error",
      persistence: "saved",
    });
    expect(recordExecution).toHaveBeenLastCalledWith(
      "function-practice-owner",
      job.problemId,
      expect.any(String),
      expect.any(Date),
      "submit",
      expect.objectContaining({ verdict: "runtime-error" }),
    );
  }
});
