import {
  counterProblem,
  debounceProblem,
  fibonacciGeneratorProblem,
  filterArrayProblem,
} from "@workspace/problems";
import { describe, expect, it } from "vitest";
import { executeProblem } from "./service.js";

describe("isolated Fibonacci generator judging", () => {
  const job = {
    problemId: fibonacciGeneratorProblem.id,
    code: fibonacciGeneratorProblem.solution,
  };
  it("runs edited counts including zero and the longest supported prefix", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [{ count: 0 }, { count: 1 }, { count: 50 }],
    });
    expect(result.verdict).toBe("accepted");
    expect(result.cases[0]?.actual).toEqual([]);
    expect(result.cases[1]?.actual).toEqual([0]);
    expect(result.cases[2]?.actual).toHaveLength(50);
    expect(result.cases[2]?.actual?.at(-1)).toBe(7778742049);
  });
  it("submits the full private suite and redacts hidden diagnostics", async () => {
    const result = await executeProblem({ ...job, action: "submit" });
    expect(result).toMatchObject({ verdict: "accepted", total: 9, passed: 9 });
    for (const item of result.cases.filter((c) => c.hidden)) {
      expect(item.input).toBeUndefined();
      expect(item.actual).toBeUndefined();
      expect(item.expected).toBeUndefined();
      expect(item.logs).toEqual([]);
    }
  });
  it.each([
    ["function fibonacciGenerator(){return [0,1,1,2,3]}", "runtime-error"],
    ["async function* fibonacciGenerator(){yield 0}", "runtime-error"],
    [
      "function* fibonacciGenerator(){yield* [0,1,1,2,3,5,8,13]}",
      "wrong-answer",
    ],
    ["function* fibonacciGenerator(){while(true) yield 1}", "wrong-answer"],
    ["function* fibonacciGenerator(){yield '0'}", "wrong-answer"],
    ["function* fibonacciGenerator(){yield NaN}", "wrong-answer"],
    [
      "function* fibonacciGenerator(){throw new Error('broken')}",
      "runtime-error",
    ],
    ["function* fibonacciGenerator(){while(true){}}", "time-limit-exceeded"],
    [
      "function fibonacciGenerator(){return {get next(){while(true){}}}}",
      "time-limit-exceeded",
    ],
    [
      "function fibonacciGenerator(){return {next(){return {done:false,get value(){while(true){}}}},[Symbol.iterator](){return this}}}",
      "time-limit-exceeded",
    ],
    ["function* fibonacciGenerator( {", "compile-error"],
  ])(
    "rejects invalid or unbounded generator behavior: %s",
    async (code, verdict) => {
      const result = await executeProblem({ ...job, code, action: "submit" });
      expect(result.verdict).toBe(verdict);
    },
  );
  it("rejects shared global state and a reused singleton iterator", async () => {
    for (const code of [
      "let a=0,b=1; function* fibonacciGenerator(){while(true){yield a;[a,b]=[b,a+b]}}",
      "const shared=(function*(){let a=0,b=1;while(true){yield a;[a,b]=[b,a+b]}})();function fibonacciGenerator(){return shared}",
    ]) {
      const result = await executeProblem({ ...job, code, action: "submit" });
      expect(result.verdict).toBe("wrong-answer");
    }
  });
  it("captures judge intrinsics before learner code and recovers after interruption", async () => {
    expect(
      (
        await executeProblem({
          ...job,
          action: "run",
          inputs: [{ count: 5 }],
          code: "function* fibonacciGenerator(){while(true){}}",
        })
      ).verdict,
    ).toBe("time-limit-exceeded");
    expect(
      (
        await executeProblem({
          ...job,
          action: "submit",
          code: `Reflect.apply = () => 0; Number.isFinite = () => false; ${job.code}`,
        })
      ).verdict,
    ).toBe("accepted");
  });
});

const good =
  "function sleep(millis){return new Promise(resolve=>setTimeout(resolve,millis));}";
