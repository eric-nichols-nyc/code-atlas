import {
  chunkArrayProblem,
  type ExecutionResult,
  mapArrayProblem,
  type ProblemDefinition,
  reduceArrayProblem,
  validRunInputs,
} from "@workspace/problems";
import { describe, expect, it, vi } from "vitest";
import type { ProgressService } from "@/features/catalog/server/progress-service";

vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => true }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => "array-practice-owner",
}));

import { createExecutionHandler } from "./handler";
import { executeProblem } from "./service";

const job = (problem: ProblemDefinition) => ({
  problemId: problem.id,
  code: problem.solution,
});

for (const problem of [
  mapArrayProblem,
  reduceArrayProblem,
  chunkArrayProblem,
]) {
  describe(problem.title, () => {
    it("runs the reference solution and accepts its full server-selected Submit suite", async () => {
      const run = await executeProblem({ ...job(problem), action: "run" });
      expect(run.verdict).toBe("accepted");
      expect(run.passed).toBe(problem.samples.length);
      const submit = await executeProblem({
        ...job(problem),
        action: "submit",
      });
      expect(submit.verdict).toBe("accepted");
      expect(submit.passed).toBe(submit.total);
      expect(submit.total).toBeGreaterThan(problem.samples.length);
      for (const item of submit.cases.filter((item) => item.hidden)) {
        expect(item).not.toHaveProperty("input");
        expect(item).not.toHaveProperty("expected");
        expect(item).not.toHaveProperty("actual");
        expect(item.logs).toEqual([]);
      }
    });
    it("keeps endless execution bounded and the next job usable", async () => {
      const endless = `function ${problem.entryFunction}(){while(true){}}`;
      expect(
        (
          await executeProblem({
            ...job(problem),
            code: endless,
            action: "run",
          })
        ).verdict,
      ).toBe("time-limit-exceeded");
      expect(
        (await executeProblem({ ...job(problem), action: "run" })).verdict,
      ).toBe("accepted");
    });
    it("keeps thrown errors and invalid source separate from wrong answers", async () => {
      expect(
        (
          await executeProblem({
            ...job(problem),
            code: `function ${problem.entryFunction}(){throw new Error('broken')}`,
            action: "run",
          })
        ).verdict,
      ).toBe("runtime-error");
      expect(
        (
          await executeProblem({
            ...job(problem),
            code: `function ${problem.entryFunction}( {`,
            action: "run",
          })
        ).verdict,
      ).toBe("compile-error");
    });
    it("captures judge intrinsics before source and copies diagnostics without prototype getters", async () => {
      const code = `Reflect.apply=()=>0; JSON.parse=()=>[]; Number.isFinite=()=>false; Number.isInteger=()=>false;
        Object.defineProperty(Object.prototype,'status',{get(){while(true){}},set(){while(true){}}});
        ${problem.solution}`;
      expect(
        (await executeProblem({ ...job(problem), code, action: "submit" }))
          .verdict,
      ).toBe("accepted");
    });
  });
}

describe("mapping callback contract", () => {
  it("supports indices, zero, negatives, empty input and maximum length without mutating the request", async () => {
    const inputs = [
      { arr: [-4, 0, 2], transform: "addIndex" as const },
      { arr: [-4, 0, 2], transform: "zero" as const },
      { arr: [], transform: "double" as const },
      { arr: [-10000, 10000], transform: "square" as const },
      {
        arr: Array.from({ length: 1000 }, (_, i) => i - 500),
        transform: "negate" as const,
      },
    ];
    const run = await executeProblem({
      ...job(mapArrayProblem),
      action: "run",
      inputs,
    });
    expect(run).toMatchObject({ verdict: "accepted", passed: 5, total: 5 });
    expect(run.cases[0]?.actual).toEqual([-4, 1, 4]);
    expect(run.cases[1]?.actual).toEqual([0, 0, 0]);
    expect(run.cases[2]?.actual).toEqual([]);
    expect(run.cases[3]?.actual).toEqual([1e8, 1e8]);
    expect(run.cases[4]?.actual).toHaveLength(1000);
    expect(inputs[0]?.arr).toEqual([-4, 0, 2]);
  });
  it.each([
    ["function mapArray(arr,fn){return arr.map(fn)}", "runtime-error"],
    ["function mapArray(arr,fn){return arr.map(x=>x)}", "runtime-error"],
    [
      "function mapArray(arr,fn){const out=[];for(let i=0;i<arr.length;i++){fn(arr[i],i);out.push(fn(arr[i],i))}return out}",
      "wrong-answer",
    ],
    [
      "function mapArray(arr,fn){const out=[];for(let i=arr.length-1;i>=0;i--)out[i]=fn(arr[i],i);return out}",
      "wrong-answer",
    ],
    [
      "function mapArray(arr,fn){for(let i=0;i<arr.length;i++)arr[i]=fn(arr[i],i);return arr}",
      "wrong-answer",
    ],
    ["function mapArray(){return [NaN]}", "wrong-answer"],
    [
      "Array.isArray=()=>true;function mapArray(){return {0:2,length:1}}",
      "runtime-error",
    ],
    [
      "function mapArray(){return new Proxy([], {get(){while(true){}}})}",
      "time-limit-exceeded",
    ],
    [
      "function mapArray(arr){Object.defineProperty(arr,'0',{get(){while(true){}}});return []}",
      "time-limit-exceeded",
    ],
  ])(
    "rejects shortcuts, callback misuse and hostile values: %s",
    async (code, verdict) => {
      expect(
        (await executeProblem({ ...job(mapArrayProblem), code, action: "run" }))
          .verdict,
      ).toBe(verdict);
    },
  );
  it("rejects a sparse output even when the array prototype supplies a numeric value", async () => {
    const run = await executeProblem({
      ...job(mapArrayProblem),
      action: "run",
      inputs: [{ arr: [1], transform: "double" }],
      code: "function mapArray(arr,fn){fn(arr[0],0);Array.prototype[0]=2;return new Array(1)}",
    });
    expect(run.verdict).toBe("wrong-answer");
  });
});

