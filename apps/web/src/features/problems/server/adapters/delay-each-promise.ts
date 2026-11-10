import type { PromiseDelayInput, TimedValue } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess, VirtualClock } from "./types.js";

// Capture intrinsics before learner source. Calls, getters, Promise species and
// observers all execute inside the existing timed guest, never through host eval.
export const promiseDelayHarness = `(() => {
  const apply = Reflect.apply;
  const isArray = Array.isArray;
  const define = Object.defineProperty;
  const P = Promise;
  const then = P.prototype.then;
  const timer = setTimeout;
  const E = Error;
  return (delayAll, specs, ms, onStart, onValue, onReject, onInvoke) => {
    const functions = [];
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      define(functions, i, {
        enumerable: true, configurable: true, writable: true,
        value: function() {
          onStart(i);
          return new P(resolve => timer(() => resolve(spec.value), spec.t));
        }
      });
    }
    const wrapped = apply(delayAll, undefined, [functions, ms]);
    if (!isArray(wrapped) || wrapped.length !== specs.length)
      throw new E("delayAll must return an array with one wrapper per input function.");
    for (let i = 0; i < specs.length; i++) {
      const wrapper = wrapped[i];
      if (typeof wrapper !== "function")
        throw new E("Every returned item must be a function.");
      onInvoke(i);
      const promise = apply(wrapper, undefined, []);
      onInvoke(-1);
      apply(then, promise, [value => onValue(i, value), () => onReject()]);
    }
  };
})()`;

export function judgePromiseDelay(
  input: PromiseDelayInput,
  guest: GuestAccess,
  clock: VirtualClock,
  harness: QuickJSHandle,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected = input.functions.map(({ t, value }) => ({
    t: t + input.ms,
    value,
  }));
  const actual: (TimedValue | undefined)[] = input.functions.map(
    () => undefined,
  );
  const starts = input.functions.map(() => 0);
  let invoking = -1;
  let invalidStart = false;
  let invalidValue = false;
  let rejected = false;
  const observed = () =>
    actual.filter((item): item is TimedValue => item !== undefined);
  const outcome = (
    verdict: CaseOutcome["verdict"],
    message: string,
  ): CaseOutcome => ({
    verdict,
    message,
    expected,
    actual: observed(),
  });
  // Validated numeric literals create own properties without learner setters.
  const specs = enter(() =>
    ctx.evalCode(`(${JSON.stringify(input.functions)})`, "inputs.js"),
  );
  if (specs.error) {
    specs.dispose();
    return outcome(
      exceeded() ? "time-limit-exceeded" : "runtime-error",
      "The function descriptors could not be initialized.",
    );
  }
  const delay = ctx.newNumber(input.ms);
  const onInvoke = ctx.newFunction("beginInvocation", (index) => {
    invoking = ctx.getNumber(index);
    return ctx.undefined;
  });
  const onStart = ctx.newFunction("recordStart", (index) => {
    const i = ctx.getNumber(index);
    if (!Number.isInteger(i) || i < 0 || i >= starts.length) {
      invalidStart = true;
      return ctx.undefined;
    }
    starts[i] = (starts[i] ?? 0) + 1;
    if (invoking !== i || clock.now() !== 0 || starts[i] !== 1)
      invalidStart = true;
    return ctx.undefined;
  });
  const onValue = ctx.newFunction("recordFulfillment", (index, value) => {
    const i = ctx.getNumber(index);
    const numeric =
      value && ctx.typeof(value) === "number" ? ctx.getNumber(value) : NaN;
    if (
      !Number.isInteger(i) ||
      i < 0 ||
      i >= actual.length ||
      !Number.isFinite(numeric) ||
      actual[i] !== undefined
    ) {
      invalidValue = true;
      return ctx.undefined;
    }
    actual[i] = { t: clock.now(), value: numeric };
    return ctx.undefined;
  });
  const onReject = ctx.newFunction("recordRejection", () => {
    rejected = true;
    return ctx.undefined;
  });
  try {
    const called = enter(() =>
      ctx.callFunction(
        harness,
        ctx.undefined,
        fn,
        specs.value,
        delay,
        onStart,
        onValue,
        onReject,
        onInvoke,
      ),
    );
    invoking = -1;
    if (called.error) {
      const message = errorText(called.error);
      called.dispose();
      return outcome(
        exceeded() ? "time-limit-exceeded" : "runtime-error",
        message,
      );
    }
    called.dispose();
    const fatal = clock.advance(Infinity);
    if (fatal)
      return outcome(
        fatal,
        "A callback or microtask failed or exceeded its execution budget.",
      );
    if (rejected)
      return outcome(
        "runtime-error",
        "A wrapped promise rejected; the supplied input functions always fulfill.",
      );
    if (invalidStart || starts.some((count) => count !== 1))
      return outcome(
        "wrong-answer",
        "Call each original exactly once, immediately inside its wrapper.",
      );
    if (invalidValue)
      return outcome(
        "wrong-answer",
        "Preserve each finite numeric fulfillment value.",
      );
    if (actual.some((item) => item === undefined))
      return outcome(
        "time-limit-exceeded",
        "A wrapped promise did not fulfill within the timer schedule.",
      );
    const passed = actual.every(
      (item, i) =>
        item?.t === expected[i]?.t && item?.value === expected[i]?.value,
    );
    return outcome(
      passed ? "accepted" : "wrong-answer",
      passed
        ? "Each wrapper preserved its value and added the requested fulfillment delay."
        : "The fulfillment times or values do not match the expected results.",
    );
  } finally {
    specs.dispose();
    delay.dispose();
    onInvoke.dispose();
    onStart.dispose();
    onValue.dispose();
    onReject.dispose();
  }
}
