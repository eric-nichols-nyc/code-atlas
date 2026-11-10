import type { GeneratorInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Compile before learner source so intrinsic references cannot be replaced.
// All iterator getters, calls and result inspection stay inside the timed guest.
export const generatorHarness = `(() => {
  const apply = Reflect.apply;
  const create = Object.create;
  const finite = Number.isFinite;
  const iteratorKey = Symbol.iterator;
  return (fn, count) => {
    const actual = create(null);
    actual.length = 0;
    const first = apply(fn, undefined, []);
    const second = apply(fn, undefined, []);
    const valid = (iterator) => iterator !== null && typeof iterator === "object"
      && typeof iterator.next === "function"
      && typeof iterator[iteratorKey] === "function"
      && apply(iterator[iteratorKey], iterator, []) === iterator;
    if (!valid(first) || !valid(second)) return { status: "iterator", actual };
    if (first === second) return { status: "independent", actual };
    const next = first.next;
    const otherNext = second.next;
    for (let i = 0; i < count; i++) {
      const step = apply(next, first, []);
      if (step === null || typeof step !== "object" || step.done !== false)
        return { status: "ended", actual };
      const value = step.value;
      if (!finite(value)) return { status: "number", actual };
      actual[i] = value;
      actual.length = i + 1;
      const other = apply(otherNext, second, []);
      if (other === null || typeof other !== "object"
        || other.done !== false || other.value !== value)
        return { status: "independent", actual };
    }
    return { status: "ok", actual };
  };
})()`;

export function judgeGenerator(
  input: GeneratorInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected: number[] = [];
  let current = 0;
  let next = 1;
  for (let i = 0; i < input.count; i++) {
    expected.push(current);
    [current, next] = [next, current + next];
  }
  const count = ctx.newNumber(input.count);
  const checked = enter(() =>
    ctx.callFunction(harness, ctx.undefined, fn, count),
  );
  count.dispose();
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
      // The harness returns only a bounded, null-prototype numeric record.
      for (let i = 0; i < Math.min(length, input.count); i++) {
        const value = ctx.getProp(values, i);
        actual.push(ctx.getNumber(value));
        value.dispose();
      }
    } finally {
      values.dispose();
    }
    const messages: Record<string, string> = {
      iterator:
        "fibonacciGenerator must return a synchronous iterable iterator.",
      independent: "Each generator must keep independent state.",
      ended: "Keep yielding values with done equal to false.",
      number: "Each yielded value must be a finite number.",
    };
    const passed =
      status === "ok" &&
      actual.length === expected.length &&
      actual.every((n, i) => n === expected[i]);
    return {
      verdict: passed
        ? "accepted"
        : status === "iterator"
          ? "runtime-error"
          : "wrong-answer",
      message: passed
        ? "Every .next() call yielded the expected Fibonacci number."
        : (messages[status] ??
          "The yielded sequence does not match the Fibonacci sequence."),
      expected,
      actual,
    };
  } finally {
    checked.dispose();
  }
}
