import {
  type AlgorithmParameter,
  type CatalogAlgorithmInput,
  MAX_SOURCE_BYTES,
  type ProblemDefinition,
} from "./types.js";

const alphabetViolations = {
  lowercase: /[^a-z]/,
  ascii: /[^\x20-\x7E]/,
  letters: /[^a-zA-Z]/,
  alphanumeric: /[^a-zA-Z0-9]/,
};

function isText(
  value: unknown,
  min: number,
  max: number,
  alphabet?: keyof typeof alphabetViolations,
) {
  return (
    typeof value === "string" &&
    value.length >= min &&
    value.length <= max &&
    (!alphabet || !alphabetViolations[alphabet].test(value))
  );
}

export function validAlgorithmArgument(
  spec: AlgorithmParameter,
  value: unknown,
): boolean {
  if (spec.type === "string")
    return isText(value, spec.minLength, spec.maxLength, spec.alphabet);
  if (spec.type === "integer")
    return (
      Number.isSafeInteger(value) &&
      spec.min <= Number(value) &&
      Number(value) <= spec.max
    );

  if (
    !Array.isArray(value) ||
    value.length < spec.minLength ||
    value.length > spec.maxLength
  )
    return false;
  if (spec.type === "strings")
    return [...value].every((word) =>
      isText(word, spec.minWordLength, spec.maxWordLength, spec.alphabet),
    );

  const integer = (item: unknown): item is number =>
    typeof item === "number" &&
    Number.isSafeInteger(item) &&
    item >= spec.min &&
    item <= spec.max;
  if (spec.type === "integers") {
    let previous = -Infinity;
    for (const item of value) {
      if (!integer(item) || (spec.sorted && item < previous)) return false;
      previous = item;
    }
    return true;
  }

  const columns = spec.square ? value.length : value[0]?.length;
  if (
    !Number.isSafeInteger(columns) ||
    columns < spec.minLength ||
    columns > spec.maxLength
  )
    return false;
  return [...value].every(
    (row) =>
      Array.isArray(row) && row.length === columns && [...row].every(integer),
  );
}

export function validCatalogAlgorithmInput(
  problem: ProblemDefinition,
  input: Record<string, unknown>,
): input is Record<string, unknown> & CatalogAlgorithmInput {
  const { parameters } = problem;
  const { args } = input;
  if (
    !parameters ||
    Object.keys(input).length !== 1 ||
    !Object.hasOwn(input, "args") ||
    !Array.isArray(args) ||
    args.length !== parameters.length ||
    !parameters.every((spec, index) =>
      validAlgorithmArgument(spec, args[index]),
    )
  )
    return false;
  return parameters.every((spec, index) => {
    if (spec.type !== "integer" || spec.maxLengthOfArgument === undefined)
      return true;
    const boundedBy = args[spec.maxLengthOfArgument];
    return Array.isArray(boundedBy) && args[index] <= boundedBy.length;
  });
}

export function algorithmArgumentDraft(
  parameter: AlgorithmParameter,
  draft: string,
): unknown {
  if (parameter.type === "string") return draft;
  try {
    return JSON.parse(draft);
  } catch {
    return undefined;
  }
}

function encodedArgumentLimit(spec: AlgorithmParameter) {
  const textBytes = (alphabet: keyof typeof alphabetViolations | undefined) =>
    alphabet === "ascii" ? 2 : alphabet ? 1 : 6;
  if (spec.type === "string")
    return 2 + spec.maxLength * textBytes(spec.alphabet);
  if (spec.type === "strings")
    return (
      2 + spec.maxLength * (3 + spec.maxWordLength * textBytes(spec.alphabet))
    );

  const digits = Math.max(String(spec.min).length, String(spec.max).length);
  if (spec.type === "integer") return digits;
  const row = 2 + spec.maxLength * (digits + 1);
  return spec.type === "matrix" ? 2 + spec.maxLength * (row + 1) : row;
}

export function catalogAlgorithmRunBodyLimit(parameters: AlgorithmParameter[]) {
  const caseBytes =
    16 +
    parameters.reduce(
      (size, parameter) => size + 1 + encodedArgumentLimit(parameter),
      0,
    );
  return Math.max(64 * 1024, 6 * MAX_SOURCE_BYTES + 1024 + 5 * caseBytes);
}
