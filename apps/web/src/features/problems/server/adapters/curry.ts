import type { CurryFunction, CurryInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Captured before learner code. Calls, proxies and all learner-controlled behavior
// remain inside one interruptible guest entry. Only primitive diagnostics escape.
export const curryHarness = `(() => {
  const apply = Reflect.apply;
  const finite = Number.isFinite;
  const create = Object.create;
  const parse = JSON.parse;
  const answer = (status, actual) => {
    const result = create(null);
    result.status = status;
    if (typeof actual === "number" && finite(actual)) result.actual = actual;
    return result;
  };
  return (curry, kind, encodedGroups, verifyReuse) => {
    const groups = parse(encodedGroups);
    let calls = 0;
    const callbacks = {
      sum3: function(a, b, c) { calls++; return a + b + c; },
      product4: function(a, b, c, d) { calls++; return a * b * c * d; },
      subtract3: function(a, b, c) { calls++; return a - b - c; },
      identity: function(value) { calls++; return value; },
      constant: function() { calls++; return 42; },
      countArgs: function(a, b, c) { calls++; return arguments.length; }
    };
    const callback = callbacks[kind];
    const arity = callback.length;
    let current = apply(curry, undefined, [callback]);
    if (typeof current !== "function") return answer("function");
    if (calls !== 0) return answer("early");
    let count = 0;
    for (let i = 0; i < groups.length; i++) {
      current = apply(current, undefined, groups[i]);
      count += groups[i].length;
      if (count < arity) {
        if (calls !== 0) return answer("early");
        if (typeof current !== "function") return answer("partial");
      }
    }
    if (typeof current !== "number" || !finite(current)) return answer("number");
    if (calls !== 1) return answer("calls", current);
    if (verifyReuse) {
      // Branches must retain their own argument prefix and callback. These fixed
      // protocol probes are server-only and never returned as hidden diagnostics.
      const combine = function(a, b, c) { return a * 100 + b * 10 + c; };
      const root = apply(curry, undefined, [combine]);
      if (typeof root !== "function") return answer("function");
      const partial = apply(root, undefined, [1]);
      const other = apply(curry, undefined, [function(a, b) { return a - b; }]);
      if (typeof partial !== "function" || typeof other !== "function") return answer("partial");
      const otherPartial = apply(other, undefined, [9]);
      if (typeof otherPartial !== "function") return answer("partial");
      const first = apply(partial, undefined, [2, 3]);
      const second = apply(partial, undefined, [4, 5]);
      const third = apply(root, undefined, [6, 7, 8]);
      const separate = apply(otherPartial, undefined, [4]);
      if (first !== 123 || second !== 145 || third !== 678 || separate !== 5)
        return answer("reuse", current);
    }
    return answer("ok", current);
  };
})()`;

const callbacks: Record<CurryFunction, (args: number[]) => number> = {
  sum3: (a) => (a[0] ?? 0) + (a[1] ?? 0) + (a[2] ?? 0),
  product4: (a) => (a[0] ?? 0) * (a[1] ?? 0) * (a[2] ?? 0) * (a[3] ?? 0),
  subtract3: (a) => (a[0] ?? 0) - (a[1] ?? 0) - (a[2] ?? 0),
  identity: (a) => a[0] ?? 0,
  constant: () => 42,
  countArgs: (a) => a.length,
};

export function judgeCurry(
  input: CurryInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
  verifyReuse: boolean,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected = callbacks[input.fn](input.groups.flat());
  const kind = ctx.newString(input.fn);
  const groups = ctx.newString(JSON.stringify(input.groups));
  try {
    const checked = enter(() =>
      ctx.callFunction(
        harness,
        ctx.undefined,
        fn,
        kind,
        groups,
        verifyReuse ? ctx.true : ctx.false,
      ),
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
        function: "curry must return a function.",
        early: "Wait for enough arguments before invoking fn.",
        partial: "Return another function while arguments are still missing.",
        number: "After enough arguments, return the callback's numeric result.",
        calls: "Invoke fn exactly once when enough arguments have arrived.",
        reuse:
          "Partial applications and separate curried functions must keep independent, reusable state.",
      };
      const passed = status === "ok" && actual === expected;
      return {
        verdict: passed
          ? "accepted"
          : status === "function"
            ? "runtime-error"
            : "wrong-answer",
        message: passed
          ? "The grouped calls returned the expected callback result."
          : (messages[status] ??
            "Collect every argument in its original order and forward extra arguments."),
        expected,
        ...(actual === undefined ? {} : { actual }),
      };
    } finally {
      checked.dispose();
    }
  } finally {
    groups.dispose();
    kind.dispose();
  }
}
