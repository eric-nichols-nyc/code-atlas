import { describe, expect, it } from "vitest";
import { twoPointersVisualization as example } from "@/content/shared/learn/two-pointers/visualization";
import {
  palindromeExample,
  twoPointersWalkthrough,
} from "@/content/shared/learn/two-pointers/walkthrough";
import { sourceForStep } from "./code-walkthrough";
import {
  type TwoPointerVisualizationDefinition,
  validateTwoPointerVisualization,
} from "./two-pointer-visualization";

describe("prepared Two Pointers visualization", () => {
  it("follows the racecar trace from the outside letters to the center", () => {
    expect(validateTwoPointerVisualization(example)).toEqual([]);
    expect(example.word).toBe(palindromeExample);
    expect(example.source).toBe(twoPointersWalkthrough.source);
    expect(
      example.frames.map(({ phase, left, right }) => [phase, left, right]),
    ).toEqual([
      ["initialize", 0, 6],
      ["compare", 0, 6],
      ["compare", 1, 5],
      ["compare", 2, 4],
      ["complete", 3, 3],
    ]);
    expect(
      example.frames
        .filter((frame) => frame.phase === "compare")
        .map(({ left, right }) => [example.word[left], example.word[right]]),
    ).toEqual([
      ["r", "r"],
      ["a", "a"],
      ["c", "c"],
    ]);
    const comparisonLines = [
      "const matches = text[left] === text[right];",
      "left += 1;",
      "right -= 1;",
    ];
    expect(
      example.frames.map((frame) =>
        sourceForStep(example.source, frame).map((line) => line.text.trim()),
      ),
    ).toEqual([
      ["let left = 0;", "let right = text.length - 1;"],
      comparisonLines,
      comparisonLines,
      comparisonLines,
      ["while (left < right) {", "return true;"],
    ]);
  });

  it.each([
    { ...example, word: "x" },
    { ...example, word: "" },
    { ...example, word: "RACECAR" },
    { ...example, word: "racecap" },
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
