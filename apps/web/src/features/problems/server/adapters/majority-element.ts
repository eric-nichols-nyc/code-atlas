import type { MajorityElementInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Capture intrinsics before learner source. Only primitive numbers leave the
// timed guest; never coerce or inspect learner-owned objects, getters or proxies.
export const majorityElementHarness = `(() => {
  const apply = Reflect.apply;
  const parse = JSON.parse;
  const integer = Number.isInteger;
  return (fn, encoded) => {
    const output = apply(fn, undefined, [parse(encoded)]);
    return typeof output === "number" && integer(output) ? output : undefined;
  };
})()`;

export function judgeMajorityElement(
  input: MajorityElementInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  // Use a frequency oracle independent of the authored voting solution.
  const counts = new Map<number, number>();
  let expected = input.nums[0] ?? 0;
  for (const value of input.nums) {
    const count = (counts.get(value) ?? 0) + 1;
    counts.set(value, count);
    if (count > input.nums.length / 2) {
      expected = value;
      break;
    }
  }
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const encoded = ctx.newString(JSON.stringify(input.nums));
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, encoded),
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
      if (ctx.typeof(checked.value) !== "number")
        return {
          verdict: "wrong-answer",
          message: "majorityElement must return an integer number.",
          expected,
        };
      const actual = ctx.getNumber(checked.value);
      const passed = actual === expected;
      return {
        verdict: passed ? "accepted" : "wrong-answer",
        message: passed
          ? "The returned value occurs more than half the time."
          : "Return the majority value, rather than its index, count or voting balance.",
        expected,
        actual,
      };
    } finally {
      checked.dispose();
    }
  } finally {
    encoded.dispose();
  }
}
