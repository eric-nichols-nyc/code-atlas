import type { QuickJSHandle } from "quickjs-emscripten";
import { majorityElementHarness } from "./majority-element.js";
import type { CaseOutcome, GuestAccess } from "./types.js";

// The same guest contract as Majority Element: one integer array in, a primitive
// integer out. The timed harness does not inspect or coerce other return types.
export const consecutiveOnesHarness = majorityElementHarness;

export const moveZeroesHarness = `(() => {
  const apply = Reflect.apply;
  const parse = JSON.parse;
  const integer = Number.isInteger;
  const own = Object.hasOwn;
  const descriptor = Object.getOwnPropertyDescriptor;
  const create = Object.create;
  const join = Array.prototype.join;
  return (fn, encoded) => {
    const nums = parse(encoded);
    const length = nums.length;
    const returned = apply(fn, undefined, [nums]);
    if ((returned !== undefined && returned !== nums) || nums.length !== length)
      return undefined;
    const snapshot = create(null);
    snapshot.length = length;
    for (let i = 0; i < length; i++) {
      const item = descriptor(nums, i);
      if (!item || !own(item, "value")) return undefined;
      const value = item.value;
      if (!integer(value) || value < -2147483648 || value > 2147483647)
        return undefined;
      snapshot[i] = value;
    }
    return "[" + apply(join, snapshot, [","]) + "]";
  };
})()`;

type ArrayExercise =
  | "algorithms.move-zeroes"
  | "algorithms.max-consecutive-ones";

export function judgeAlgorithmArray(
  problemId: ArrayExercise,
  nums: number[],
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const move = problemId === "algorithms.move-zeroes";
  let expected: number | number[];
  if (move) {
    const nonzero = nums.filter((value) => value !== 0);
    expected = nonzero.concat(Array(nums.length - nonzero.length).fill(0));
  } else {
    let best = 0;
    let lastZero = -1;
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] === 0) lastZero = i;
      else best = Math.max(best, i - lastZero);
    }
    expected = best;
  }

  const { ctx, fn, enter, errorText, exceeded } = guest;
  const encoded = ctx.newString(JSON.stringify(nums));
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, encoded),
    );
    try {
      if (checked.error) {
        const message = errorText(checked.error);
        return {
          verdict: exceeded() ? "time-limit-exceeded" : "runtime-error",
          message,
          expected,
        };
      }
      if (ctx.typeof(checked.value) !== (move ? "string" : "number"))
        return {
          verdict: "wrong-answer",
          message: move
            ? "Modify the original array without changing its length. Return that array or return nothing."
            : "Return the longest streak as an integer number.",
          expected,
        };
      const actual: number | number[] = move
        ? JSON.parse(ctx.getString(checked.value))
        : ctx.getNumber(checked.value);
      const passed = Array.isArray(actual)
        ? Array.isArray(expected) &&
          actual.length === expected.length &&
          actual.every((value, index) => value === expected[index])
        : actual === expected;
      return {
        verdict: passed ? "accepted" : "wrong-answer",
        message: move
          ? passed
            ? "The zeroes moved to the end in place."
            : "Move every zero to the end and keep nonzero values in their original order."
          : passed
            ? "The longest streak matches."
            : "Return the length of the longest uninterrupted streak of ones.",
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
