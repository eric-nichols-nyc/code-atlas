import { performance } from "node:perf_hooks";
import { parentPort, workerData } from "node:worker_threads";
import type { CaseResult, ExecutionAction, Verdict } from "@workspace/problems";
import { getQuickJS, type QuickJSHandle } from "quickjs-emscripten";

interface Work {
  code: string;
  action: ExecutionAction;
  cases: { id: string; millis: number; hidden: boolean }[];
}
const work = workerData as Work;
const QuickJS = await getQuickJS();
async function runCase(test: Work["cases"][number]): Promise<CaseResult> {
  const rt = QuickJS.newRuntime();
  rt.setMemoryLimit(16 * 1024 * 1024);
  rt.setMaxStackSize(256 * 1024);
  let deadline = Infinity;
  let cpu = 0;
  let interrupted = false;
  let closed = false;
  let registrations = 0;
  let jobs = 0;
  let fatal: Verdict | null = null;
  rt.setInterruptHandler(() => {
    if (performance.now() > deadline || cpu > 250) {
      interrupted = true;
      return true;
    }
    return false;
  });
  const ctx = rt.newContext();
  const timers = new Map<
    number,
    {
      timer: ReturnType<typeof setTimeout>;
      callback: QuickJSHandle;
      args: QuickJSHandle[];
    }
  >();
  const logs: string[] = [];
  let logChars = 0;
  let truncated = false;
  let fn: QuickJSHandle | undefined;
  let promise: QuickJSHandle | undefined;
  const enter = <T>(call: () => T): T => {
    const start = performance.now();
    deadline = start + 100;
    try {
      return call();
    } finally {
      cpu += performance.now() - start;
      deadline = Infinity;
    }
  };
  const errorText = (error: QuickJSHandle) => {
    try {
      return enter(() => {
        const message = ctx.getProp(error, "message");
        try {
          return ctx.typeof(message) === "string"
            ? ctx.getString(message).slice(0, 300)
            : "JavaScript threw an error.";
        } finally {
          message.dispose();
        }
      });
    } catch {
      return "JavaScript execution failed.";
    }
  };
  const result = (
    verdict: Verdict,
    message: string,
    elapsedMs?: number,
  ): CaseResult => ({
    id: test.id,
    passed: verdict === "accepted",
    verdict,
    message,
    hidden: test.hidden,
    ...(!test.hidden
      ? { input: test.millis, elapsedMs, logs: [...logs] }
      : { logs: [] }),
  });
  function removeTimer(id: number) {
    const t = timers.get(id);
    if (!t) return;
    timers.delete(id);
    clearTimeout(t.timer);
    t.callback.dispose();
    for (const a of t.args) a.dispose();
  }
  const setTimeoutBridge = ctx.newFunction(
    "setTimeout",
    (callback, delay, ...args) => {
      if (closed || ctx.typeof(callback) !== "function")
        throw new Error("setTimeout needs a function callback.");
      const ms = delay ? ctx.getNumber(delay) : 0;
      if (!Number.isFinite(ms) || ms < 0 || ms > 5000)
        throw new Error("Timer delay must be between 0 and 5000ms.");
      if (++registrations > 128 || timers.size >= 32)
        throw new Error("Timer limit exceeded.");
      const id = registrations;
      const kept = callback.dup();
      const keptArgs = args.slice(0, 8).map((a) => a.dup());
      const timer = setTimeout(() => {
        if (closed) return;
        timers.delete(id);
        try {
          const called = enter(() =>
            ctx.callFunction(kept, ctx.undefined, keptArgs),
          );
          try {
            if (called.error)
              fatal = interrupted ? "time-limit-exceeded" : "runtime-error";
          } finally {
            called.dispose();
          }
        } catch {
          fatal = interrupted ? "time-limit-exceeded" : "runtime-error";
        } finally {
          kept.dispose();
          for (const a of keptArgs) a.dispose();
        }
      }, ms);
      timers.set(id, { timer, callback: kept, args: keptArgs });
      return ctx.newNumber(id);
    },
  );
  ctx.setProp(ctx.global, "setTimeout", setTimeoutBridge);
  setTimeoutBridge.dispose();
  const clearTimeoutBridge = ctx.newFunction("clearTimeout", (id) => {
    removeTimer(ctx.getNumber(id));
    return ctx.undefined;
  });
  ctx.setProp(ctx.global, "clearTimeout", clearTimeoutBridge);
  clearTimeoutBridge.dispose();
  const consoleObject = ctx.newObject();
  for (const level of ["log", "warn", "error"]) {
    const method = ctx.newFunction(level, (...args) => {
      if (logs.length >= 40 || logChars >= 8192) {
        if (!truncated) {
          logs.push("Console output truncated.");
          truncated = true;
        }
        return ctx.undefined;
      }
      const text = args
        .slice(0, 8)
        .map((a) => {
          const type = ctx.typeof(a);
          return type === "string"
            ? ctx.getString(a).slice(0, 512)
            : type === "number"
              ? String(ctx.getNumber(a))
              : type === "undefined"
                ? "undefined"
                : type === "boolean"
                  ? String(ctx.getNumber(a) !== 0)
                  : "[object]";
        })
        .join(" ")
        .slice(0, 1024);
      logs.push(text);
      logChars += text.length;
      return ctx.undefined;
    });
    ctx.setProp(consoleObject, level, method);
    method.dispose();
  }
  ctx.setProp(ctx.global, "console", consoleObject);
  consoleObject.dispose();
  try {
    const compiled = enter(() =>
      ctx.evalCode(
        `${work.code}\n;typeof sleep === "function" ? sleep : undefined;`,
        "solution.js",
      ),
    );
    if (compiled.error) {
      const message = errorText(compiled.error);
      compiled.dispose();
      return result(
        interrupted ? "time-limit-exceeded" : "compile-error",
        interrupted ? "Execution exceeded its CPU budget." : message,
      );
    }
    fn = compiled.value;
    if (ctx.typeof(fn) !== "function")
      return result("runtime-error", "Define a function named sleep.");
    const input = ctx.newNumber(test.millis);
    const started = performance.now();
    const called = enter(() =>
      ctx.callFunction(fn as QuickJSHandle, ctx.undefined, input),
    );
    input.dispose();
    if (called.error) {
      const message = errorText(called.error);
      called.dispose();
      return result(
        interrupted ? "time-limit-exceeded" : "runtime-error",
        interrupted ? "Execution exceeded its CPU budget." : message,
      );
    }
    promise = called.value;
    let first = true;
    while (true) {
      if (fatal)
        return result(
          fatal,
          "A timer callback failed or exceeded its execution budget.",
        );
      if (interrupted || cpu > 250 || jobs > 4096)
        return result(
          "time-limit-exceeded",
          "Execution exceeded its CPU or microtask budget.",
        );
      const elapsed = performance.now() - started;
      if (elapsed > test.millis + 400)
        return result(
          "time-limit-exceeded",
          "The Promise did not settle within the allowed time.",
          Math.round(elapsed),
        );
      const state = enter(() => ctx.getPromiseState(promise as QuickJSHandle));
      if (state.type === "fulfilled") {
        if (state.notAPromise)
          return result("runtime-error", "sleep must return a Promise.");
        state.value.dispose();
        const observed = performance.now() - started;
        if (first || observed < Math.max(0, test.millis - 3))
          return result(
            "wrong-answer",
            "The Promise resolved before the requested delay.",
            Math.round(observed),
          );
        if (observed > test.millis + 250)
          return result(
            "wrong-answer",
            "The Promise resolved too late.",
            Math.round(observed),
          );
        return result(
          "accepted",
          "The Promise settled after the requested delay.",
          Math.round(observed),
        );
      }
      if (state.type === "rejected") {
        const message = errorText(state.error);
        state.error.dispose();
        return result(
          interrupted ? "time-limit-exceeded" : "runtime-error",
          message,
        );
      }
      first = false;
      const pending = enter(() => rt.executePendingJobs(32));
      try {
        if (pending.error)
          return result(
            interrupted ? "time-limit-exceeded" : "runtime-error",
            errorText(pending.error),
          );
        jobs += pending.value ?? 0;
      } finally {
        pending.dispose();
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 1));
    }
  } catch {
    return result(
      interrupted ? "time-limit-exceeded" : "runtime-error",
      "Execution stopped after a resource limit or JavaScript error.",
    );
  } finally {
    closed = true;
    for (const id of [...timers.keys()]) removeTimer(id);
    promise?.dispose();
    fn?.dispose();
    ctx.dispose();
    rt.dispose();
  }
}
const results: CaseResult[] = [];
try {
  for (const test of work.cases) {
    const item = await runCase(test);
    if (test.hidden && !item.passed)
      item.message =
        "A hidden test failed. Check the function for all supported delays.";
    results.push(item);
    if (!item.passed) break;
  }
  parentPort?.postMessage({ cases: results });
} catch {
  parentPort?.postMessage({ error: "Execution could not complete safely." });
}
parentPort?.close();
