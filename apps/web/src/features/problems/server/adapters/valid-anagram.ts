import type { AnagramInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Capture the call intrinsic before evaluating learner source. Return only a
// primitive status: never inspect, coerce, or serialize learner-owned objects.
export const anagramHarness = `(() => {
  const apply = Reflect.apply;
  return (fn, s, t) => {
    const output = apply(fn, undefined, [s, t]);
    return typeof output === "boolean" ? (output ? 1 : 0) : -1;
  };
})()`;

export function judgeAnagram(
  input: AnagramInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const counts = new Int32Array(26);
  for (const char of input.s) {
    const index = char.charCodeAt(0) - 97;
    counts[index] = (counts[index] ?? 0) + 1;
  }
  for (const char of input.t) {
    const index = char.charCodeAt(0) - 97;
    counts[index] = (counts[index] ?? 0) - 1;
  }
  const expected =
    input.s.length === input.t.length && counts.every((count) => count === 0);
  const { ctx, fn, enter, exceeded, errorText } = guest;
  const s = ctx.newString(input.s);
  const t = ctx.newString(input.t);
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, s, t),
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
      const status = ctx.getNumber(checked.value);
      if (status !== 0 && status !== 1)
        return {
          verdict: "wrong-answer",
          message: "isAnagram must return a boolean.",
          expected,
        };
      const actual = status === 1;
      return {
        verdict: actual === expected ? "accepted" : "wrong-answer",
        message:
          actual === expected
            ? "The character counts match the expected result."
            : "Check every character's count, including repeated letters.",
        expected,
        actual,
      };
    } finally {
      checked.dispose();
    }
  } finally {
    s.dispose();
    t.dispose();
  }
}
