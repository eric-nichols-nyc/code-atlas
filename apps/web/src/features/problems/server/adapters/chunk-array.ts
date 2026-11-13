import type { ChunkArrayInput } from "@workspace/problems";
import type { QuickJSHandle } from "quickjs-emscripten";
import type { CaseOutcome, GuestAccess } from "./types.js";

// Never export learner arrays to the host. Inspect every row/proxy/getter inside
// the timed guest and copy a bounded matrix of finite numeric data records.
export const chunkArrayHarness = `(() => {
  const apply = Reflect.apply;
  const parse = JSON.parse;
  const isArray = Array.isArray;
  const hasOwn = Object.hasOwn;
  const finite = Number.isFinite;
  const integer = Number.isInteger;
  const create = Object.create;
  const SetCtor = Set;
  const setHas = Set.prototype.has;
  const setAdd = Set.prototype.add;
  return (fn, encoded, size) => {
    const input = parse(encoded);
    const original = parse(encoded);
    const actual = create(null);
    actual.length = 0;
    const answer = (status) => {
      const result = create(null);
      result.status = status;
      result.actual = actual;
      return result;
    };
    const output = apply(fn, undefined, [input, size]);
    if (!isArray(output)) return answer("array");
    if (output === input || input.length !== original.length) return answer("input");
    for (let i = 0; i < original.length; i++) {
      if (!hasOwn(input, i) || input[i] !== original[i]) return answer("input");
    }
    const length = output.length;
    if (!integer(length) || length < 0 || length > 1000) return answer("size");
    let count = 0;
    const seen = new SetCtor();
    for (let i = 0; i < length; i++) {
      if (!hasOwn(output, i)) return answer("number");
      const row = output[i];
      if (!isArray(row)) return answer("rows");
      if (row === input) return answer("input");
      if (apply(setHas, seen, [row])) return answer("alias");
      apply(setAdd, seen, [row]);
      const width = row.length;
      if (!integer(width) || width < 0 || width > 1000 || count + width > 1000) return answer("size");
      const copied = create(null);
      copied.length = width;
      for (let j = 0; j < width; j++) {
        if (!hasOwn(row, j)) return answer("number");
        const value = row[j];
        if (typeof value !== "number" || !finite(value)) return answer("number");
        copied[j] = value;
      }
      count += width;
      actual[i] = copied;
      actual.length = i + 1;
    }
    return answer("ok");
  };
})()`;

export function judgeChunkArray(
  input: ChunkArrayInput,
  guest: GuestAccess,
  harness: QuickJSHandle,
): CaseOutcome {
  const { ctx, fn, enter, errorText, exceeded } = guest;
  const expected: number[][] = [];
  for (let i = 0; i < input.arr.length; i += input.size)
    expected.push(input.arr.slice(i, i + input.size));
  const encoded = ctx.newString(JSON.stringify(input.arr));
  const size = ctx.newNumber(input.size);
  try {
    const checked = enter(() =>
      ctx.callFunction(harness, ctx.undefined, fn, encoded, size),
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
      const values = ctx.getProp(checked.value, "actual");
      const actual: number[][] = [];
      try {
        const lengthValue = ctx.getProp(values, "length");
        const length = ctx.getNumber(lengthValue);
        lengthValue.dispose();
        for (let i = 0; i < Math.min(length, 1000); i++) {
          const row = ctx.getProp(values, i);
          try {
            const widthValue = ctx.getProp(row, "length");
            const width = ctx.getNumber(widthValue);
            widthValue.dispose();
            const copied: number[] = [];
            for (let j = 0; j < Math.min(width, 1000); j++) {
              const value = ctx.getProp(row, j);
              copied.push(ctx.getNumber(value));
              value.dispose();
            }
            actual.push(copied);
          } finally {
            row.dispose();
          }
        }
      } finally {
        values.dispose();
      }
      const messages: Record<string, string> = {
        array: "chunkArray must return an array of arrays.",
        rows: "Each chunk must be an array.",
        input: "Leave arr unchanged and create new result and chunk arrays.",
        size: "The chunked output exceeds the allowed array size.",
        alias:
          "Each chunk must have its own new array, even when values are identical.",
        number: "Return dense chunks containing only finite numbers.",
      };
      const passed =
        status === "ok" &&
        actual.length === expected.length &&
        actual.every(
          (row, i) =>
            row.length === expected[i]?.length &&
            row.every((value, j) => value === expected[i]?.[j]),
        );
      return {
        verdict: passed
          ? "accepted"
          : status === "array" || status === "rows"
            ? "runtime-error"
            : "wrong-answer",
        message: passed
          ? "The chunks preserve every value in order."
          : (messages[status] ??
            "Split arr into consecutive groups of size, with a shorter final chunk if needed."),
        expected,
        actual,
      };
    } finally {
      checked.dispose();
    }
  } finally {
    encoded.dispose();
    size.dispose();
  }
}