describe("left-to-right reduction contract", () => {
  it("starts with init, supports empty arrays and counts negative even values", async () => {
    const run = await executeProblem({
      ...job(reduceArrayProblem),
      action: "run",
      inputs: [
        { nums: [4, -2, 0], reducer: "subtract", init: 10 },
        { nums: [], reducer: "sum", init: -7 },
        { nums: [-2, -3, 0, 4], reducer: "countEven", init: 5 },
        { nums: [-5, -9], reducer: "max", init: -100 },
        { nums: Array(1000).fill(10000), reducer: "sum", init: 1e9 },
      ],
    });
    expect(run).toMatchObject({ verdict: "accepted", passed: 5 });
    expect(run.cases.map((item) => item.actual)).toEqual([
      8, -7, 8, -5, 1010000000,
    ]);
  });
  it.each([
    [
      "function reduceArray(nums,fn,init){return nums.reduce(fn,init)}",
      "runtime-error",
    ],
    [
      "function reduceArray(nums,fn,init){return nums.reduceRight(fn,init)}",
      "runtime-error",
    ],
    [
      "function reduceArray(nums,fn,init){let acc=init;for(let i=nums.length-1;i>=0;i--)acc=fn(acc,nums[i]);return acc}",
      "wrong-answer",
    ],
    [
      "function reduceArray(nums,fn,init){let acc=init;for(const n of nums){fn(acc,n);acc=fn(acc,n)}return acc}",
      "wrong-answer",
    ],
    [
      "function reduceArray(nums,fn,init){let acc=init;while(nums.length)acc=fn(acc,nums.shift());return acc}",
      "wrong-answer",
    ],
    [
      "Number.isFinite=()=>true;function reduceArray(){return NaN}",
      "runtime-error",
    ],
    [
      "function reduceArray(){return new Proxy({}, {get(){while(true){}}})}",
      "runtime-error",
    ],
    [
      "function reduceArray(nums){Object.defineProperty(nums,'0',{get(){while(true){}}});return 0}",
      "time-limit-exceeded",
    ],
  ])("rejects invalid reduction protocols: %s", async (code, verdict) => {
    expect(
      (
        await executeProblem({
          ...job(reduceArrayProblem),
          code,
          action: "run",
        })
      ).verdict,
    ).toBe(verdict);
  });
});

