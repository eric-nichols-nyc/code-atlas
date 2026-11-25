import {
  type CodeWalkthroughStep,
  validateCodeWalkthrough,
} from "./code-walkthrough";

export type SlidingWindowFrame = CodeWalkthroughStep & {
  readonly phase: "initialize" | "slide" | "complete";
  readonly start: number;
  readonly sum: number;
  readonly best: number;
};

export type SlidingWindowVisualizationDefinition = {
  readonly id: string;
  readonly title: string;
  readonly values: readonly number[];
  readonly size: number;
  readonly source: string;
  readonly frames: readonly [SlidingWindowFrame, ...SlidingWindowFrame[]];
};

export function validateSlidingWindowVisualization(
  definition: SlidingWindowVisualizationDefinition,
) {
  const { id, values, size, frames } = definition;
  const errors = validateCodeWalkthrough(
    { ...definition, steps: frames },
    "Sliding window visualization",
  );
  if (errors.length) return errors;
  if (
    !Number.isInteger(size) ||
    size < 1 ||
    size > values.length ||
    !values.every(Number.isFinite)
  )
    return [
      `Visualization ${id}: requires finite values and a valid window size.`,
    ];

  const lastStart = values.length - size;
  if (frames.length !== lastStart + 2)
    return [
      `Visualization ${id}: show each window in order and one return frame.`,
    ];

  let sum = values.slice(0, size).reduce((total, value) => total + value, 0);
  let best = sum;
  for (const [index, frame] of frames.entries()) {
    const start = Math.min(index, lastStart);
    const phase =
      index === 0 ? "initialize" : index > lastStart ? "complete" : "slide";
    if (phase === "slide") {
      sum -= values[start - 1] ?? 0;
      sum += values[start + size - 1] ?? 0;
      best = Math.max(best, sum);
    }
    if (
      frame.start !== start ||
      frame.phase !== phase ||
      frame.sum !== sum ||
      frame.best !== best ||
      !Number.isFinite(sum)
    )
      errors.push(
        `Visualization ${id}, frame ${frame.id}: expected window ${start}, sum ${sum}, best ${best}, and phase ${phase}.`,
      );
  }
  return errors;
}