describe("isolated asynchronous JavaScript judging", () => {
  it("runs a real timer-backed Promise and measures host elapsed time", async () => {
    const r = await executeProblem({
      code: good,
      action: "run",
      inputs: [20, 40],
    });
    expect(r.verdict).toBe("accepted");
    expect(r.cases[0]?.elapsedMs).toBeGreaterThanOrEqual(17);
    expect(r.passed).toBe(2);
  });
  it("judges the complete private suite with a general solution", async () => {
    const r = await executeProblem({ code: good, action: "submit" });
    expect(r.verdict).toBe("accepted");
    expect(r.passed).toBe(10);
    expect(r.total).toBe(10);
  }, 10000);
  it.each([
    ["function sleep(){}", "runtime-error"],
    ["function sleep(){return 1}", "runtime-error"],
    ["async function sleep(){}", "wrong-answer"],
    [
      'function sleep(){return Promise.reject(new Error("no"))}',
      "runtime-error",
    ],
    ["function sleep( {", "compile-error"],
    ["function sleep(){while(true){}}", "time-limit-exceeded"],
    ["function sleep(){return new Promise(()=>{});}", "time-limit-exceeded"],
    [
      'function sleep(){return new Promise(()=>setTimeout(()=>{throw new Error("bad")},1));}',
      "runtime-error",
    ],
    [
      "function sleep(){return new Promise(resolve=>{for(let i=0;i<1000;i++)setTimeout(resolve,100)});}",
      "runtime-error",
    ],
  ])(
    "fails safely for %s",
    async (code, verdict) => {
      expect(
        (await executeProblem({ code, action: "run", inputs: [30] })).verdict,
      ).toBe(verdict);
    },
    4000,
  );
  it("rejects a sample-only workaround and redacts all hidden diagnostics", async () => {
    const r = await executeProblem({
      code: "function sleep(millis){console.log(millis);return new Promise(resolve=>setTimeout(resolve,millis===100||millis===200?millis:0));}",
      action: "submit",
    });
    expect(r.verdict).not.toBe("accepted");
    for (const c of r.cases.filter((c) => c.hidden)) {
      expect(c.input).toBeUndefined();
      expect(c.elapsedMs).toBeUndefined();
      expect(c.logs).toEqual([]);
    }
  }, 10000);
  it("exposes no host process, require, fetch or environment and recovers after resource failure", async () => {
    const code =
      'function sleep(n){if(typeof process!=="undefined"||typeof require!=="undefined"||typeof fetch!=="undefined")throw new Error("host leaked");return new Promise(r=>setTimeout(r,n));}';
    expect(
      (await executeProblem({ code, action: "run", inputs: [10] })).verdict,
    ).toBe("accepted");
    const r = await executeProblem({
      code: 'function sleep(){let a=[];while(true)a.push(new Array(10000).fill("long value"));}',
      action: "run",
      inputs: [10],
    });
    expect(r.verdict).not.toBe("accepted");
    expect(
      (await executeProblem({ code: good, action: "run", inputs: [10] }))
        .verdict,
    ).toBe("accepted");
  }, 6000);
  it("bounds endless microtasks and console output", async () => {
    const r = await executeProblem({
      code: "function sleep(){return Promise.resolve().then(function loop(){return Promise.resolve().then(loop)});}",
      action: "run",
      inputs: [10],
    });
    expect(r.verdict).toBe("time-limit-exceeded");
    const logs = await executeProblem({
      code: 'function sleep(n){for(let i=0;i<1000;i++)console.log("message");return new Promise(r=>setTimeout(r,n));}',
      action: "run",
      inputs: [10],
    });
    expect(logs.cases[0]?.logs.length).toBeLessThanOrEqual(41);
  }, 4000);
});

describe("isolated Counter judging", () => {
  const job = { problemId: counterProblem.id, code: counterProblem.solution };
  it("runs edited starts and call counts, including negative and zero-call cases", async () => {
    const result = await executeProblem({
      ...job,
      action: "run",
      inputs: [
        { n: -3, calls: 4 },
        { n: 0, calls: 0 },
      ],
    });
    expect(result.verdict).toBe("accepted");
    expect(result.cases[0]?.actual).toEqual([-3, -2, -1, 0]);
    expect(result.cases[0]?.expected).toEqual([-3, -2, -1, 0]);
    expect(result.cases[1]?.actual).toEqual([]);
  });
  it("accepts the full private suite and redacts hidden inputs and outputs", async () => {
    const result = await executeProblem({ ...job, action: "submit" });
    expect(result.verdict).toBe("accepted");
    expect(result.total).toBe(10);
    expect(result.passed).toBe(10);
    for (const c of result.cases.filter((c) => c.hidden)) {
      expect(c.input).toBeUndefined();
      expect(c.expected).toBeUndefined();
      expect(c.actual).toBeUndefined();
      expect(c.logs).toEqual([]);
    }
  });
  it("reports off-by-one output against the visible expected sequence", async () => {
    const result = await executeProblem({
      ...job,
      code: "function createCounter(n){return ()=>++n;}",
      action: "run",
    });
    expect(result.verdict).toBe("wrong-answer");
    expect(result.cases[0]?.actual).toEqual([11]);
    expect(result.cases[0]?.expected).toEqual([10, 11, 12]);
  });
  it("rejects shared global state even when sample sequences pass", async () => {
    const code =
      "let count; function createCounter(n){count=n; return ()=>count++;}";
    expect(
      (await executeProblem({ ...job, code, action: "run" })).verdict,
    ).toBe("accepted");
    const result = await executeProblem({ ...job, code, action: "submit" });
    expect(result.verdict).toBe("wrong-answer");
    expect(result.cases.at(-1)?.hidden).toBe(true);
    expect(result.cases.at(-1)?.message).not.toContain("10");
  });
  it.each([
    ["function createCounter(){return 1;}", "runtime-error"],
    ["function createCounter(){return ()=>undefined;}", "wrong-answer"],
    [
      "function createCounter(){return ()=>{while(true){}};}",
      "time-limit-exceeded",
    ],
    ["function createCounter( {", "compile-error"],
  ])("fails safely for %s", async (code, verdict) => {
    expect(
      (await executeProblem({ ...job, code, action: "run" })).verdict,
    ).toBe(verdict);
  });
});