describe("chunked array contract", () => {
  it("preserves order, duplicates and zero and supports empty/maximum-sized arrays", async () => {
    const run = await executeProblem({
      ...job(chunkArrayProblem),
      action: "run",
      inputs: [
        { arr: [0, -1, 0, 5, 5], size: 2 },
        { arr: [], size: 3 },
        { arr: [9], size: 1000 },
        { arr: Array.from({ length: 1000 }, (_, i) => i - 500), size: 1 },
        { arr: Array(1000).fill(1000000000), size: 1000 },
      ],
    });
    expect(run).toMatchObject({ verdict: "accepted", passed: 5 });
    expect(run.cases[0]?.actual).toEqual([[0, -1], [0, 5], [5]]);
    expect(run.cases[1]?.actual).toEqual([]);
    expect(run.cases[2]?.actual).toEqual([[9]]);
    expect(run.cases[3]?.actual).toHaveLength(1000);
    expect(run.cases[4]?.actual).toHaveLength(1);
  });
  it.each([
    [
      "function chunkArray(arr,size){const out=[];while(arr.length)out.push(arr.splice(0,size));return out}",
      "wrong-answer",
    ],
    ["function chunkArray(arr,size){return [arr]}", "wrong-answer"],
    ["function chunkArray(arr,size){return arr}", "wrong-answer"],
    ["function chunkArray(){return null}", "runtime-error"],
    ["function chunkArray(){return [1,2]}", "runtime-error"],
    ["function chunkArray(){return [[NaN]]}", "wrong-answer"],
    [
      "Array.isArray=()=>true;function chunkArray(){return {0:[1],length:1}}",
      "runtime-error",
    ],
    [
      "function chunkArray(){return [new Proxy([], {get(){while(true){}}})]}",
      "time-limit-exceeded",
    ],
    [
      "function chunkArray(){return new Proxy([], {get(){while(true){}}})}",
      "time-limit-exceeded",
    ],
  ])(
    "rejects mutation and malformed or hostile matrices: %s",
    async (code, verdict) => {
      expect(
        (
          await executeProblem({
            ...job(chunkArrayProblem),
            code,
            action: "run",
          })
        ).verdict,
      ).toBe(verdict);
    },
  );
  it("requires independent chunk arrays even when groups have identical values", async () => {
    const run = await executeProblem({
      ...job(chunkArrayProblem),
      action: "run",
      inputs: [{ arr: [1, 1], size: 1 }],
      code: "function chunkArray(){const row=[1];return [row,row]}",
    });
    expect(run.verdict).toBe("wrong-answer");
    expect(run.cases[0]?.message).toContain("own new array");
  });
  it("rejects sparse chunks and bounds total output values", async () => {
    const sparse = await executeProblem({
      ...job(chunkArrayProblem),
      action: "run",
      inputs: [{ arr: [1], size: 1 }],
      code: "function chunkArray(){Array.prototype[0]=1;return [new Array(1)]}",
    });
    expect(sparse.verdict).toBe("wrong-answer");
    const large = await executeProblem({
      ...job(chunkArrayProblem),
      action: "run",
      code: "function chunkArray(){return Array.from({length:1000},()=>Array(1000).fill(1))}",
    });
    expect(large.verdict).toBe("wrong-answer");
  });
});

it("bounds the new contracts and rejects unknown callbacks, extra keys and sparse JSON-like inputs", () => {
  for (const value of [
    { arr: [1], transform: "unknown" },
    { arr: Array(1001).fill(1), transform: "double" },
    { arr: [10001], transform: "double" },
    { arr: [1.5], transform: "zero" },
    { arr: [null], transform: "zero" },
    { arr: [NaN], transform: "zero" },
    { arr: [1], transform: "double", userId: "forged" },
  ])
    expect(validRunInputs(mapArrayProblem, [value])).toBe(false);
  for (const value of [
    { nums: [1], reducer: "unknown", init: 0 },
    { nums: [1], reducer: "sum", init: 1e9 + 1 },
    { nums: [1], reducer: "sum" },
    { nums: [null], reducer: "max", init: 0 },
    { nums: Array(1001).fill(1), reducer: "sum", init: 0 },
    { nums: [1], reducer: "sum", init: 0, userId: "forged" },
  ])
    expect(validRunInputs(reduceArrayProblem, [value])).toBe(false);
  for (const value of [
    { arr: [1], size: 0 },
    { arr: [1], size: 1001 },
    { arr: [1], size: 1.5 },
    { arr: Array(1001).fill(1), size: 2 },
    { arr: [1e9 + 1], size: 1 },
    { arr: [1], size: 2, userId: "forged" },
  ])
    expect(validRunInputs(chunkArrayProblem, [value])).toBe(false);
});

it("keeps Run and Submit on the verified saving boundary for each new array problem", async () => {
  for (const problem of [
    mapArrayProblem,
    reduceArrayProblem,
    chunkArrayProblem,
  ]) {
    const recordExecution = vi.fn(async () => true);
    const progress = { recordExecution } as unknown as ProgressService;
    const post = createExecutionHandler({ progress });
    const request = (inputs: unknown) =>
      new Request(`http://localhost:3000/api/problems/${problem.id}/run`, {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: problem.solution,
          inputs,
          userId: "forged",
        }),
      });
    const context = (action: string) => ({
      params: Promise.resolve({ problemId: problem.id, action }),
    });
    const run = await post(
      request([problem.samples[0]?.input]),
      context("run"),
    );
    expect(await run.json()).toMatchObject({
      verdict: "accepted",
      total: 1,
      persistence: "saved",
    });
    // Submit ignores even invalid client-selected cases and uses its private suite.
    const submit = await post(request([{ invalid: true }]), context("submit"));
    const result = (await submit.json()) as ExecutionResult;
    expect(result.verdict).toBe("accepted");
    expect(result.total).toBeGreaterThan(problem.samples.length);
    expect(recordExecution).toHaveBeenLastCalledWith(
      "array-practice-owner",
      problem.id,
      problem.solution,
      expect.any(Date),
      "submit",
      expect.objectContaining({ verdict: "accepted" }),
    );
  }
});
