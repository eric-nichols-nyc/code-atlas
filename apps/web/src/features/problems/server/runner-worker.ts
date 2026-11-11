import { performance } from "node:perf_hooks";
import { parentPort, workerData } from "node:worker_threads";
import type {
  CaseResult,
  ExecutionAction,
  ProblemInput,
  ProblemOutput,
  Verdict,
} from "@workspace/problems";
import { getQuickJS, type QuickJSHandle } from "quickjs-emscripten";

const curryAdapterPath = import.meta.url.endsWith(".ts")
  ? "./adapters/curry.ts"
  : "./adapters/curry.js";
const { curryHarness, judgeCurry }: typeof import("./adapters/curry.js") =
  await import(curryAdapterPath);
const flattenAdapterPath = import.meta.url.endsWith(".ts")
  ? "./adapters/flatten-nested-array.ts"
  : "./adapters/flatten-nested-array.js";
const {
  flattenHarness,
  judgeFlatten,
}: typeof import("./adapters/flatten-nested-array.js") = await import(
  flattenAdapterPath
);
const debounceAdapterPath = import.meta.url.endsWith(".ts")
  ? "./adapters/debounce.ts"
  : "./adapters/debounce.js";
const filterAdapterPath = import.meta.url.endsWith(".ts")
  ? "./adapters/filter-array.ts"
  : "./adapters/filter-array.js";
const { judgeDebounce }: typeof import("./adapters/debounce.js") = await import(
  debounceAdapterPath
);
const { judgeFilter }: typeof import("./adapters/filter-array.js") =
  await import(filterAdapterPath);
const generatorAdapterPath = import.meta.url.endsWith(".ts")
  ? "./adapters/fibonacci-generator.ts"
  : "./adapters/fibonacci-generator.js";
const {
  generatorHarness,
  judgeGenerator,
}: typeof import("./adapters/fibonacci-generator.js") = await import(
  generatorAdapterPath
);
const promiseDelayAdapterPath = import.meta.url.endsWith(".ts")
  ? "./adapters/delay-each-promise.ts"
  : "./adapters/delay-each-promise.js";
const {
  promiseDelayHarness,
  judgePromiseDelay,
}: typeof import("./adapters/delay-each-promise.js") = await import(
  promiseDelayAdapterPath
);