describe("Debounce and array-filter judging", () => {
  it.each([debounceProblem, filterArrayProblem])(
    "accepts the examples and private suite for $title",
    async (problem) => {
      const job = { problemId: problem.id, code: problem.solution };
      const visible = await executeProblem({ ...job, action: "run" });
      expect(visible.verdict).toBe("accepted");
      expect(visible.cases.map((c) => c.actual)).toEqual(
        problem.samples.map((sample) => sample.expected),
      );
      const submitted = await executeProblem({ ...job, action: "submit" });
      expect(submitted.verdict).toBe("accepted");
      expect(submitted.passed).toBe(10);
      for (const c of submitted.cases.filter((c) => c.hidden)) {
        expect(c.input).toBeUndefined();
        expect(c.actual).toBeUndefined();
        expect(c.expected).toBeUndefined();
        expect(c.logs).toEqual([]);
      }
    },
    10000,
  );
  it("rejects debounce implementations that never cancel or drop arguments", async () => {
    for (const code of [
      "function debounce(fn,t){return (...args)=>setTimeout(()=>fn(...args),t);}",
      "function debounce(fn,t){let id;return (...args)=>{clearTimeout(id);id=setTimeout(()=>fn(),t);};}",
    ]) {
      expect(
        (
          await executeProblem({
            problemId: debounceProblem.id,
            code,
            action: "submit",
          })
        ).verdict,
      ).toBe("wrong-answer");
    }
  });
  it("handles zero delay, same-time calls and deadline ties deterministically", async () => {
    const r = await executeProblem({
      problemId: debounceProblem.id,
      code: debounceProblem.solution,
      action: "run",
      inputs: [
        {
          t: 0,
          calls: [
            { t: 0, inputs: [1] },
            { t: 0, inputs: [2] },
          ],
        },
        {
          t: 10,
          calls: [
            { t: 0, inputs: [1] },
            { t: 10, inputs: [2] },
          ],
        },
      ],
    });
    expect(r.verdict).toBe("accepted");
    expect(r.cases[0]?.actual).toEqual([{ t: 0, inputs: [2] }]);
    expect(r.cases[1]?.actual).toEqual([{ t: 20, inputs: [2] }]);
  });
  it("bounds recursive debounce timers and recovers", async () => {
    const r = await executeProblem({
      problemId: debounceProblem.id,
      code: "function debounce(fn,t){return ()=>setTimeout(function loop(){setTimeout(loop,0);},0);}",
      action: "run",
    });
    expect(r.verdict).not.toBe("accepted");
    expect(
      (
        await executeProblem({
          problemId: debounceProblem.id,
          code: debounceProblem.solution,
          action: "run",
        })
      ).verdict,
    ).toBe("accepted");
  });
  it("rejects strict boolean filtering, wrong indices, and built-in filter use", async () => {
    for (const code of [
      "function filter(arr,fn){const a=[];for(let i=0;i<arr.length;i++)if(fn(arr[i],i)===true)a.push(arr[i]);return a;}",
      "function filter(arr,fn){const a=[];for(let i=0;i<arr.length;i++)if(fn(arr[i]))a.push(arr[i]);return a;}",
    ]) {
      expect(
        (
          await executeProblem({
            problemId: filterArrayProblem.id,
            code,
            action: "submit",
          })
        ).verdict,
      ).toBe("wrong-answer");
    }
    const builtIn = await executeProblem({
      problemId: filterArrayProblem.id,
      code: "function filter(arr,fn){return arr.filter(fn);}",
      action: "run",
    });
    expect(builtIn.verdict).toBe("runtime-error");
    expect(builtIn.cases[0]?.message).toContain("disabled");
  });
  it("uses a pristine array check and interrupts hostile output getters", async () => {
    const fake = await executeProblem({
      problemId: filterArrayProblem.id,
      code: "Array.isArray=()=>true;function filter(){return {0:20,1:30,length:2};}",
      action: "run",
    });
    expect(fake.verdict).toBe("runtime-error");
    const hostile = await executeProblem({
      problemId: filterArrayProblem.id,
      code: "function filter(){return new Proxy([], {get(){while(true){}}});}",
      action: "run",
    });
    expect(hostile.verdict).toBe("time-limit-exceeded");
  });
});
