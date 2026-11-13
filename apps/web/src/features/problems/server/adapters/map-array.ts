import type { MapArrayInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Learner calls, callbacks, proxies and getters stay in the timed guest. Capture
// every judge intrinsic before evaluating source; export only numeric records.
export const mapArrayHarness = `(() => {
  const apply = Reflect.apply;
  const parse = JSON.parse;
  const isArray = Array.isArray;
  const hasOwn = Object.hasOwn;
  const finite = Number.isFinite;
  const integer = Number.isInteger;
  const create = Object.create;
  const define = Object.defineProperty;
  const GuestError = Error;
  define(Array.prototype, "map", {
    value: function() { throw new GuestError("Array.prototype.map is disabled for this exercise."); },
    writable: false, configurable: false
  });
  return (fn, encoded, kind) => {
    const input = parse(encoded);
    const original = parse(encoded);
    const actual = create(null);
    actual.length = 0;
    const answer = (status) => {
      const result = create(null);
      result.status = status;
      result.actual = actual;
      return result;
    };
    let calls = 0;
    let invalidCall = false;
    const callback = (value, index) => {
      const position = calls++;
      if (position >= original.length || value !== original[position] || index !== position) {
        invalidCall = true;
        return 0;
      }
      if (kind === "double") return value * 2;
      if (kind === "addIndex") return value + index;
      if (kind === "square") return value * value;
      if (kind === "negate") return -value;
      return 0;
    };
    const output = apply(fn, undefined, [input, callback]);
    if (!isArray(output)) return answer("array");
    if (output === input || input.length !== original.length) return answer("input");
    for (let i = 0; i < original.length; i++) {
      if (!hasOwn(input, i) || input[i] !== original[i]) return answer("input");
    }
    const length = output.length;
    if (!integer(length) || length < 0 || length > 1000) return answer("size");
    for (let i = 0; i < length; i++) {
      if (!hasOwn(output, i)) return answer("number");
      const value = output[i];
      if (typeof value !== "number" || !finite(value)) return answer("number");
      actual[i] = value;
      actual.length = i + 1;
    }
    if (invalidCall || calls !== original.length) return answer("calls");
    return answer("ok");
  };
})()`;

export function judgeMapArray(
  input: MapArrayInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected = input.arr.map((value, index) => {
    if (input.transform === "double") return value * 2;
    if (input.transform === "addIndex") return value + index;
    if (input.transform === "square") return value * value;
    if (input.transform === "negate") return -value;
    return 0;
  });
  const encoded = ctx.newString(JSON.stringify(input.arr));
  const kind = ctx.newString(input.transform);
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, encoded, kind),
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
      const values = ctx.getProp(checked.value, "actual");
      const actual: number[] = [];
      try {
        const lengthValue = ctx.getProp(values, "length");
        const length = ctx.getNumber(lengthValue);
        lengthValue.dispose();
        for (let i = 0; i < Math.min(length, 1000); i++) {
          const value = ctx.getProp(values, i);
          actual.push(ctx.getNumber(value));
          value.dispose();
        }
      } finally {
        values.dispose();
      }
      const messages: Record<string, string> = {
        array: "mapArray must return an array.",
        input: "Leave arr unchanged and return a new array.",
        size: "The mapped output exceeds the allowed array size.",
        number: "Return a dense array containing only finite numbers.",
        calls:
          "Call fn(value, index) exactly once per element, in input order.",
      };
      const passed =
        status === "ok" &&
        actual.length === expected.length &&
        actual.every((value, index) => value === expected[index]);
      return {
        verdict: passed
          ? "accepted"
          : status === "array"
            ? "runtime-error"
            : "wrong-answer",
        message: passed
          ? "Every element was transformed with its original index."
          : (messages[status] ?? "Return each callback result in input order."),
        expected,
        actual,
      };
    } finally {
      checked.dispose();
    }
  } finally {
    encoded.dispose();
    kind.dispose();
  }
}
