import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";
import { slidingWindowVisualization as example } from "@/content/shared/learn/sliding-window/visualization";
import { slidingWindowWalkthrough } from "@/content/shared/learn/sliding-window/walkthrough";
import { sourceForStep } from "./code-walkthrough";
import { validateSlidingWindowVisualization } from "./sliding-window-visualization";

it("tracks every three-value window and maps its steps to the walkthrough source", () => {
  expect(validateSlidingWindowVisualization(example)).toEqual([]);
  expect(example.source).toBe(slidingWindowWalkthrough.source);
  expect(
    example.frames.map(({ start, sum, best }) => [start, sum, best]),
  ).toEqual([
    [0, 6, 6],
    [1, 10, 10],
    [2, 11, 11],
    [3, 16, 16],
    [3, 16, 16],
  ]);

  const slideLines = [
    "const left = right - size;",
    "sum -= values[left];",
    "sum += values[right];",
    "best = Math.max(best, sum);",
  ];
  expect(
    example.frames.map((frame) =>
      sourceForStep(example.source, frame).map((line) => line.text.trim()),
    ),
  ).toEqual([
    ["let sum = 0;", "sum += values[i];", "let best = sum;"],
    slideLines,
    slideLines,
    slideLines,
    ["return best;"],
  ]);
});

it("returns the maximum from the displayed JavaScript, including decreasing and negative windows", () => {
  expect(runInNewContext(slidingWindowWalkthrough.source)).toBe(16);
  expect(
    runInNewContext(
      `${slidingWindowWalkthrough.source}
      [maxWindowSum([5, 3, 1], 2), maxWindowSum([-5, -2, -9], 2),
       maxWindowSum([-4, 2], 1), maxWindowSum([2, 3], 2)];`,
    ),
  ).toEqual([8, -7, 2, 5]);
});

it("rejects invalid size, skipped windows, incorrect totals, and broken source references", () => {
  expect(
    validateSlidingWindowVisualization({ ...example, size: 0 }),
  ).not.toEqual([]);
  const [first, second, ...rest] = example.frames;
  for (const frame of [
    { ...second, start: 2 },
    { ...second, sum: 11 },
    { ...second, best: 6 },
    { ...second, lines: [99] },
  ]) {
    expect(
      validateSlidingWindowVisualization({
        ...example,
        frames: [first, frame, ...rest],
      }),
    ).not.toEqual([]);
  }
  expect(
    validateSlidingWindowVisualization({
      ...example,
      frames: [first, ...rest],
    }),
  ).not.toEqual([]);
});
