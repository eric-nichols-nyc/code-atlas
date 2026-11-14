export type CodeWalkthroughStep = {
  readonly id: string;
  readonly explanation: string;
  readonly lines: readonly number[];
};

export type CodeWalkthroughDefinition = {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly steps: readonly [CodeWalkthroughStep, ...CodeWalkthroughStep[]];
};

export type CodeTokenRole = "keyword" | "string" | "number" | "comment";
export type CodeToken = { text: string; offset: number; role?: CodeTokenRole };
export type PreparedWalkthrough = CodeWalkthroughDefinition & {
  codeLines: { number: number; tokens: CodeToken[] }[];
};

export function normalizeCodeSource(source: string) {
  return source.replace(/\r\n?/g, "\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function availableWalkthroughSource(value: unknown) {
  return isRecord(value) && typeof value.source === "string"
    ? normalizeCodeSource(value.source)
    : "";
}

export function validateCodeWalkthrough(
  value: unknown,
  context = "Walkthrough",
) {
  const errors: string[] = [];
  if (!isRecord(value)) return [`${context}: missing walkthrough definition.`];
  const label = `${context} ${nonempty(value.id) ? value.id : "(missing id)"}`;
  for (const field of ["id", "title", "source"])
    if (!nonempty(value[field])) errors.push(`${label}: empty ${field}.`);
  const lineCount = availableWalkthroughSource(value).split("\n").length;
  if (!Array.isArray(value.steps) || !value.steps.length)
    return [...errors, `${label}: at least one step is required.`];
  const ids = new Set<string>();
  for (const [index, step] of value.steps.entries()) {
    const stepLabel = `${label}, step ${isRecord(step) && nonempty(step.id) ? step.id : index + 1}`;
    if (!isRecord(step)) {
      errors.push(`${stepLabel}: missing step definition.`);
      continue;
    }
    if (!nonempty(step.id)) errors.push(`${stepLabel}: empty id.`);
    else if (ids.has(step.id)) errors.push(`${stepLabel}: duplicate step id.`);
    else ids.add(step.id);
    if (!nonempty(step.explanation))
      errors.push(`${stepLabel}: empty explanation.`);
    if (
      !Array.isArray(step.lines) ||
      !step.lines.length ||
      new Set(step.lines).size !== step.lines.length ||
      !step.lines.every(
        (line: unknown) =>
          typeof line === "number" &&
          Number.isInteger(line) &&
          line >= 1 &&
          line <= lineCount,
      )
    )
      errors.push(
        `${stepLabel}: lines must be distinct integers from 1 to ${lineCount}.`,
      );
  }
  return errors;
}

export function validateWalkthroughRegistry(
  entries: readonly { moduleSlug: string; walkthrough: unknown }[],
  publishedSlugs: readonly string[],
) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const { moduleSlug, walkthrough } of entries) {
    const context = `Module ${moduleSlug}, walkthrough`;
    if (!publishedSlugs.includes(moduleSlug))
      errors.push(`${context}: module is not published.`);
    errors.push(...validateCodeWalkthrough(walkthrough, context));
    if (isRecord(walkthrough) && nonempty(walkthrough.id)) {
      if (ids.has(walkthrough.id))
        errors.push(`${context} ${walkthrough.id}: duplicate walkthrough id.`);
      ids.add(walkthrough.id);
    }
  }
  return errors;
}
