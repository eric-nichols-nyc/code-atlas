import type { TwoDistinctInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Capture intrinsics before learner source. Only primitive integer lengths leave
// the timed guest; learner objects are never coerced, inspected or serialized.
export const twoDistinctHarness = `(() => {
  const apply = Reflect.apply;
  const integer = Number.isInteger;
  return (fn, s) => {
    const output = apply(fn, undefined, [s]);
    return typeof output === "number" && integer(output) ? output : undefined;
  };
})()`;

export function judgeTwoDistinct(
  input: TwoDistinctInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  // Track last positions and evict the least recent letter for the oracle.
  const lastSeen = new Map<string, number>();
  let left = 0;
  let expected = 0;
  for (let right = 0; right < input.s.length; right++) {
    lastSeen.set(input.s[right] as string, right);
    if (lastSeen.size > 2) {
      const oldest = Math.min(...lastSeen.values());
      lastSeen.delete(input.s[oldest] as string);
      left = oldest + 1;
    }
    expected = Math.max(expected, right - left + 1);
  }
  const { ctx, fn, enter, exceeded, errorText } = guest;
  const s = ctx.newString(input.s);
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, s),
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
          message:
            "lengthOfLongestSubstringTwoDistinct must return an integer length.",
          expected,
        };
      const actual = ctx.getNumber(checked.value);
      const passed = actual === expected;
      return {
        verdict: passed ? "accepted" : "wrong-answer",
        message: passed
          ? "The longest valid substring length matches."
          : "Find the longest contiguous window with at most two distinct, case-sensitive characters.",
        expected,
        actual,
      };
    } finally {
      checked.dispose();
    }
  } finally {
    s.dispose();
  }
}
