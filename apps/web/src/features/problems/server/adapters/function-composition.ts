import type {
  CompositionFunction,
  CompositionInput,
} from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Install before learner source. Every callback, proxy and result inspection stays
// inside the interruptible guest; only judge-owned finite primitives leave it.
export const compositionHarness = `(() => {
  const apply = Reflect.apply;
  const finite = Number.isFinite;
  const create = Object.create;
  const define = Object.defineProperty;
  const hasOwn = Object.hasOwn;
  const parse = JSON.parse;
  const answer = (status, actual) => {
    const result = create(null);
    result.status = status;
    if (typeof actual === "number" && finite(actual)) result.actual = actual;
    return result;
  };
  function pipeline(compose, callbacks) {
    let count = 0;
    const trace = create(null);
    const functions = [];
    const original = create(null);
    for (let i = 0; i < callbacks.length; i++) {
      const callback = callbacks[i];
      const wrapped = function(value) {
        trace[count++] = i;
        return callback(value);
      };
      original[i] = wrapped;
      define(functions, i, { configurable: true, writable: true, value: wrapped });
    }
    const unchanged = () => {
      if (functions.length !== callbacks.length) return false;
      for (let i = 0; i < callbacks.length; i++) {
        if (!hasOwn(functions, i) || functions[i] !== original[i]) return false;
      }
      return true;
    };
    const composed = apply(compose, undefined, [functions]);
    if (typeof composed !== "function") return { status: "function" };
    if (count !== 0) return { status: "early" };
    if (!unchanged()) return { status: "input" };
    return { invoke: (value) => {
      count = 0;
      const result = apply(composed, undefined, [value]);
      if (typeof result !== "number" || !finite(result)) return answer("number");
      if (!unchanged()) return answer("input", result);
      if (count !== callbacks.length) return answer("calls", result);
      for (let i = 0; i < count; i++) {
        if (trace[i] !== callbacks.length - 1 - i) return answer("order", result);
      }
      return answer("ok", result);
    }};
  }
  return (compose, encoded) => {
    const input = parse(encoded);
    const callbacks = [];
    for (let i = 0; i < input.functions.length; i++) {
      let callback;
      if (input.functions[i] === "addOne") callback = (value) => value + 1;
      else if (input.functions[i] === "double") callback = (value) => value * 2;
      else callback = (value) => -value;
      define(callbacks, i, { value: callback });
    }
    const main = pipeline(compose, callbacks);
    if (!main.invoke) return answer(main.status);
    const actual = main.invoke(input.x);
    if (actual.status !== "ok") return actual;
    // The returned function must be reusable, and composition must be generic.
    const repeat = main.invoke(input.x);
    if (repeat.status !== "ok" || repeat.actual !== actual.actual) return answer("reuse", actual.actual);
    const first = pipeline(compose, [(value) => value * 3 + 7, (value) => value - 4]);
    const second = pipeline(compose, [(value) => value * value - 2]);
    if (!first.invoke || !second.invoke) return answer("reuse", actual.actual);
    const a = first.invoke(5), b = second.invoke(5), c = first.invoke(-2);
    if (a.status !== "ok" || a.actual !== 10 || b.status !== "ok" || b.actual !== 23 || c.status !== "ok" || c.actual !== -11)
      return answer("reuse", actual.actual);
    const again = main.invoke(input.x);
    if (again.status !== "ok" || again.actual !== actual.actual) return answer("reuse", actual.actual);
    return actual;
  };
})()`;

const callbacks: Record<CompositionFunction, (value: number) => number> = {
  addOne: (value) => value + 1,
  double: (value) => value * 2,
  negate: (value) => -value,
};

export function judgeComposition(
  input: CompositionInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected = input.functions.reduceRight(
    (value, id) => callbacks[id](value),
    input.x,
  );
  const encoded = ctx.newString(JSON.stringify(input));
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
      const statusValue = ctx.getProp(checked.value, "status");
      const status = ctx.getString(statusValue);
      statusValue.dispose();
      const actualValue = ctx.getProp(checked.value, "actual");
      const actual =
        ctx.typeof(actualValue) === "number"
          ? ctx.getNumber(actualValue)
          : undefined;
      actualValue.dispose();
      const messages: Record<string, string> = {
        function: "compose must return a function.",
        early: "Do not invoke callbacks until the composed function is called.",
        input: "Leave the supplied function list unchanged.",
        number: "Return the pipeline's finite numeric result.",
        calls: "Invoke each supplied function exactly once per composed call.",
        order: "Apply the supplied functions from right to left.",
        reuse:
          "Composed functions must work generically and remain independent and reusable.",
      };
      const passed = status === "ok" && actual === expected;
      return {
        verdict: passed
          ? "accepted"
          : status === "function"
            ? "runtime-error"
            : "wrong-answer",
        message: passed
          ? "The functions were composed from right to left."
          : (messages[status] ??
            "Apply every function from right to left and return the final value."),
        expected,
        ...(actual === undefined ? {} : { actual }),
      };
    } finally {
      checked.dispose();
    }
  } finally {
    encoded.dispose();
  }
}
