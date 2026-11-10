import {
  delayEachPromiseProblem,
  type ExecutionResult,
  validRunInputs,
} from "@workspace/problems";
import { describe, expect, it, vi } from "vitest";
import type { ProgressService } from "@/features/catalog/server/progress-service";

vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => true }));
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: "promise-delay-test-owner" }),
}));

import { createExecutionHandler } from "./handler";
import { executeProblem } from "./service";

const job = {
  problemId: delayEachPromiseProblem.id,
  code: delayEachPromiseProblem.solution,
};

describe("isolated Promise fulfillment delays", () => {
  it("runs concurrent, zero-delay, empty and edited inputs in original order", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [
        {
          ms: 7,
          functions: [
            { t: 50, value: 4 },
            { t: 1, value: -2 },
          ],
        },
        { ms: 0, functions: [{ t: 0, value: 0 }] },
        { ms: 300, functions: [] },
      ],
    });
    expect(result).toMatchObject({ verdict: "accepted", passed: 3, total: 3 });
    expect(result.cases[0]?.actual).toEqual([
      { t: 57, value: 4 },
      { t: 8, value: -2 },
    ]);
    expect(result.cases[1]?.actual).toEqual([{ t: 0, value: 0 }]);
    expect(result.cases[2]?.actual).toEqual([]);
  });
  it("accepts the complete suite and redacts hidden values", async () => {
    const result = await executeProblem({ ...job, action: "submit" });
    expect(result).toMatchObject({
      verdict: "accepted",
      passed: 10,
      total: 10,
    });
    for (const item of result.cases.filter((c) => c.hidden)) {
      expect(item.input).toBeUndefined();
      expect(item.actual).toBeUndefined();
      expect(item.expected).toBeUndefined();
      expect(item.logs).toEqual([]);
    }
  });
  it.each([
    ["function delayAll(functions){return functions}", "wrong-answer"],
    [
      "function delayAll(functions,ms){return functions.map(fn=>{const p=fn();return async()=>{const v=await p;await new Promise(r=>setTimeout(r,ms));return v}})}",
      "wrong-answer",
    ],
    [
      "function delayAll(functions,ms){return functions.map(fn=>async()=>{await new Promise(r=>setTimeout(r,ms));return await fn()})}",
      "wrong-answer",
    ],
    [
      "function delayAll(functions){return functions.map(fn=>fn())}",
      "runtime-error",
    ],
    ["async function delayAll(){return []}", "runtime-error"],
    [
      "function delayAll(functions,ms){return functions.map(fn=>async()=>{await fn();await new Promise(r=>setTimeout(r,ms))})}",
      "wrong-answer",
    ],
    [
      "function delayAll(functions){return functions.map(fn=>()=>{fn();return new Promise(()=>{})})}",
      "time-limit-exceeded",
    ],
    ["function delayAll(){throw new Error('bad')}", "runtime-error"],
    ["function delayAll(){while(true){}}", "time-limit-exceeded"],
    [
      "function delayAll(functions){return new Proxy(functions,{get(target,key){if(key==='length')while(true){};return target[key]}})}",
      "time-limit-exceeded",
    ],
    [
      "function delayAll(functions){return functions.map(fn=>()=>{fn();return Promise.resolve().then(function loop(){return Promise.resolve().then(loop)})})}",
      "time-limit-exceeded",
    ],
    ["function delayAll( {", "compile-error"],
  ])("fails honestly for %s", async (code, verdict) => {
    const result = await executeProblem({ ...job, code, action: "run" });
    expect(result.verdict).toBe(verdict);
  });
  it("rejects sample-only timing and hides failed private diagnostics", async () => {
    const code =
      "function delayAll(functions,ms){return functions.map(fn=>async()=>{const v=await fn();console.log(v);await new Promise(r=>setTimeout(r,ms>500?0:ms));return v})}";
    const result = await executeProblem({ ...job, code, action: "submit" });
    expect(result.verdict).toBe("wrong-answer");
    expect(result.cases.at(-1)).toMatchObject({ hidden: true, logs: [] });
    expect(result.cases.at(-1)?.actual).toBeUndefined();
    expect(result.cases.at(-1)?.expected).toBeUndefined();
    expect(result.cases.at(-1)?.message).toBe(
      "A hidden test failed. Check the function for all supported inputs.",
    );
    expect((await executeProblem({ ...job, action: "run" })).verdict).toBe(
      "accepted",
    );
  });
  it("rejects malformed, excessive and out-of-range function descriptors", () => {
    for (const input of [
      { ms: -1, functions: [] },
      { ms: 1001, functions: [] },
      { ms: 10, functions: [{ t: 1.5, value: 1 }] },
      { ms: 10, functions: [{ t: 0, value: "text" }] },
      { ms: 10, functions: [{ t: 0, value: 1, code: "source" }] },
      {
        ms: 0,
        functions: Array.from({ length: 11 }, () => ({ t: 1, value: 1 })),
      },
    ])
      expect(validRunInputs(delayEachPromiseProblem, [input])).toBe(false);
  });
});

it("runs and submits through the verified Next boundary without writing any real account", async () => {
  const recordExecution = vi.fn(async () => true);
  const progress = { recordExecution } as unknown as ProgressService;
  const post = createExecutionHandler({ progress });
  const request = (inputs: unknown) =>
    new Request("http://localhost:3000/api/problems/test/run", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: job.code, inputs, userId: "forged-owner" }),
    });
  const context = (action: string) => ({
    params: Promise.resolve({ problemId: job.problemId, action }),
  });
  expect(
    (await post(request([{ ms: -1, functions: [] }]), context("run"))).status,
  ).toBe(400);
  const run = await post(
    request([{ ms: 5, functions: [{ t: 20, value: 9 }] }]),
    context("run"),
  );
  expect(await run.json()).toMatchObject({
    verdict: "accepted",
    total: 1,
    persistence: "saved",
  });
  // Submit must ignore even invalid client-selected cases.
  const submit = await post(
    request([{ ms: -1, functions: [] }]),
    context("submit"),
  );
  const result = (await submit.json()) as ExecutionResult;
  expect(result).toMatchObject({ verdict: "accepted", total: 10, passed: 10 });
  expect(recordExecution).toHaveBeenLastCalledWith(
    "promise-delay-test-owner",
    job.problemId,
    job.code,
    expect.any(Date),
    "submit",
    expect.objectContaining({ verdict: "accepted" }),
  );
});
