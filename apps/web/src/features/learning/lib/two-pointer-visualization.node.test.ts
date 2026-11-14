import { describe, expect, it } from "vitest";
import { twoPointersExample } from "@/content/javascript/learn/two-pointers/example";
import { twoPointersVisualization as example } from "@/content/javascript/learn/two-pointers/visualization";
import { twoPointersWalkthrough } from "@/content/javascript/learn/two-pointers/walkthrough";
import {
  sourceForFrame,
  type TwoPointerVisualizationDefinition,
  validateTwoPointerVisualization,
} from "./two-pointer-visualization";

describe("prepared Two Pointers visualization", () => {
  it("follows the canonical sorted sample through all seven snapshots", () => {
    expect(validateTwoPointerVisualization(example)).toEqual([]);
    expect(example.numbers).toBe(twoPointersExample.numbers);
    expect(example.target).toBe(twoPointersExample.target);
    expect(example.source).toBe(twoPointersWalkthrough.source);
    expect(
      example.frames.map(({ phase, left, right }) => [phase, left, right]),
    ).toEqual([
      ["initialize", 0, 4],
      ["compare", 0, 4],
      ["move-right", 0, 3],
      ["compare", 0, 3],
      ["move-left", 1, 3],
      ["compare", 1, 3],
      ["found", 1, 3],
    ]);
    expect(
      example.frames
        .filter((frame) => frame.phase === "compare")
        .map(
          (frame) =>
            (example.numbers[frame.left] ?? 0) +
            (example.numbers[frame.right] ?? 0),
        ),
    ).toEqual([12, 8, 9]);
    expect(
      example.frames.map((frame) =>
        sourceForFrame(example.source, frame).map((line) => line.text.trim()),
      ),
    ).toEqual([
      ["let left = 0;", "let right = numbers.length - 1;"],
      ["const sum = numbers[left] + numbers[right];"],
      ["else right -= 1;"],
      ["const sum = numbers[left] + numbers[right];"],
      ["if (sum < target) left += 1;"],
      ["const sum = numbers[left] + numbers[right];"],
      ["if (sum === target) return [left, right];"],
    ]);
  });

  it.each([
    { ...example, numbers: [2, 1] },
    { ...example, numbers: [] },
    { ...example, numbers: [1, Number.NaN] },
    { ...example, target: Number.POSITIVE_INFINITY },
    { ...example, frames: [] },
    {
      ...example,
      frames: [{ ...example.frames[0], left: 1 }, ...example.frames.slice(1)],
    },
    {
      ...example,
      frames: [{ ...example.frames[0], right: 99 }, ...example.frames.slice(1)],
    },
    {
      ...example,
      frames: [
        { ...example.frames[0], lines: [99] },
        ...example.frames.slice(1),
      ],
    },
    {
      ...example,
      frames: [
        { ...example.frames[0], explanation: "" },
        ...example.frames.slice(1),
      ],
    },
    { ...example, frames: [...example.frames.slice(0, -1)] },
    {
      ...example,
      frames: [
        example.frames[0],
        example.frames[0],
        ...example.frames.slice(2),
      ],
    },
    {
      ...example,
      frames: [
        example.frames[0],
        example.frames[2],
        example.frames[1],
        ...example.frames.slice(3),
      ],
    },
  ])(
    "rejects invalid prepared data or an incorrect search sequence",
    (definition) => {
      expect(
        validateTwoPointerVisualization(
          definition as TwoPointerVisualizationDefinition,
        ).length,
      ).toBeGreaterThan(0);
    },
  );
});
