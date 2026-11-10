import type { DebounceCall, DebounceInput } from "@workspace/problems";
import type { CaseOutcome, GuestAccess, VirtualClock } from "./types.js";

function expectedCalls(input: DebounceInput): DebounceCall[] {
  const result: DebounceCall[] = [];
  let pending: DebounceCall | undefined;
  for (const call of [...input.calls].sort((a, b) => a.t - b.t)) {
    if (pending && pending.t < call.t) result.push(pending);
    pending = { t: call.t + input.t, inputs: [...call.inputs] };
  }
  if (pending) result.push(pending);
  return result;
}
export function judgeDebounce(
  input: DebounceInput,
  guest: GuestAccess,
  clock: VirtualClock,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected = expectedCalls(input);
  const actual: DebounceCall[] = [];
  let invalid = false;
  const callback = ctx.newFunction("record", (...args) => {
    if (actual.length >= 128)
      throw new Error("Callback output limit exceeded.");
    const values = args.map((arg) =>
      ctx.typeof(arg) === "number" ? ctx.getNumber(arg) : NaN,
    );
    if (values.length > 10 || !values.every(Number.isFinite)) {
      invalid = true;
      return ctx.undefined;
    }
    actual.push({ t: clock.now(), inputs: values });
    return ctx.undefined;
  });
  const delay = ctx.newNumber(input.t);
  try {
    const created = enter(() =>
      ctx.callFunction(fn, ctx.undefined, callback, delay),
    );
    if (created.error) {
      const message = errorText(created.error);
      created.dispose();
      return {
        verdict: exceeded() ? "time-limit-exceeded" : "runtime-error",
        message,
        expected,
      };
    }
    const debounced = created.value;
    try {
      if (ctx.typeof(debounced) !== "function")
        return {
          verdict: "runtime-error",
          message: "debounce must return a function.",
          expected,
        };
      const calls = [...input.calls].sort((a, b) => a.t - b.t);
      for (let i = 0; i < calls.length; i++) {
        const call = calls[i];
        if (!call) continue;
        const before = clock.advance(call.t, false);
        if (before)
          return {
            verdict: before,
            message: "A scheduled callback exceeded its budget or failed.",
            expected,
          };
        const args = call.inputs.map((n) => ctx.newNumber(n));
        try {
          const result = enter(() =>
            ctx.callFunction(debounced, ctx.undefined, args),
          );
          if (result.error) {
            const message = errorText(result.error);
            result.dispose();
            return {
              verdict: exceeded() ? "time-limit-exceeded" : "runtime-error",
              message,
              expected,
            };
          }
          result.dispose();
        } finally {
          args.forEach((arg) => {
            arg.dispose();
          });
        }
        if (calls[i + 1]?.t !== call.t) {
          const after = clock.advance(call.t);
          if (after)
            return {
              verdict: after,
              message: "A scheduled callback exceeded its budget or failed.",
              expected,
            };
        }
      }
      const final = clock.advance(Infinity);
      if (final)
        return {
          verdict: final,
          message:
            "The timer or microtask budget was exceeded, or a callback failed.",
          expected,
        };
      const passed =
        !invalid && JSON.stringify(actual) === JSON.stringify(expected);
      return {
        verdict: passed ? "accepted" : "wrong-answer",
        message: passed
          ? "Callbacks ran at the expected times with the latest arguments."
          : "Callback times or forwarded arguments do not match the expected schedule.",
        expected,
        actual,
      };
    } finally {
      debounced.dispose();
    }
  } finally {
    delay.dispose();
    callback.dispose();
  }
}
