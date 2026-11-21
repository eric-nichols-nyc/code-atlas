export const MAX_SOURCE_BYTES = 32 * 1024;
export const verdicts = [
  "accepted",
  "wrong-answer",
  "compile-error",
  "runtime-error",
  "time-limit-exceeded",
] as const;
export type Verdict = (typeof verdicts)[number];
export type ExecutionAction = "run" | "submit";
export interface CounterInput {
  n: number;
  calls: number;
}
export interface DebounceCall {
  t: number;
  inputs: number[];
}
export interface DebounceInput {
  t: number;
  calls: DebounceCall[];
}
export type FilterPredicate =
  | "greaterThan10"
  | "firstIndex"
  | "plusOne"
  | "evenIndex"
  | "isPositive"
  | "isTruthy"
  | "alwaysFalse";
export interface FilterInput {
  arr: number[];
  predicate: FilterPredicate;
}
export type NestedArray = (number | NestedArray)[];
export interface FlattenInput {
  arr: NestedArray;
}
export interface GeneratorInput {
  count: number;
}
export type CurryFunction =
  | "sum3"
  | "product4"
  | "subtract3"
  | "identity"
  | "constant"
  | "countArgs";
export interface CurryInput {
  fn: CurryFunction;
  groups: number[][];
}
export interface TimedValue {
  t: number;
  value: number;
}
export interface PromiseDelayInput {
  ms: number;
  functions: TimedValue[];
}
export type MapTransform = "double" | "addIndex" | "square" | "negate" | "zero";
export interface MapArrayInput {
  arr: number[];
  transform: MapTransform;
}
export type ReduceFunction = "sum" | "subtract" | "max" | "countEven";
export interface ReduceArrayInput {
  nums: number[];
  reducer: ReduceFunction;
  init: number;
}
export interface ChunkArrayInput {
  arr: number[];
  size: number;
}
export type CompositionFunction = "addOne" | "double" | "negate";
export interface CompositionInput {
  functions: CompositionFunction[];
  x: number;
}
export type MemoizeFunction = "sum" | "product" | "subtract";
export interface MemoizeInput {
  fn: MemoizeFunction;
  calls: number[][];
}
export interface MemoizeOutput {
  values: number[];
  callCount: number;
}
export interface AnagramInput {
  s: string;
  t: string;
}
export interface TwoDistinctInput {
  s: string;
}
export interface MostFrequentCharacterInput {
  str: string;
}
export interface MajorityElementInput {
  nums: number[];
}
export type AlgorithmArgument =
  | number
  | string
  | number[]
  | number[][]
  | string[];
export type AlgorithmOutput = AlgorithmArgument | boolean | string[][];
export interface CatalogAlgorithmInput {
  args: AlgorithmArgument[];
}
type AlgorithmAlphabet = "lowercase" | "ascii" | "letters" | "alphanumeric";
type IntegerBounds = { min: number; max: number };
type LengthBounds = { minLength: number; maxLength: number };
export type AlgorithmParameter = { name: string } & (
  | ({ type: "integer"; maxLengthOfArgument?: number } & IntegerBounds)
  | ({ type: "string"; alphabet?: AlgorithmAlphabet } & LengthBounds)
  | ({ type: "integers"; sorted?: true } & IntegerBounds & LengthBounds)
  | ({ type: "matrix"; square?: true } & IntegerBounds & LengthBounds)
  | ({
      type: "strings";
      minWordLength: number;
      maxWordLength: number;
      alphabet?: AlgorithmAlphabet;
    } & LengthBounds)
);
export type ProblemInput =
  | CatalogAlgorithmInput
  | MostFrequentCharacterInput
  | AnagramInput
  | TwoDistinctInput
  | MajorityElementInput
  | number
  | CounterInput
  | DebounceInput
  | FilterInput
  | FlattenInput
  | GeneratorInput
  | CurryInput
  | PromiseDelayInput
  | MapArrayInput
  | ReduceArrayInput
  | ChunkArrayInput
  | CompositionInput
  | MemoizeInput;
export type ProblemOutput =
  | AlgorithmOutput
  | MemoizeOutput
  | DebounceCall[]
  | TimedValue[];
export interface CaseResult {
  id: string;
  passed: boolean;
  verdict: Verdict;
  input?: ProblemInput;
  elapsedMs?: number;
  expected?: ProblemOutput;
  actual?: ProblemOutput;
  message: string;
  logs: string[];
  hidden: boolean;
}
export interface ExecutionResult {
  attemptId: string;
  action: ExecutionAction;
  verdict: Verdict;
  passed: number;
  total: number;
  cases: CaseResult[];
  persistence?: "saved" | "unavailable";
}

export interface PracticeProgressRecord {
  problemId: string;
  flagged: boolean;
  solvedAt: string | null;
  legacyCompleted: boolean;
}
export interface SavedProblemProgress extends PracticeProgressRecord {
  lastCode: string | null;
  codeUpdatedAt: string | null;
}
export interface ProblemDefinition {
  id: string;
  slug: string;
  subjectId: string;
  topicId:
    | "basics"
    | "functions"
    | "async"
    | "closures"
    | "arrays"
    | "generators"
    | "two-pointers"
    | "sliding-window"
    | "hash-maps";
  kind:
    | "delay"
    | "counter"
    | "curry"
    | "debounce"
    | "delay-all"
    | "filter-array"
    | "flatten-array"
    | "fibonacci-generator"
    | "map-array"
    | "reduce-array"
    | "chunk-array"
    | "function-composition"
    | "memoize"
    | "majority-element"
    | "move-zeroes"
    | "max-consecutive-ones"
    | "valid-anagram"
    | "longest-substring-two-distinct"
    | "most-frequent-character"
    | "catalog-algorithm";
  parameters?: AlgorithmParameter[];
  inputError: string;
  title: string;
  summary: string;
  difficulty: string;
  entryFunction: string;
  starterCode: string;
  samples: {
    id: string;
    input: ProblemInput;
    expected?: ProblemOutput;
    explanation: string;
  }[];
  constraints: string[];
  hints: string[];
  solution: string;
  solutionExplanation: string;
}

export interface CatalogAlgorithmDefinition
  extends Omit<ProblemDefinition, "samples" | "parameters"> {
  kind: "catalog-algorithm";
  subjectId: "algorithms";
  parameters: AlgorithmParameter[];
  samples: {
    id: string;
    input: CatalogAlgorithmInput;
    expected: AlgorithmOutput;
    explanation: string;
  }[];
}
