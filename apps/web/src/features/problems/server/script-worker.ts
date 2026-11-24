import { performance } from "node:perf_hooks";
import { setTimeout as wait } from "node:timers/promises";
import { parentPort, workerData } from "node:worker_threads";
import { getQuickJS } from "quickjs-emscripten";
import { createJavaScriptGuest } from "./javascript-guest.js";

export type PlaygroundResult =
  | { status: "finished"; logs: string[] }
  | {
      status: "error" | "time-limit-exceeded";
      logs: string[];
      message: string;
    };

async function runScript(code: string): Promise<PlaygroundResult> {
  const QuickJS = await getQuickJS();
  const guest = createJavaScriptGuest(QuickJS, { drainAfterTimer: true });
  const { ctx, enter, errorText, logs } = guest;
  const deadline = performance.now() + 5_500;
  const failed = (message: string): PlaygroundResult =>
    guest.exceeded() || guest.fatal === "time-limit-exceeded"
      ? {
          status: "time-limit-exceeded",
          message: "The script exceeded its CPU or Promise job limit.",
          logs,
        }
      : { status: "error", message, logs };

  try {
    const setup = guest.initializeConsole();
    try {
      if (setup.error) throw new Error("Console setup failed.");
    } finally {
      setup.dispose();
    }

    const evaluated = enter(() =>
      ctx.evalCode(code, "script.js", { type: "global" }),
    );
    try {
      if (evaluated.error) return failed(errorText(evaluated.error));
      let settled = false;
      while (true) {
        guest.drainJobs();
        if (guest.exceeded() || guest.fatal)
          return failed(guest.asyncError ?? "An asynchronous callback failed.");
        if (!settled) {
          const state = enter(() => ctx.getPromiseState(evaluated.value));
          if (state.type === "rejected") {
            try {
              return failed(errorText(state.error));
            } finally {
              state.error.dispose();
            }
          }
          if (state.type === "fulfilled") {
            if (!state.notAPromise) state.value.dispose();
            settled = true;
          }
        }
        if (performance.now() >= deadline)
          return {
            status: "time-limit-exceeded",
            message: "The script exceeded its time limit.",
            logs,
          };
        if (!guest.hasTimers)
          return settled
            ? { status: "finished", logs }
            : {
                status: "error",
                message:
                  "The final Promise is pending with no work left to run.",
                logs,
              };
        await wait(5);
      }
    } finally {
      evaluated.dispose();
    }
  } finally {
    guest.dispose();
  }
}

try {
  const { code } = workerData as { code: string };
  parentPort?.postMessage({ result: await runScript(code) });
} catch {
  parentPort?.postMessage({ error: "Execution could not complete safely." });
}
parentPort?.close();
