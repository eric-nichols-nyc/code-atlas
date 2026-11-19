import { MAX_SOURCE_BYTES } from "@workspace/problems";
import { AiInputError, isObject, utf8Bytes } from "@/features/ai/lib/contract";

// A stable, versioned rubric makes scores explainable and future changes explicit.
export const EVALUATION_RUBRIC = [
  { key: "correctness", title: "Correctness", max: 4 },
  { key: "efficiency", title: "Time & space complexity", max: 3 },
  { key: "quality", title: "Code quality", max: 2 },
  { key: "edgeCases", title: "Edge cases", max: 1 },
] as const;
type Criterion = (typeof EVALUATION_RUBRIC)[number]["key"];
export interface EvaluationFinding {
  score: number;
  explanation: string;
}
export interface CodeEvaluation {
  rubricVersion: "1";
  summary: string;
  criteria: Record<Criterion, EvaluationFinding>;
  timeComplexity: string;
  spaceComplexity: string;
  improvements: string[];
}
export const evaluationScore = (report: CodeEvaluation) =>
  EVALUATION_RUBRIC.reduce(
    (total, criterion) => total + report.criteria[criterion.key].score,
    0,
  );

const only = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length &&
  Object.keys(value).every((key) => keys.includes(key));
const text = (value: unknown, max: number): value is string =>
  typeof value === "string" && Boolean(value.trim()) && utf8Bytes(value) <= max;

export function parseEvaluationRequest(value: unknown): { code: string } {
  if (
    !isObject(value) ||
    !only(value, ["code"]) ||
    typeof value.code !== "string" ||
    utf8Bytes(value.code) > MAX_SOURCE_BYTES
  )
    throw new AiInputError(
      "Provide only your current code, within 32 KiB. Your edits are kept.",
    );
  if (!value.code.trim())
    throw new AiInputError("Write some code before evaluating.");
  return { code: value.code };
}

export function parseCodeEvaluation(value: unknown): CodeEvaluation {
  const invalid = () =>
    new Error(
      "The evaluation was incomplete or invalid. Retry with current code.",
    );
  if (
    !isObject(value) ||
    !only(value, [
      "rubricVersion",
      "summary",
      "criteria",
      "timeComplexity",
      "spaceComplexity",
      "improvements",
    ]) ||
    value.rubricVersion !== "1" ||
    !text(value.summary, 2000) ||
    !text(value.timeComplexity, 500) ||
    !text(value.spaceComplexity, 500) ||
    !isObject(value.criteria) ||
    !only(
      value.criteria,
      EVALUATION_RUBRIC.map((item) => item.key),
    ) ||
    !Array.isArray(value.improvements) ||
    value.improvements.length > 5 ||
    !value.improvements.every((item) => text(item, 2000))
  )
    throw invalid();
  const criteria = {} as CodeEvaluation["criteria"];
  for (const item of EVALUATION_RUBRIC) {
    const finding = value.criteria[item.key];
    if (
      !isObject(finding) ||
      !only(finding, ["score", "explanation"]) ||
      typeof finding.score !== "number" ||
      !Number.isInteger(finding.score) ||
      finding.score < 0 ||
      finding.score > item.max ||
      !text(finding.explanation, 4000)
    )
      throw invalid();
    criteria[item.key] = {
      score: finding.score,
      explanation: finding.explanation,
    };
  }
  // Efficiency credit requires a meaningful solution, not just a short program.
  if (
    (criteria.correctness.score === 0 &&
      (criteria.efficiency.score !== 0 || criteria.edgeCases.score !== 0)) ||
    (criteria.correctness.score <= 2 && criteria.efficiency.score > 1)
  )
    throw invalid();
  return {
    rubricVersion: "1",
    summary: value.summary,
    criteria,
    timeComplexity: value.timeComplexity,
    spaceComplexity: value.spaceComplexity,
    improvements: value.improvements as string[],
  };
}
