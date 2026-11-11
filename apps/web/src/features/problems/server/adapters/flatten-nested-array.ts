import { type FlattenInput, MAX_FLATTEN_NODES } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Capture before learner source. All parsing, function calls and learner output
// inspection, including proxies/getters, execute inside the interruptible guest.
export const flattenHarness = `(() => {
  const apply = Reflect.apply;
  const parse = JSON.parse;
  const isArray = Array.isArray;
  const hasOwn = Object.hasOwn;
  const finite = Number.isFinite;
  const integer = Number.isInteger;
  const create = Object.create;
  const define = Object.defineProperty;
  const GuestError = Error;
  for (const name of ["flat", "flatMap"]) {
    define(Array.prototype, name, {
      value: function() { throw new GuestError("Array.prototype." + name + " is disabled for this exercise."); },
      writable: false, configurable: false
    });
  }
  function same(original, current) {
    if (!isArray(original)) return original === current;
    if (!isArray(current) || original.length !== current.length) return false;
    for (let i = 0; i < original.length; i++) {
      if (!same(original[i], current[i])) return false;
    }
    return true;
  }
  return (fn, encoded, limit) => {
    const actual = create(null);
    actual.length = 0;
    const answer = (status) => {
      const result = create(null);
      result.status = status;
      result.actual = actual;
      return result;
    };
    const original = parse(encoded);
    const input = parse(encoded);
    const output = apply(fn, undefined, [input]);
    if (!isArray(output)) return answer("array");
    if (output === input || !same(original, input)) return answer("input");
    const length = output.length;
    if (!integer(length) || length < 0 || length > limit) return answer("size");
    for (let i = 0; i < length; i++) {
      if (!hasOwn(output, i)) return answer("number");
      const value = output[i];
      if (typeof value !== "number" || !finite(value)) return answer("number");
      actual[i] = value;
      actual.length = i + 1;
    }
    return answer("ok");
  };
})()`;

export function judgeFlatten(
  input: FlattenInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  // This is trusted, validated JSON data; learner code never runs in Node.
  const expected = (input.arr as unknown[]).flat(Infinity) as number[];
  const encoded = ctx.newString(JSON.stringify(input.arr));
  const limit = ctx.newNumber(MAX_FLATTEN_NODES);
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, encoded, limit),
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
      const statusHandle = ctx.getProp(checked.value, "status");
      const status = ctx.getString(statusHandle);
      statusHandle.dispose();
      const values = ctx.getProp(checked.value, "actual");
      const actual: number[] = [];
      try {
        const lengthHandle = ctx.getProp(values, "length");
        const length = ctx.getNumber(lengthHandle);
        lengthHandle.dispose();
        // Only a judge-owned null-prototype record of finite numbers escapes.
        for (let i = 0; i < Math.min(length, MAX_FLATTEN_NODES); i++) {
          const value = ctx.getProp(values, i);
          actual.push(ctx.getNumber(value));
          value.dispose();
        }
      } finally {
        values.dispose();
      }
      const messages: Record<string, string> = {
        array: "flatten must return an array.",
        input:
          "Leave the input and nested arrays unchanged, and return a new array.",
        size: "The output exceeds the allowed array size.",
        number:
          "The flattened output must contain only finite numbers, with no nested arrays or holes.",
      };
      const passed =
        status === "ok" &&
        actual.length === expected.length &&
        actual.every((n, i) => n === expected[i]);
      return {
        verdict: passed
          ? "accepted"
          : status === "array"
            ? "runtime-error"
            : "wrong-answer",
        message: passed
          ? "Every number was flattened in its original order."
          : (messages[status] ??
            "Flatten every level while preserving order, duplicates and zero."),
        expected,
        actual,
      };
    } finally {
      checked.dispose();
    }
  } finally {
    encoded.dispose();
    limit.dispose();
  }
}
