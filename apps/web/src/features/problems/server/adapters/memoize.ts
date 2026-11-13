import type {
  MemoizeFunction,
  MemoizeInput,
  MemoizeOutput,
} from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Parse, invoke and inspect within the guest budget. Native code reads only
// bounded null-prototype records containing primitive output and call counts.
export const memoizeHarness = `(() => {
  const apply = Reflect.apply;
  const finite = Number.isFinite;
  const create = Object.create;
  const parse = JSON.parse;
  const GuestError = Error;
  const answer = (status, values, callCount) => {
    const result = create(null);
    result.status = status;
    const actual = create(null);
    actual.values = values;
    actual.callCount = callCount;
    result.actual = actual;
    return result;
  };
  return (memoize, encoded) => {
    const input = parse(encoded);
    let count = 0;
    let invalidArguments = false;
    let currentArgs;
    const callback = function() {
      count++;
      if (count > 110) throw new GuestError("Too many underlying callback invocations.");
      if (!currentArgs || arguments.length !== currentArgs.length) invalidArguments = true;
      for (let i = 0; i < arguments.length; i++) {
        if (!currentArgs || arguments[i] !== currentArgs[i]) invalidArguments = true;
        if (typeof arguments[i] !== "number" || !finite(arguments[i])) return NaN;
      }
      if (input.fn === "subtract") return arguments[0] - arguments[1];
      let value = input.fn === "product" ? 1 : 0;
      for (let i = 0; i < arguments.length; i++) {
        value = input.fn === "product" ? value * arguments[i] : value + arguments[i];
      }
      return value;
    };
    const values = create(null);
    values.length = 0;
    const memoized = apply(memoize, undefined, [callback]);
    if (typeof memoized !== "function") return answer("function", values, count);
    if (count !== 0) return answer("early", values, count);
    const seen = create(null);
    let distinct = 0;
    for (let i = 0; i < input.calls.length; i++) {
      currentArgs = input.calls[i];
      let key = currentArgs.length + ":";
      for (let j = 0; j < currentArgs.length; j++) key += currentArgs[j] + ",";
      if (!seen[key]) { seen[key] = true; distinct++; }
      const value = apply(memoized, undefined, currentArgs);
      if (typeof value !== "number" || !finite(value)) return answer("number", values, count);
      values[i] = value;
      values.length = i + 1;
      if (invalidArguments) return answer("arguments", values, count);
      if (count !== distinct) return answer("calls", values, count);
    }
    // Private protocol probes reject a shared cache, falsy cache misses, and
    // string-concatenation keys without revealing their inputs in diagnostics.
    let sharedCalls = 0;
    const shared = function(a, b) { sharedCalls++; return a - b; };
    const first = apply(memoize, undefined, [shared]);
    const second = apply(memoize, undefined, [shared]);
    if (typeof first !== "function" || typeof second !== "function") return answer("reuse", values, count);
    if (apply(first, undefined, [2, 2]) !== 0 || apply(first, undefined, [2, 2]) !== 0 || apply(second, undefined, [2, 2]) !== 0 || apply(second, undefined, [2, 2]) !== 0 || sharedCalls !== 2)
      return answer("reuse", values, count);
    let otherCalls = 0;
    const other = apply(memoize, undefined, [function(a, b) { otherCalls++; return a * 10 + b; }]);
    if (typeof other !== "function" || apply(other, undefined, [2, 2]) !== 22 || apply(other, undefined, [2, 2]) !== 22 || otherCalls !== 1)
      return answer("reuse", values, count);
    let genericCalls = 0;
    const generic = apply(memoize, undefined, [function() {
      genericCalls++;
      let value = arguments.length * 1000;
      for (let i = 0; i < arguments.length; i++) value += arguments[i] * (i + 1);
      return value;
    }]);
    if (typeof generic !== "function") return answer("reuse", values, count);
    const groups = [[1, 23], [12, 3], [], [0], [0, 0], [1, 23], []];
    const expected = [2047, 2018, 0, 1000, 2000, 2047, 0];
    for (let i = 0; i < groups.length; i++) {
      if (apply(generic, undefined, groups[i]) !== expected[i]) return answer("reuse", values, count);
    }
    if (genericCalls !== 5) return answer("reuse", values, count);
    return answer("ok", values, count);
  };
})()`;

const callbacks: Record<MemoizeFunction, (args: number[]) => number> = {
  sum: (args) => args.reduce((value, arg) => value + arg, 0),
  product: (args) => args.reduce((value, arg) => value * arg, 1),
  subtract: (args) => (args[0] ?? 0) - (args[1] ?? 0),
};
function expectedMemoize(input: MemoizeInput): MemoizeOutput {
  const cache = new Map<string, number>();
  const values = input.calls.map((args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, callbacks[input.fn](args));
    return cache.get(key) ?? 0;
  });
  return { values, callCount: cache.size };
}

export function judgeMemoize(
  input: MemoizeInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected = expectedMemoize(input);
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
      const output = ctx.getProp(checked.value, "actual");
      const values: number[] = [];
      let callCount: number;
      try {
        const list = ctx.getProp(output, "values");
        try {
          const lengthValue = ctx.getProp(list, "length");
          const length = ctx.getNumber(lengthValue);
          lengthValue.dispose();
          for (let i = 0; i < Math.min(length, 100); i++) {
            const value = ctx.getProp(list, i);
            values.push(ctx.getNumber(value));
            value.dispose();
          }
        } finally {
          list.dispose();
        }
        const countValue = ctx.getProp(output, "callCount");
        callCount = ctx.getNumber(countValue);
        countValue.dispose();
      } finally {
        output.dispose();
      }
      const actual = { values, callCount };
      const passed =
        status === "ok" &&
        callCount === expected.callCount &&
        values.length === expected.values.length &&
        values.every((value, index) => value === expected.values[index]);
      const messages: Record<string, string> = {
        function: "memoize must return a function.",
        early:
          "Call fn only when the returned function receives an uncached argument list.",
        number: "Return the underlying callback's finite numeric value.",
        arguments:
          "Forward every original argument to fn in its original order.",
        calls:
          "Call fn once per distinct ordered argument list; reuse cached values, including zero.",
        reuse:
          "Cache arbitrary callbacks correctly and keep separate memoized functions independent.",
      };
      return {
        verdict: passed
          ? "accepted"
          : status === "function"
            ? "runtime-error"
            : "wrong-answer",
        message: passed
          ? "Repeated argument lists reused their cached results."
          : (messages[status] ??
            "Preserve callback results and cache identical argument lists."),
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
