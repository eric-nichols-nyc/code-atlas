import {
  type CodeWalkthroughStep,
  validateCodeWalkthrough,
} from "./code-walkthrough";

export type TwoPointerFrame = CodeWalkthroughStep & {
  readonly phase: "initialize" | "compare" | "complete";
  readonly left: number;
  readonly right: number;
};

export type TwoPointerVisualizationDefinition = {
  readonly id: string;
  readonly title: string;
  readonly word: string;
  readonly source: string;
  readonly frames: readonly [TwoPointerFrame, ...TwoPointerFrame[]];
};

// Check the prepared palindrome trace against the letters at each pointer.
export function validateTwoPointerVisualization(
  definition: TwoPointerVisualizationDefinition,
) {
  const errors = validateCodeWalkthrough(
    { ...definition, steps: definition.frames },
    "Visualization",
  );
  const { word, frames } = definition;
  const label = `Visualization ${definition.id}`;
  if (!/^[a-z]{2,}$/.test(word))
    return [
      ...errors,
      `${label}: requires at least two lowercase English letters.`,
    ];
  let left = 0;
  let right = word.length - 1;
  let expectedPhase: TwoPointerFrame["phase"] | undefined = "initialize";
  for (const frame of frames) {
    const context = `${label}, frame ${frame.id}`;
    if (frame.left !== left || frame.right !== right)
      errors.push(
        `${context}: pointer positions do not follow the palindrome check.`,
      );
    if (frame.phase !== expectedPhase)
      errors.push(`${context}: invalid phase ordering.`);

    if (frame.phase === "initialize") {
      expectedPhase = "compare";
    } else if (frame.phase === "compare" && word[left] === word[right]) {
      left += 1;
      right -= 1;
      expectedPhase = left < right ? "compare" : "complete";
    } else {
      expectedPhase = undefined;
    }
  }
  if (expectedPhase !== undefined)
    errors.push(`${label}: the prepared example must reach a result.`);
  return errors;
}
