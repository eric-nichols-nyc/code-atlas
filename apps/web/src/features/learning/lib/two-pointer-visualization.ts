import {
  normalizeCodeSource,
  validateCodeWalkthrough,
} from "./code-walkthrough";

export type TwoPointerFrame = {
  readonly id: string;
  readonly phase:
    | "initialize"
    | "compare"
    | "move-right"
    | "move-left"
    | "found";
  readonly left: number;
  readonly right: number;
  readonly lines: readonly number[];
  readonly explanation: string;
};

export type TwoPointerVisualizationDefinition = {
  readonly id: string;
  readonly title: string;
  readonly numbers: readonly number[];
  readonly target: number;
  readonly source: string;
  readonly frames: readonly [TwoPointerFrame, ...TwoPointerFrame[]];
};

// This validates trusted, prepared snapshots of an inward sorted-array search.
// It never parses or executes JavaScript, and supports 2–50 finite sorted values.
export function validateTwoPointerVisualization(
  definition: TwoPointerVisualizationDefinition,
) {
  const errors = validateCodeWalkthrough(
    { ...definition, steps: definition.frames },
    "Visualization",
  );
  const { numbers, target, frames } = definition;
  const label = `Visualization ${definition.id}`;
  if (
    numbers.length < 2 ||
    numbers.length > 50 ||
    !numbers.every(
      (value, index) =>
        Number.isFinite(value) &&
        (index === 0 || value >= (numbers[index - 1] ?? value)),
    ) ||
    !Number.isFinite(target)
  )
    return [
      ...errors,
      `${label}: requires 2–50 finite sorted values and a finite target.`,
    ];
  let left = 0;
  let right = numbers.length - 1;
  let expectedPhase: TwoPointerFrame["phase"] | undefined = "initialize";
  for (const frame of frames) {
    const context = `${label}, frame ${frame.id}`;
    if (frame.left !== left || frame.right !== right || left >= right)
      errors.push(`${context}: pointer positions do not follow the search.`);
    const sum = (numbers[left] ?? 0) + (numbers[right] ?? 0);
    if (frame.phase !== expectedPhase)
      errors.push(`${context}: invalid phase ordering.`);
    expectedPhase =
      frame.phase === "compare"
        ? sum === target
          ? "found"
          : sum < target
            ? "move-left"
            : "move-right"
        : frame.phase === "found"
          ? undefined
          : "compare";
    // The comparison frame determines the pointer position shown by its next frame.
    if (frame.phase === "compare" && sum !== target) {
      if (sum < target) left += 1;
      else right -= 1;
    }
  }
  if (frames.at(-1)?.phase !== "found")
    errors.push(`${label}: the prepared example must end at a matching pair.`);
  return errors;
}

export function sourceForFrame(source: string, frame: TwoPointerFrame) {
  const lines = normalizeCodeSource(source).split("\n");
  return frame.lines.map((number) => ({
    number,
    text: lines[number - 1] ?? "",
  }));
}
