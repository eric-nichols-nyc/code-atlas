import { describe, expect, it } from "vitest";
import { executeProblem } from "./service.js";

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
