import {
  type ExecutionResult,
  flattenNestedArrayProblem,
  type NestedArray,
  validRunInputs,
} from "@workspace/problems";
import { describe, expect, it, vi } from "vitest";
import type { ProgressService } from "@/features/catalog/server/progress-service";

vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => true }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => "flatten-test-owner",
}));

import { createExecutionHandler } from "./handler";
import { executeProblem } from "./service";

const job = {
  problemId: flattenNestedArrayProblem.id,
  code: flattenNestedArrayProblem.solution,
};
function nested(levels: number): NestedArray {
  let arr: NestedArray = [-3, 0, 2];
  for (let level = 1; level < levels; level++) arr = [arr];
  return arr;
}

describe("isolated nested-array flattening", () => {
  it("runs edited nested arrays, empty arrays, negatives, duplicate zeroes and boundary inputs", async () => {
    const inputs = [
      { arr: [0, [-2, 0], [[5], -2]] },
      { arr: [[], [[]], [[[]]]] },
      { arr: [] },
      { arr: nested(20) },
      { arr: Array.from({ length: 999 }, (_, i) => (i % 7) - 3) },
    ];
    const result = await executeProblem({ ...job, action: "run", inputs });
    expect(result).toMatchObject({ verdict: "accepted", passed: 5, total: 5 });
    expect(result.cases[0]?.actual).toEqual([0, -2, 0, 5, -2]);
    expect(result.cases[1]?.actual).toEqual([]);
    expect(result.cases[2]?.actual).toEqual([]);
    expect(result.cases[3]?.actual).toEqual([-3, 0, 2]);
    expect(result.cases[4]?.actual).toHaveLength(999);
    expect(inputs[0]?.arr).toEqual([0, [-2, 0], [[5], -2]]);
  });

  it("accepts all Submit cases and redacts hidden values and logs", async () => {
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
    ["function flatten(arr){return arr.slice()}", "wrong-answer"],
    ["function flatten(arr){return [].concat(...arr)}", "wrong-answer"],
    [
      "function flatten(arr){const result=[];while(arr.length){const x=arr.shift();if(Array.isArray(x))result.push(...flatten(x));else result.push(x)}return result}",
      "wrong-answer",
    ],
    ["function flatten(){return '1,2,3,4,5'}", "runtime-error"],
    ["async function flatten(){return []}", "runtime-error"],
    ["function flatten(){return [NaN]}", "wrong-answer"],
    ["function flatten(){return new Array(1001).fill(1)}", "wrong-answer"],
    ["function flatten(){while(true){}}", "time-limit-exceeded"],
    [
      "function flatten(){return new Proxy([], {get(){while(true){}}})}",
      "time-limit-exceeded",
    ],
    [
      "function flatten(arr){Object.defineProperty(arr,'0',{get(){while(true){}}});return []}",
      "time-limit-exceeded",
    ],
    ["function flatten(){throw new Error('broken')}", "runtime-error"],
    ["function flatten( {", "compile-error"],
  ])("rejects incorrect or unbounded behavior: %s", async (code, verdict) => {
    expect(
      (await executeProblem({ ...job, code, action: "run" })).verdict,
    ).toBe(verdict);
  });

  it.each(["flat", "flatMap"])(
    "disables Array.prototype.%s",
    async (method) => {
      const code =
        method === "flat"
          ? "function flatten(arr){return arr.flat(Infinity)}"
          : "function flatten(arr){return arr.flatMap(x=>x)}";
      const result = await executeProblem({ ...job, code, action: "run" });
      expect(result.verdict).toBe("runtime-error");
      expect(result.cases[0]?.message).toContain("disabled for this exercise");
    },
  );

  it("requires a new result even for already-flat input", async () => {
    const result = await executeProblem({
      ...job,
      code: "function flatten(arr){return arr}",
      action: "run",
      inputs: [{ arr: [1, 2] }],
    });
    expect(result.verdict).toBe("wrong-answer");
    expect(result.cases[0]?.message).toContain("return a new array");
  });

  it("rejects sparse output even when a prototype supplies the missing number", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [{ arr: [1, [2, 3, 4, 5]] }],
      code: "Object.defineProperty(Array.prototype,'0',{value:1,writable:true});function flatten(){return [,2,3,4,5]}",
    });
    expect(result.verdict).toBe("wrong-answer");
  });

  it.each([
    "function flatten(arr){const out=[];function visit(a){for(const x of a){if(Array.isArray(x))visit(x);else out.push(x)}}visit(arr);return out.sort((a,b)=>a-b)}",
    "function flatten(arr){const out=[];function visit(a){for(const x of a){if(Array.isArray(x))visit(x);else out.push(x)}}visit(arr);return [...new Set(out)]}",
  ])(
    "rejects sample-only sorting or deduplication and hides private diagnostics",
    async (code) => {
      expect(
        (await executeProblem({ ...job, code, action: "run" })).verdict,
      ).toBe("accepted");
      const result = await executeProblem({ ...job, code, action: "submit" });
      expect(result.verdict).toBe("wrong-answer");
      expect(result.cases.at(-1)).toMatchObject({
        hidden: true,
        logs: [],
        message:
          "A hidden test failed. Check the function for all supported inputs.",
      });
      expect(result.cases.at(-1)).not.toHaveProperty("expected");
      expect(result.cases.at(-1)).not.toHaveProperty("actual");
    },
  );

  it("captures judge intrinsics, rejects fake arrays and recovers after interruption", async () => {
    expect(
      (
        await executeProblem({
          ...job,
          action: "run",
          code: "function flatten(){while(true){}}",
        })
      ).verdict,
    ).toBe("time-limit-exceeded");
    const fake = await executeProblem({
      ...job,
      action: "run",
      code: "Array.isArray=()=>true;function flatten(){return {0:1,1:2,2:3,3:4,4:5,length:5}}",
    });
    expect(fake.verdict).toBe("runtime-error");
    const code = `Reflect.apply=()=>0; Number.isFinite=()=>false; Number.isInteger=()=>false; JSON.parse=()=>[];
      Object.defineProperty(Object.prototype, 'status', {get(){while(true){}},set(){while(true){}}});
      ${job.code}`;
    expect(
      (await executeProblem({ ...job, action: "submit", code })).verdict,
    ).toBe("accepted");
  });

  it("bounds depth/nodes and rejects unsupported leaves and extra keys", () => {
    const cyclic: unknown[] = [];
    cyclic.push(cyclic);
    for (const input of [
      { arr: nested(21) },
      { arr: Array(1000).fill(1) },
      { arr: cyclic },
      { arr: [null] },
      { arr: [true] },
      { arr: ["1"] },
      { arr: [{ value: 1 }] },
      { arr: [1.5] },
      { arr: [1e9 + 1] },
      { arr: [NaN] },
      { arr: [1], depth: 1 },
      { arr: [1], userId: "forged" },
      { arr: { length: 0 } },
    ])
      expect(validRunInputs(flattenNestedArrayProblem, [input])).toBe(false);
    expect(
      validRunInputs(flattenNestedArrayProblem, [
        { arr: nested(20) },
        { arr: Array(999).fill(1) },
      ]),
    ).toBe(true);
  });
});

