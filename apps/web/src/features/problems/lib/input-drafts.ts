import {
  type ProblemDefinition,
  type ProblemInput,
  validProblemInput,
} from "@workspace/problems";
export interface InputDraft {
  value: string;
  calls: string;
  json: string;
  predicate: string;
  callback?: string;
}
export function inputDraft(input: ProblemInput): InputDraft {
  const base = { value: "", calls: "", json: "", predicate: "greaterThan10" };
  if (typeof input === "number") return { ...base, value: String(input) };
  if ("x" in input)
    return {
      ...base,
      value: String(input.x),
      json: JSON.stringify(input.functions),
    };
  if ("nums" in input)
    return {
      ...base,
      value: String(input.init),
      json: JSON.stringify(input.nums),
      callback: input.reducer,
    };
  if ("fn" in input && "calls" in input)
    return { ...base, json: JSON.stringify(input.calls), callback: input.fn };
  if ("transform" in input)
    return {
      ...base,
      json: JSON.stringify(input.arr),
      callback: input.transform,
    };
  if ("size" in input)
    return {
      ...base,
      json: JSON.stringify(input.arr),
      value: String(input.size),
    };
  if ("groups" in input)
    return { ...base, json: JSON.stringify(input.groups), callback: input.fn };
  if ("ms" in input)
    return {
      ...base,
      value: String(input.ms),
      json: JSON.stringify(input.functions),
    };
  if ("count" in input) return { ...base, value: String(input.count) };
  if ("n" in input)
    return { ...base, value: String(input.n), calls: String(input.calls) };
  if ("arr" in input)
    return {
      ...base,
      json: JSON.stringify(input.arr),
      ...("predicate" in input ? { predicate: input.predicate } : {}),
    };
  return { ...base, value: String(input.t), json: JSON.stringify(input.calls) };
}
export function parseInputDraft(
  problem: ProblemDefinition,
  draft: InputDraft,
): ProblemInput | undefined {
  try {
    if (
      problem.kind !== "map-array" &&
      problem.kind !== "memoize" &&
      problem.kind !== "filter-array" &&
      problem.kind !== "curry" &&
      problem.kind !== "flatten-array" &&
      !draft.value.trim()
    )
      return undefined;
    let input: unknown;
    if (problem.kind === "map-array")
      input = { arr: JSON.parse(draft.json), transform: draft.callback };
    else if (problem.kind === "reduce-array")
      input = {
        nums: JSON.parse(draft.json),
        reducer: draft.callback,
        init: Number(draft.value),
      };
    else if (problem.kind === "chunk-array")
      input = { arr: JSON.parse(draft.json), size: Number(draft.value) };
    else if (problem.kind === "function-composition")
      input = { functions: JSON.parse(draft.json), x: Number(draft.value) };
    else if (problem.kind === "memoize")
      input = { fn: draft.callback, calls: JSON.parse(draft.json) };
    else if (problem.kind === "delay") input = Number(draft.value);
    else if (problem.kind === "flatten-array")
      input = { arr: JSON.parse(draft.json) };
    else if (problem.kind === "curry")
      input = { fn: draft.callback, groups: JSON.parse(draft.json) };
    else if (problem.kind === "delay-all")
      input = { ms: Number(draft.value), functions: JSON.parse(draft.json) };
    else if (problem.kind === "fibonacci-generator")
      input = { count: Number(draft.value) };
    else if (problem.kind === "counter") {
      if (!draft.calls.trim()) return undefined;
      input = { n: Number(draft.value), calls: Number(draft.calls) };
    } else if (problem.kind === "debounce")
      input = { t: Number(draft.value), calls: JSON.parse(draft.json) };
    else input = { arr: JSON.parse(draft.json), predicate: draft.predicate };
    return validProblemInput(problem, input) ? input : undefined;
  } catch {
    return undefined;
  }
}
