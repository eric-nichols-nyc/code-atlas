import { describe, expect, it } from "vitest";
import { runPlaygroundScript } from "./service";

describe("compiled Playground worker", () => {
  it("runs standalone code, captures native console methods, and starts fresh", async () => {
    const code = [
      "globalThis.count = (globalThis.count ?? 0) + 1;",
      "console.log([2, 4, 6].map(n => n * 2));",
      "console.warn({ count });",
      'console.error("still a log");',
    ].join("\n");
    const result = {
      status: "finished",
      logs: ["[4,8,12]", '{"count":1}', "still a log"],
    };
    await expect(runPlaygroundScript(code)).resolves.toEqual(result);
    await expect(runPlaygroundScript(code)).resolves.toEqual(result);
  });

  it("drains jobs between timers and clears cancelled timers", async () => {
    const code = `
      const cancelled = setTimeout(() => console.log("cancelled"), 1000);
      clearTimeout(cancelled);
      Promise.resolve().then(() => console.log("first job"));
      setTimeout(() => {
        console.log("first timer");
        Promise.resolve().then(() => console.log("timer job"));
      }, 0);
      new Promise(resolve => setTimeout(() => {
        console.log("second timer");
        resolve();
      }, 0));
    `;
    await expect(runPlaygroundScript(code)).resolves.toEqual({
      status: "finished",
      logs: ["first job", "first timer", "timer job", "second timer"],
    });
  });

  it.each([
    ["const = ;", "variable name"],
    [
      'console.log("before"); throw new Error("broken script");',
      "broken script",
    ],
    [
      'setTimeout(() => { throw new Error("broken timer"); }, 0);',
      "broken timer",
    ],
    ['Promise.reject(new Error("broken promise"));', "broken promise"],
    ["new Promise(() => {});", "pending"],
  ])("returns errors from %s", async (code, message) => {
    const result = await runPlaygroundScript(code);
    expect(result.status).toBe("error");
    if (result.status !== "finished") expect(result.message).toContain(message);
    if (code.includes('"before"')) expect(result.logs).toEqual(["before"]);
  });

  it("bounds CPU, jobs and logs, then accepts another script", async () => {
    for (const code of [
      "while (true) {}",
      "function again() { Promise.resolve().then(again); } again();",
    ]) {
      await expect(runPlaygroundScript(code)).resolves.toMatchObject({
        status: "time-limit-exceeded",
      });
    }
    const result = await runPlaygroundScript(
      'for (let i = 0; i < 100; i++) console.log("x".repeat(400));',
    );
    expect(result.status).toBe("finished");
    expect(result.logs.length).toBeLessThanOrEqual(41);
    expect(result.logs.at(-1)).toBe("Console output truncated.");
    expect(result.logs.slice(0, -1).join("").length).toBeLessThanOrEqual(8192);
    await expect(runPlaygroundScript("console.log(42)")).resolves.toEqual({
      status: "finished",
      logs: ["42"],
    });
  });

  it("exposes JavaScript globals and the console without host capabilities", async () => {
    const result = await runPlaygroundScript(
      "console.log(typeof process, typeof require, typeof fetch, typeof document);",
    );
    expect(result).toEqual({
      status: "finished",
      logs: ["undefined undefined undefined undefined"],
    });
    await expect(
      runPlaygroundScript('import { readFile } from "node:fs";'),
    ).resolves.toMatchObject({ status: "error" });
  });
});
