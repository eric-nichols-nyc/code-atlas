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
}
export function inputDraft(input: ProblemInput): InputDraft {
  const base = { value: "", calls: "", json: "", predicate: "greaterThan10" };
  if (typeof input === "number") return { ...base, value: String(input) };
  if ("n" in input)
    return { ...base, value: String(input.n), calls: String(input.calls) };
  if ("arr" in input)
    return {
      ...base,
      json: JSON.stringify(input.arr),
      predicate: input.predicate,
    };
  return { ...base, value: String(input.t), json: JSON.stringify(input.calls) };
}
export function parseInputDraft(
  problem: ProblemDefinition,
  draft: InputDraft,
): ProblemInput | undefined {
  try {
    if (problem.kind !== "filter-array" && !draft.value.trim())
      return undefined;
    let input: unknown;
    if (problem.kind === "delay") input = Number(draft.value);
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
