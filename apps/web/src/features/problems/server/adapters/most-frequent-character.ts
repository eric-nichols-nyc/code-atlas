import type { MostFrequentCharacterInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Capture the intrinsic before learner source. Only a bounded primitive string
// leaves the guest; never coerce objects or inspect learner getters/proxies.
export const mostFrequentCharacterHarness = `(() => {
  const apply = Reflect.apply;
  const parse = JSON.parse;
  const stringify = JSON.stringify;
  return (fn, encoded) => {
    const output = apply(fn, undefined, [parse(encoded)]);
    return typeof output === "string" && output.length <= 2 ? stringify(output) : undefined;
  };
})()`;

export function judgeMostFrequentCharacter(
  input: MostFrequentCharacterInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  // Independent two-pass oracle: final counts, then earliest final occurrence
  // among tied winners. This matches the supplied strict-greater prefix scan.
  const entries = new Map<string, { count: number; last: number }>();
  let position = 0;
  for (const char of input.str) {
    entries.set(char, {
      count: (entries.get(char)?.count ?? 0) + 1,
      last: position++,
    });
  }
  let expected = "";
  let frequency = 0;
  let earliest = Infinity;
  for (const [char, entry] of entries) {
    if (
      entry.count > frequency ||
      (entry.count === frequency && entry.last < earliest)
    ) {
      expected = char;
      frequency = entry.count;
      earliest = entry.last;
    }
  }
  const { ctx, fn, enter, errorText, exceeded } = guest;
  // JSON escaping preserves every JavaScript string across the UTF-8 bridge,
  // including NUL and lone UTF-16 surrogates, without normalizing learner data.
  const value = ctx.newString(JSON.stringify(input.str));
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, value),
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
      if (ctx.typeof(checked.value) !== "string")
        return {
          verdict: "wrong-answer",
          message:
            "findMostFrequentChar must return a primitive character string, or an empty string for empty input.",
          expected,
        };
      const actual: string = JSON.parse(ctx.getString(checked.value));
      const passed = actual === expected;
      return {
        verdict: passed ? "accepted" : "wrong-answer",
        message: passed
          ? "The winning character and tie rule match."
          : "Check character counts and keep the first character to reach the winning count.",
        expected,
        actual,
      };
    } finally {
      checked.dispose();
    }
  } finally {
    value.dispose();
  }
}
