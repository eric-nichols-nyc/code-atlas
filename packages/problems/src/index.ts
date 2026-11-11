import { counterProblem } from "./problems/counter.js";
import { curryFunctions, curryProblem } from "./problems/curry.js";
import { debounceProblem } from "./problems/debounce.js";
import { delayEachPromiseProblem } from "./problems/delay-each-promise.js";
import { fibonacciGeneratorProblem } from "./problems/fibonacci-generator.js";
import {
  filterArrayProblem,
  filterPredicates,
} from "./problems/filter-array.js";
import {
  flattenNestedArrayProblem,
  MAX_FLATTEN_DEPTH,
  MAX_FLATTEN_NODES,
} from "./problems/flatten-nested-array.js";
import { sleepProblem } from "./problems/sleep.js";
import {
  type ExecutionResult,
  type NestedArray,
  type ProblemDefinition,
  type ProblemInput,
  type Verdict,
  verdicts,
} from "./types.js";

export * from "./types.js";
export {
  counterProblem,
  curryFunctions,
  curryProblem,
  debounceProblem,
  delayEachPromiseProblem,
  fibonacciGeneratorProblem,
  filterArrayProblem,
  filterPredicates,
  flattenNestedArrayProblem,
  MAX_FLATTEN_DEPTH,
  MAX_FLATTEN_NODES,
  sleepProblem,
};
export const publicProblems = [
  sleepProblem,
  counterProblem,
  curryProblem,
  debounceProblem,
  filterArrayProblem,
  flattenNestedArrayProblem,
  fibonacciGeneratorProblem,
  delayEachPromiseProblem,
];
export function findProblem(slugOrId: string) {
  return publicProblems.find((p) => p.slug === slugOrId || p.id === slugOrId);
}
export function validMillis(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 1000
  );
}
const integer = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= min &&
  value <= max;
const numericArray = (value: unknown, max: number): value is number[] =>
  Array.isArray(value) &&
  value.length <= max &&
  value.every((n) => integer(n, -1e9, 1e9));
export function validNestedArray(value: unknown): value is NestedArray {
  if (!Array.isArray(value)) return false;
  const pending: { value: unknown; depth: number }[] = [{ value, depth: 1 }];
  let nodes = 1;
  while (pending.length) {
    const current = pending.pop();
    if (!current) break;
    if (Array.isArray(current.value)) {
      if (current.depth > MAX_FLATTEN_DEPTH) return false;
      for (const child of current.value) {
        if (++nodes > MAX_FLATTEN_NODES) return false;
        pending.push({ value: child, depth: current.depth + 1 });
      }
    } else if (!integer(current.value, -1e9, 1e9)) return false;
  }
  return true;
}
export function validProblemInput(
  problem: ProblemDefinition,
  value: unknown,
): value is ProblemInput {
  if (problem.kind === "delay") return validMillis(value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  if (problem.kind === "fibonacci-generator")
    return Object.keys(input).length === 1 && integer(input.count, 0, 50);
  if (problem.kind === "flatten-array")
    return Object.keys(input).length === 1 && validNestedArray(input.arr);
  if (Object.keys(input).length !== 2) return false;
  if (problem.kind === "curry") {
    const callback = curryFunctions.find((item) => item.id === input.fn);
    if (
      !callback ||
      !Array.isArray(input.groups) ||
      input.groups.length < 1 ||
      input.groups.length > 10
    )
      return false;
    let count = 0;
    for (const [index, group] of input.groups.entries()) {
      if (
        !Array.isArray(group) ||
        !group.every((value) => integer(value, -1000, 1000))
      )
        return false;
      count += group.length;
      if (
        count > 12 ||
        (index < input.groups.length - 1 && count >= callback.arity)
      )
        return false;
    }
    return count >= callback.arity;
  }
  if (problem.kind === "delay-all")
    return (
      integer(input.ms, 0, 1000) &&
      Array.isArray(input.functions) &&
      input.functions.length <= 10 &&
      input.functions.every(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          Object.keys(item).length === 2 &&
          integer(item.t, 0, 1000) &&
          integer(item.value, -1e9, 1e9),
      )
    );
  if (problem.kind === "counter")
    return integer(input.n, -1000, 1000) && integer(input.calls, 0, 1000);
  if (problem.kind === "debounce")
    return (
      integer(input.t, 0, 1000) &&
      Array.isArray(input.calls) &&
      input.calls.length >= 1 &&
      input.calls.length <= 10 &&
      input.calls.every(
        (call) =>
          call &&
          typeof call === "object" &&
          Object.keys(call).length === 2 &&
          integer(call.t, 0, 1000) &&
          numericArray(call.inputs, 10),
      )
    );
  return (
    numericArray(input.arr, 1000) &&
    filterPredicates.some((predicate) => predicate.id === input.predicate)
  );
}
export function validRunInputs(
  problem: ProblemDefinition,
  value: unknown,
): value is ProblemInput[] | undefined {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.length >= 1 &&
      value.length <= 5 &&
      value.every((input) => validProblemInput(problem, input)))
  );
}
export function formatProblemInput(input: ProblemInput) {
  if (typeof input === "number") return `millis = ${input}`;
  if ("groups" in input)
    return `fn = ${input.fn}, groups = ${JSON.stringify(input.groups)}`;
  if ("ms" in input)
    return `ms = ${input.ms}, functions = ${JSON.stringify(input.functions)}`;
  if ("count" in input) return `count = ${input.count}`;
  if ("n" in input) return `n = ${input.n}, calls = ${input.calls}`;
  if ("arr" in input)
    return `arr = ${JSON.stringify(input.arr)}${"predicate" in input ? `, fn = ${input.predicate}` : ""}`;
  return `t = ${input.t}, calls = ${JSON.stringify(input.calls)}`;
}
export function isExecutionResult(value: unknown): value is ExecutionResult {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.attemptId === "string" &&
    (r.action === "run" || r.action === "submit") &&
    verdicts.includes(r.verdict as Verdict) &&
    Number.isInteger(r.passed) &&
    Number.isInteger(r.total) &&
    Array.isArray(r.cases) &&
    (r.persistence === undefined ||
      r.persistence === "saved" ||
      r.persistence === "unavailable") &&
    r.cases.every(
      (c) =>
        c &&
        typeof c === "object" &&
        typeof c.id === "string" &&
        typeof c.passed === "boolean" &&
        verdicts.includes(c.verdict) &&
        typeof c.message === "string" &&
        typeof c.hidden === "boolean" &&
        Array.isArray(c.logs) &&
        c.logs.every((x: unknown) => typeof x === "string"),
    )
  );
}
