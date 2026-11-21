import { threadCpuUsage } from "node:process";
import type { QuickJSHandle, QuickJSWASMModule } from "quickjs-emscripten";
import { consoleHarness } from "./console-harness.js";

type AsyncFailure = "time-limit-exceeded" | "runtime-error";

function threadCpuMilliseconds(start: ReturnType<typeof threadCpuUsage>) {
  const { user, system } = threadCpuUsage(start);
  return (user + system) / 1000;
}

export function createJavaScriptGuest(
  QuickJS: QuickJSWASMModule,
  { entryCpuBudgetMs = 100, virtual = false, drainAfterTimer = false } = {},
) {
  const rt = QuickJS.newRuntime();
  rt.setMemoryLimit(16 * 1024 * 1024);
  rt.setMaxStackSize(256 * 1024);
  let entryStart: ReturnType<typeof threadCpuUsage> | undefined;
  let cpu = 0;
  let interrupted = false;
  let closed = false;
  let registrations = 0;
  let jobs = 0;
  let fatal: AsyncFailure | null = null;
  let asyncError: string | undefined;
  let virtualNow = 0;
  rt.setInterruptHandler(() => {
    const entryCpu = entryStart ? threadCpuMilliseconds(entryStart) : 0;
    if (entryCpu > entryCpuBudgetMs || cpu + entryCpu > 250) {
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
  const exceeded = () => interrupted || cpu > 250;
  function markTruncated() {
    if (truncated) return;
    logs.push("Console output truncated.");
    truncated = true;
  }
  const enter = <T>(call: () => T): T => {
    const start = threadCpuUsage();
    entryStart = start;
    try {
      return call();
    } finally {
      cpu += threadCpuMilliseconds(start);
      entryStart = undefined;
    }
  };
  const errorText = (error: QuickJSHandle) => {
    try {
      return enter(() => {
        if (ctx.typeof(error) === "string")
          return ctx.getString(error).slice(0, 300);
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
    if (!item || closed || (drainAfterTimer && fatal)) return;
    timers.delete(id);
    try {
      const result = enter(() =>
        ctx.callFunction(item.callback, ctx.undefined, item.args),
      );
      if (result.error) {
        fatal = interrupted ? "time-limit-exceeded" : "runtime-error";
        if (drainAfterTimer && fatal === "runtime-error")
          asyncError = errorText(result.error);
      }
      result.dispose();
    } catch {
      fatal = interrupted ? "time-limit-exceeded" : "runtime-error";
    } finally {
      item.callback.dispose();
      item.args.forEach((arg) => {
        arg.dispose();
      });
    }
    if (drainAfterTimer) drainJobs();
  }
  function executePendingJobs() {
    const result = enter(() =>
      rt.executePendingJobs(Math.min(32, 4096 - jobs)),
    );
    if (!result.error) jobs += result.value ?? 0;
    return result;
  }
  function drainJobs() {
    while (!fatal && rt.hasPendingJob()) {
      if (jobs >= 4096 || exceeded()) {
        fatal = "time-limit-exceeded";
        return;
      }
      const result = executePendingJobs();
      try {
        if (result.error) {
          fatal = exceeded() ? "time-limit-exceeded" : "runtime-error";
          if (drainAfterTimer && fatal === "runtime-error")
            asyncError = errorText(result.error);
        }
      } finally {
        result.dispose();
      }
    }
  }
  function advanceVirtual(
    target: number,
    inclusive = true,
  ): AsyncFailure | null {
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
        markTruncated();
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
      const remaining = 8192 - logChars;
      const line = text.slice(0, remaining);
      logs.push(line);
      logChars += line.length;
      if (text.length > remaining) markTruncated();
      return ctx.undefined;
    });
    ctx.setProp(consoleObject, level, method);
    method.dispose();
  }
  ctx.setProp(ctx.global, "console", consoleObject);
  consoleObject.dispose();

  return {
    ctx,
    logs,
    enter,
    errorText,
    exceeded,
    executePendingJobs,
    drainJobs,
    advanceVirtual,
    get interrupted() {
      return interrupted;
    },
    get jobLimitReached() {
      return jobs >= 4096 && rt.hasPendingJob();
    },
    get fatal() {
      return fatal;
    },
    get asyncError() {
      return asyncError;
    },
    get virtualNow() {
      return virtualNow;
    },
    get hasTimers() {
      return timers.size > 0;
    },
    initializeConsole: () => enter(() => ctx.evalCode(consoleHarness)),
    dispose() {
      closed = true;
      for (const id of [...timers.keys()]) removeTimer(id);
      ctx.dispose();
      rt.dispose();
    },
  };
}
