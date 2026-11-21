import type {
  AlgorithmOutput,
  CatalogAlgorithmInput,
} from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CatalogAlgorithmTarget } from "../catalog-algorithms/types.js";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Install before learner code so encoding inspects only own data properties
// and cannot invoke learner-defined accessors or JSON hooks on the result.
export const catalogAlgorithmHarness = `(() => {
  const apply = Reflect.apply;
  const parse = JSON.parse;
  const stringify = JSON.stringify;
  const isArray = Array.isArray;
  const own = Object.getOwnPropertyDescriptor;
  const hasOwn = Object.hasOwn;
  const setPrototypeOf = Object.setPrototypeOf;
  const integer = Number.isSafeInteger;

  return (fn, encoded, mode, lengthBudget, expectedPrefixLength) => {
    const args = parse(encoded);
    const first = args[0];
    const output = apply(fn, undefined, args);
    if (mode === "in-place-matrix" && output !== first) return undefined;
    let prefix = null;
    let remaining = lengthBudget;

    function snapshot(value, depth, prefixLength) {
      if (--remaining < 0) throw null;
      if (typeof value === "string") {
        remaining -= value.length;
        if (remaining < 0) throw null;
        return value;
      }
      if (integer(value) || typeof value === "boolean") return value;
      if (depth < 0 || !isArray(value)) throw null;
      const size = own(value, "length")?.value;
      const length = prefixLength ?? size;
      if (!integer(length) || !integer(size) || length < 0 ||
          size < length || length > remaining) throw null;
      const copy = setPrototypeOf([], null);
      for (let index = 0; index < length; index++) {
        const item = own(value, index);
        if (!item || !hasOwn(item, "value")) throw null;
        copy[index] = snapshot(item.value, depth - 1);
      }
      return copy;
    }

    try {
      const result = snapshot(output, 1);
      if (mode === "sorted-prefix" && output === expectedPrefixLength)
        prefix = snapshot(first, 0, expectedPrefixLength);
      return stringify(setPrototypeOf([result, prefix], null));
    } catch {
      return undefined;
    }
  };
})()`;

function serialized(value: AlgorithmOutput | null) {
  return JSON.stringify(value);
}

function canonicalRows(output: AlgorithmOutput) {
  if (!Array.isArray(output) || !output.every(Array.isArray)) return undefined;
  return (output as (number[] | string[])[]).map((row) =>
    JSON.stringify([...row].sort()),
  );
}

function matches(
  actual: AlgorithmOutput,
  { expected, mode }: CatalogAlgorithmTarget,
) {
  if (mode !== "unordered-rows" && mode !== "unordered-groups")
    return serialized(actual) === serialized(expected);
  const actualRows = canonicalRows(actual);
  const expectedRows = canonicalRows(expected);
  if (!actualRows || !expectedRows) return false;
  if (mode === "unordered-groups") {
    actualRows.sort();
    expectedRows.sort();
  }
  return (
    actualRows.length === expectedRows.length &&
    actualRows.every((row, index) => row === expectedRows[index])
  );
}

export function judgeCatalogAlgorithm(
  input: CatalogAlgorithmInput,
  target: CatalogAlgorithmTarget,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const { expected, mode } = target;
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const encoded = ctx.newString(JSON.stringify(input.args));
  const modeHandle = ctx.newString(mode ?? "exact");
  const budget = ctx.newNumber(serialized(expected).length + 2048);
  const prefixLength = ctx.newNumber(
    mode === "sorted-prefix" ? Number(expected) : 0,
  );
  try {
    const checked = enter(() =>
      ctx.callFunction(
        harness,
        ctx.undefined,
        fn,
        encoded,
        modeHandle,
        budget,
        prefixLength,
      ),
    );
    try {
      if (checked.error || exceeded())
        return {
          verdict: exceeded() ? "time-limit-exceeded" : "runtime-error",
          message: exceeded()
            ? "Execution exceeded its CPU budget."
            : checked.error
              ? errorText(checked.error)
              : "JavaScript execution failed.",
          expected,
        };
      if (ctx.typeof(checked.value) !== "string")
        return {
          verdict: "wrong-answer",
          message:
            mode === "in-place-matrix"
              ? "Rotate the original matrix in place and return it."
              : "Return a value that matches the problem’s output requirements.",
          expected,
        };

      const [actual, prefix] = JSON.parse(ctx.getString(checked.value)) as [
        AlgorithmOutput,
        number[] | null,
      ];
      const outputMatches = matches(actual, target);
      const prefixMatches =
        mode !== "sorted-prefix" ||
        serialized(prefix) ===
          serialized([...new Set(input.args[0] as number[])]);
      const passed = outputMatches && prefixMatches;
      return {
        verdict: passed ? "accepted" : "wrong-answer",
        message: passed
          ? "The result matches."
          : outputMatches && !prefixMatches
            ? "Place the distinct values in the first k positions in order."
            : "The result differs from the expected value.",
        expected,
        actual,
      };
    } finally {
      checked.dispose();
    }
  } finally {
    encoded.dispose();
    modeHandle.dispose();
    budget.dispose();
    prefixLength.dispose();
  }
}