interface Work {
  problemId: string;
  entryFunction: string;
  code: string;
  action: ExecutionAction;
  cases: {
    id: string;
    input: ProblemInput;
    hidden: boolean;
    independent?: boolean;
  }[];
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
  const virtual =
    work.problemId === "javascript.debounce" ||
    work.problemId === "javascript.delay-the-resolution-of-each-promise";
  let virtualNow = 0;
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
      timer?: ReturnType<typeof setTimeout>;
      due: number;
      callback: QuickJSHandle;
      args: QuickJSHandle[];
    }
  >();
  const logs: string[] = [];
  let logChars = 0;
  let truncated = false;
  let fn: QuickJSHandle | undefined;
  let arrayCheck: QuickJSHandle | undefined;
  let generatorCheck: QuickJSHandle | undefined;
  let promiseDelayCheck: QuickJSHandle | undefined;
  let curryCheck: QuickJSHandle | undefined;
  let flattenCheck: QuickJSHandle | undefined;
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
    output: { expected?: ProblemOutput; actual?: ProblemOutput } = {},
  ): CaseResult => ({
    id: test.id,
    passed: verdict === "accepted",
    verdict,
    message,
    hidden: test.hidden,
    ...(!test.hidden
      ? { input: test.input, elapsedMs, ...output, logs: [...logs] }
      : { logs: [] }),
  });
  function removeTimer(id: number) {
    const t = timers.get(id);
    if (!t) return;
    timers.delete(id);
    if (t.timer) clearTimeout(t.timer);
    t.callback.dispose();
    for (const a of t.args) a.dispose();
  }
  function fireTimer(id: number) {
    const item = timers.get(id);
    if (!item || closed) return;
    timers.delete(id);
    try {
      const result = enter(() =>
        ctx.callFunction(item.callback, ctx.undefined, item.args),
      );
      if (result.error)
        fatal = interrupted ? "time-limit-exceeded" : "runtime-error";
      result.dispose();
    } catch {
      fatal = interrupted ? "time-limit-exceeded" : "runtime-error";
    } finally {
      item.callback.dispose();
      item.args.forEach((arg) => {
        arg.dispose();
      });
    }
  }
  function drainJobs() {
    while (!fatal) {
      const result = enter(() => rt.executePendingJobs(32));
      try {
        if (result.error) {
          fatal = interrupted ? "time-limit-exceeded" : "runtime-error";
          break;
        }
        jobs += result.value ?? 0;
        if (jobs > 4096 || cpu > 250) {
          fatal = "time-limit-exceeded";
          break;
        }
        if ((result.value ?? 0) < 32) break;
      } finally {
        result.dispose();
      }
    }
  }
  function advanceVirtual(target: number, inclusive = true): Verdict | null {
    drainJobs();
    while (!fatal) {
      const next = [...timers.entries()]
        .filter(([, timer]) =>
          inclusive ? timer.due <= target : timer.due < target,
        )
        .sort((a, b) => a[1].due - b[1].due || a[0] - b[0])[0];
      if (!next) break;
      virtualNow = next[1].due;
      fireTimer(next[0]);
      drainJobs();
    }
    if (Number.isFinite(target)) virtualNow = target;
    return fatal;
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
      const item: {
        callback: QuickJSHandle;
        args: QuickJSHandle[];
        due: number;
        timer?: ReturnType<typeof setTimeout>;
      } = {
        callback: callback.dup(),
        args: args.slice(0, 10).map((arg) => arg.dup()),
        due: virtualNow + ms,
      };
      timers.set(id, item);
      if (!virtual) item.timer = setTimeout(() => fireTimer(id), ms);
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
    if (virtual) {
      const date = ctx.getProp(ctx.global, "Date");
      const now = ctx.newFunction("now", () => ctx.newNumber(virtualNow));
      ctx.setProp(date, "now", now);
      now.dispose();
      date.dispose();
    }
    if (work.problemId === "javascript.filter-elements-from-array") {
      const disabled = enter(() =>
        ctx.evalCode(
          'Object.defineProperty(Array.prototype, "filter", { value: function() { throw new Error("Array.prototype.filter is disabled for this exercise."); }, writable: false, configurable: false });',
        ),
      );
      if (disabled.error) {
        const message = errorText(disabled.error);
        disabled.dispose();
        return result("runtime-error", message);
      }
      disabled.dispose();
    }
    const arrayIntrinsic = enter(() =>
      ctx.evalCode("Array.isArray", "judge.js"),
    );
    if (arrayIntrinsic.error) {
      arrayIntrinsic.dispose();
      return result("runtime-error", "The guest could not initialize.");
    }
    arrayCheck = arrayIntrinsic.value;
    if (work.problemId === "javascript.flatten-nested-array") {
      const harness = enter(() => ctx.evalCode(flattenHarness, "judge.js"));
      if (harness.error) {
        harness.dispose();
        return result(
          "runtime-error",
          "The flatten judge could not initialize.",
        );
      }
      flattenCheck = harness.value;
    }
    if (work.problemId === "javascript.curry") {
      const harness = enter(() => ctx.evalCode(curryHarness, "judge.js"));
      if (harness.error) {
        harness.dispose();
        return result("runtime-error", "The curry judge could not initialize.");
      }
      curryCheck = harness.value;
    }
    if (work.problemId === "javascript.delay-the-resolution-of-each-promise") {
      const harness = enter(() =>
        ctx.evalCode(promiseDelayHarness, "judge.js"),
      );
      if (harness.error) {
        harness.dispose();
        return result(
          "runtime-error",
          "The Promise delay judge could not initialize.",
        );
      }
      promiseDelayCheck = harness.value;
    }
    if (work.problemId === "javascript.fibonacci-generator") {
      const harness = enter(() => ctx.evalCode(generatorHarness, "judge.js"));
      if (harness.error) {
        harness.dispose();
        return result(
          "runtime-error",
          "The generator judge could not initialize.",
        );
      }
      generatorCheck = harness.value;
    }
    const compiled = enter(() =>
      ctx.evalCode(
        `${work.code}\n;typeof ${work.entryFunction} === "function" ? ${work.entryFunction} : undefined;`,
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
      return result(
        "runtime-error",
        `Define a function named ${work.entryFunction}.`,
      );
    const guest = {
      ctx,
      fn,
      isArray: arrayCheck,
      enter,
      errorText,
      exceeded: () => interrupted || cpu > 250,
    };
    if (work.problemId === "javascript.flatten-nested-array") {
      if (
        typeof test.input === "number" ||
        !("arr" in test.input) ||
        !flattenCheck
      )
        return result("runtime-error", "Invalid nested-array input.");
      const outcome = judgeFlatten(test.input, guest, flattenCheck);
      return result(outcome.verdict, outcome.message, undefined, outcome);
    }
    if (work.problemId === "javascript.curry") {
      if (
        typeof test.input === "number" ||
        !("groups" in test.input) ||
        !curryCheck
      )
        return result("runtime-error", "Invalid curry input.");
      const outcome = judgeCurry(test.input, guest, curryCheck, test.hidden);
      return result(outcome.verdict, outcome.message, undefined, outcome);
    }
    if (work.problemId === "javascript.delay-the-resolution-of-each-promise") {
      if (
        typeof test.input === "number" ||
        !("ms" in test.input) ||
        !promiseDelayCheck
      )
        return result("runtime-error", "Invalid Promise delay input.");
      const outcome = judgePromiseDelay(
        test.input,
        guest,
        {
          now: () => virtualNow,
          advance: advanceVirtual,
        },
        promiseDelayCheck,
      );
      return result(outcome.verdict, outcome.message, undefined, outcome);
    }
    if (work.problemId === "javascript.fibonacci-generator") {
      if (
        typeof test.input === "number" ||
        !("count" in test.input) ||
        !generatorCheck
      )
        return result("runtime-error", "Invalid generator input.");
      const outcome = judgeGenerator(test.input, guest, generatorCheck);
      return result(outcome.verdict, outcome.message, undefined, outcome);
    }
    if (work.problemId === "javascript.debounce") {
      if (typeof test.input === "number" || !("t" in test.input))
        return result("runtime-error", "Invalid debounce input.");
      const outcome = judgeDebounce(test.input, guest, {
        now: () => virtualNow,
        advance: advanceVirtual,
      });
      return result(outcome.verdict, outcome.message, undefined, outcome);
    }
    if (work.problemId === "javascript.filter-elements-from-array") {
      if (
        typeof test.input === "number" ||
        !("arr" in test.input) ||
        !("predicate" in test.input)
      )
        return result("runtime-error", "Invalid filter input.");
      const outcome = judgeFilter(test.input, guest);
      return result(outcome.verdict, outcome.message, undefined, outcome);
    }
    if (work.problemId === "javascript.counter") {
      if (typeof test.input === "number" || !("n" in test.input))
        return result("runtime-error", "Invalid counter input.");
      const { n, calls } = test.input;
      const expected = Array.from({ length: calls }, (_, i) => n + i);
      const actual: number[] = [];
      const output = () => ({ expected, actual: [...actual] });
      const seed = ctx.newNumber(n);
      const created = enter(() =>
        ctx.callFunction(fn as QuickJSHandle, ctx.undefined, seed),
      );
      seed.dispose();
      if (created.error) {
        const message = errorText(created.error);
        created.dispose();
        return result(
          interrupted ? "time-limit-exceeded" : "runtime-error",
          message,
        );
      }
      const counter = created.value;
      let other: QuickJSHandle | undefined;
      try {
        if (ctx.typeof(counter) !== "function")
          return result(
            "runtime-error",
            "createCounter must return a function.",
          );
        const otherN = n === 1000 ? -1000 : n + 1;
        if (test.independent) {
          const otherSeed = ctx.newNumber(otherN);
          const second = enter(() =>
            ctx.callFunction(fn as QuickJSHandle, ctx.undefined, otherSeed),
          );
          otherSeed.dispose();
          if (second.error) {
            const message = errorText(second.error);
            second.dispose();
            return result(
              interrupted ? "time-limit-exceeded" : "runtime-error",
              message,
            );
          }
          other = second.value;
          if (ctx.typeof(other) !== "function")
            return result("runtime-error", "Each counter must be a function.");
        }
        for (let i = 0; i < calls; i++) {
          const value = enter(() => ctx.callFunction(counter, ctx.undefined));
          if (value.error) {
            const message = errorText(value.error);
            value.dispose();
            return result(
              interrupted ? "time-limit-exceeded" : "runtime-error",
              message,
              undefined,
              { expected },
            );
          }
          const numeric = ctx.typeof(value.value) === "number";
          const observed = numeric ? ctx.getNumber(value.value) : NaN;
          value.dispose();
          if (!Number.isFinite(observed))
            return result(
              "wrong-answer",
              "Every counter call must return a finite number.",
              undefined,
              { expected },
            );
          actual.push(observed);
          if (observed !== n + i)
            return result(
              "wrong-answer",
              "The returned sequence does not match the expected count.",
              undefined,
              output(),
            );
          if (other) {
            const next = enter(() =>
              ctx.callFunction(other as QuickJSHandle, ctx.undefined),
            );
            if (next.error) {
              const message = errorText(next.error);
              next.dispose();
              return result(
                interrupted ? "time-limit-exceeded" : "runtime-error",
                message,
              );
            }
            const independent =
              ctx.typeof(next.value) === "number" &&
              ctx.getNumber(next.value) === otherN + i;
            next.dispose();
            if (!independent)
              return result(
                "wrong-answer",
                "Counters must keep independent state.",
              );
          }
          if (interrupted || cpu > 250)
            return result(
              "time-limit-exceeded",
              "Execution exceeded its CPU budget.",
            );
        }
        return result(
          "accepted",
          "Every counter call returned the expected number.",
          undefined,
          output(),
        );
      } finally {
        other?.dispose();
        counter.dispose();
      }
    }
    if (typeof test.input !== "number")
      return result("runtime-error", "Invalid delay input.");
    const millis = test.input;
    const input = ctx.newNumber(millis);
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
      if (elapsed > millis + 400)
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
        if (first || observed < Math.max(0, millis - 3))
          return result(
            "wrong-answer",
            "The Promise resolved before the requested delay.",
            Math.round(observed),
          );
        if (observed > millis + 250)
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
    arrayCheck?.dispose();
    generatorCheck?.dispose();
    promiseDelayCheck?.dispose();
    curryCheck?.dispose();
    flattenCheck?.dispose();
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
        "A hidden test failed. Check the function for all supported inputs.";
    results.push(item);
    if (!item.passed) break;
  }
  parentPort?.postMessage({ cases: results });
} catch {
  parentPort?.postMessage({ error: "Execution could not complete safely." });
}
parentPort?.close();
