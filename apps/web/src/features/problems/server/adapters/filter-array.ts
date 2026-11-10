import {
  type FilterInput,
  type FilterPredicate,
  filterPredicates,
} from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

const predicates: Record<FilterPredicate, (n: number, i: number) => unknown> = {
  greaterThan10: (n) => n > 10,
  firstIndex: (_n, i) => i === 0,
  plusOne: (n) => n + 1,
  evenIndex: (_n, i) => i % 2 === 0,
  isPositive: (n) => n > 0,
  isTruthy: (n) => n,
  alwaysFalse: () => false,
};
export function judgeFilter(
  input: FilterInput,
  guest: GuestAccess,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected = input.arr.filter((n, i) =>
    Boolean(predicates[input.predicate](n, i)),
  );
  const spec = filterPredicates.find((item) => item.id === input.predicate);
  if (!spec)
    return { verdict: "runtime-error", message: "Callback unavailable." };
  const predicate = enter(() => ctx.evalCode(`(${spec.code})`, "callback.js"));
  if (predicate.error) {
    const message = errorText(predicate.error);
    predicate.dispose();
    return { verdict: "runtime-error", message };
  }
  const array = ctx.newArray();
  try {
    input.arr.forEach((n, i) => {
      const value = ctx.newNumber(n);
      ctx.setProp(array, i, value);
      value.dispose();
    });
    const evaluated = enter(() =>
      ctx.callFunction(fn, ctx.undefined, array, predicate.value),
    );
    if (evaluated.error) {
      const message = errorText(evaluated.error);
      evaluated.dispose();
      return {
        verdict: exceeded() ? "time-limit-exceeded" : "runtime-error",
        message,
        expected,
      };
    }
    const output = evaluated.value;
    try {
      const checked = enter(() =>
        ctx.callFunction(guest.isArray, ctx.undefined, output),
      );
      if (checked.error) {
        checked.dispose();
        return {
          verdict: exceeded() ? "time-limit-exceeded" : "runtime-error",
          message: "The array result could not be inspected.",
        };
      }
      const isArray = Boolean(ctx.dump(checked.value));
      checked.dispose();
      if (!isArray)
        return {
          verdict: "runtime-error",
          message: "filter must return an array.",
          expected,
        };
      const size = enter(() => ctx.getProp(output, "length"));
      const length = ctx.getNumber(size);
      size.dispose();
      if (exceeded())
        return {
          verdict: "time-limit-exceeded",
          message: "Inspecting the output exceeded the execution budget.",
          expected,
        };
      if (!Number.isInteger(length) || length < 0 || length > 1000)
        return {
          verdict: "wrong-answer",
          message: "The output array exceeds the allowed size.",
          expected,
        };
      const actual: number[] = [];
      for (let i = 0; i < length; i++) {
        const value: QuickJSHandle = enter(() => ctx.getProp(output, i));
        const n = ctx.typeof(value) === "number" ? ctx.getNumber(value) : NaN;
        value.dispose();
        if (exceeded())
          return {
            verdict: "time-limit-exceeded",
            message: "Inspecting the output exceeded the execution budget.",
            expected,
          };
        if (!Number.isFinite(n))
          return {
            verdict: "wrong-answer",
            message: "Return original numeric elements, not callback results.",
            expected,
          };
        actual.push(n);
      }
      const passed =
        actual.length === expected.length &&
        actual.every((n, i) => n === expected[i]);
      return {
        verdict: passed ? "accepted" : "wrong-answer",
        message: passed
          ? "The original elements were filtered in the correct order."
          : "The filtered array does not match the expected elements.",
        expected,
        actual,
      };
    } finally {
      output.dispose();
    }
  } finally {
    array.dispose();
    predicate.dispose();
  }
}
