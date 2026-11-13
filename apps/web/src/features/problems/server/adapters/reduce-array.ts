import type { ReduceArrayInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Callback protocol and learner-controlled property reads are checked entirely
// within the worker's interruptible guest entry.
export const reduceArrayHarness = `(() => {
  const apply = Reflect.apply;
  const parse = JSON.parse;
  const hasOwn = Object.hasOwn;
  const finite = Number.isFinite;
  const create = Object.create;
  const define = Object.defineProperty;
  const GuestError = Error;
  for (const name of ["reduce", "reduceRight"]) {
    define(Array.prototype, name, {
      value: function() { throw new GuestError("Array.prototype." + name + " is disabled for this exercise."); },
      writable: false, configurable: false
    });
  }
  return (fn, encoded, kind, init) => {
    const input = parse(encoded);
    const original = parse(encoded);
    const answer = (status, actual) => {
      const result = create(null);
      result.status = status;
      if (typeof actual === "number" && finite(actual)) result.actual = actual;
      return result;
    };
    let calls = 0;
    let invalidCall = false;
    let expectedAccumulator = init;
    const callback = (accumulator, current) => {
      const position = calls++;
      if (position >= original.length || accumulator !== expectedAccumulator || current !== original[position]) {
        invalidCall = true;
        return 0;
      }
      if (kind === "sum") expectedAccumulator += current;
      else if (kind === "subtract") expectedAccumulator -= current;
      else if (kind === "max") expectedAccumulator = expectedAccumulator > current ? expectedAccumulator : current;
      else expectedAccumulator += current % 2 === 0 ? 1 : 0;
      return expectedAccumulator;
    };
    const output = apply(fn, undefined, [input, callback, init]);
    if (typeof output !== "number" || !finite(output)) return answer("number");
    if (input.length !== original.length) return answer("input", output);
    for (let i = 0; i < original.length; i++) {
      if (!hasOwn(input, i) || input[i] !== original[i]) return answer("input", output);
    }
    if (invalidCall || calls !== original.length) return answer("calls", output);
    return answer("ok", output);
  };
})()`;

export function judgeReduceArray(
  input: ReduceArrayInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  let expected = input.init;
  for (const value of input.nums) {
    if (input.reducer === "sum") expected += value;
    else if (input.reducer === "subtract") expected -= value;
    else if (input.reducer === "max") expected = Math.max(expected, value);
    else expected += value % 2 === 0 ? 1 : 0;
  }
  const encoded = ctx.newString(JSON.stringify(input.nums));
  const kind = ctx.newString(input.reducer);
  const init = ctx.newNumber(input.init);
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, encoded, kind, init),
    );
    if (checked.error) {
      const message = errorText(checked.error);
      checked.dispose();
      return {
        verdict: exceeded() ? "time-limit-exceeded" : "runtime-error",
        message,
        expected,
      };
    }
    try {
      const statusValue = ctx.getProp(checked.value, "status");
      const status = ctx.getString(statusValue);
      statusValue.dispose();
      const actualValue = ctx.getProp(checked.value, "actual");
      const actual =
        ctx.typeof(actualValue) === "number"
          ? ctx.getNumber(actualValue)
          : undefined;
      actualValue.dispose();
      const messages: Record<string, string> = {
        number: "reduceArray must return a finite number.",
        input: "Leave nums unchanged while accumulating its values.",
        calls:
          "Call fn(accumulator, current) exactly once per item, from left to right, starting with init.",
      };
      const passed = status === "ok" && actual === expected;
      return {
        verdict: passed
          ? "accepted"
          : status === "number"
            ? "runtime-error"
            : "wrong-answer",
        message: passed
          ? "The left-to-right reduction returned the expected accumulator."
          : (messages[status] ??
            "Start with init and return the final callback result."),
        expected,
        ...(actual === undefined ? {} : { actual }),
      };
    } finally {
      checked.dispose();
    }
  } finally {
    encoded.dispose();
    kind.dispose();
    init.dispose();
  }
}