it("runs and submits through verified Next identity and preserves the server verdict for saving without a live account", async () => {
  const recordExecution = vi.fn(async () => true);
  const progress = { recordExecution } as unknown as ProgressService;
  const post = createExecutionHandler({ progress });
  const request = (code: string, inputs: unknown) =>
    new Request(
      "http://localhost:3000/api/problems/javascript.flatten-nested-array/run",
      {
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
      },
    );
  const context = (action: string) => ({
    params: Promise.resolve({ problemId: job.problemId, action }),
  });
  expect(
    (await post(request(job.code, [{ arr: [null] }]), context("run"))).status,
  ).toBe(400);
  expect(recordExecution).not.toHaveBeenCalled();
  const run = await post(
    request(job.code, [{ arr: [0, [1, [0]]] }]),
    context("run"),
  );
  expect(await run.json()).toMatchObject({
    verdict: "accepted",
    total: 1,
    persistence: "saved",
    cases: [{ actual: [0, 1, 0] }],
  });
  const submit = await post(
    request(job.code, [{ arr: [null] }]),
    context("submit"),
  );
  const result = (await submit.json()) as ExecutionResult;
  expect(result).toMatchObject({ verdict: "accepted", total: 11, passed: 11 });
  expect(recordExecution).toHaveBeenLastCalledWith(
    "flatten-test-owner",
    job.problemId,
    job.code,
    expect.any(Date),
    "submit",
    expect.objectContaining({ verdict: "accepted" }),
  );
  await post(
    request(flattenNestedArrayProblem.starterCode, undefined),
    context("submit"),
  );
  expect(recordExecution).toHaveBeenLastCalledWith(
    "flatten-test-owner",
    job.problemId,
    flattenNestedArrayProblem.starterCode,
    expect.any(Date),
    "submit",
    expect.objectContaining({ verdict: "wrong-answer" }),
  );
});
