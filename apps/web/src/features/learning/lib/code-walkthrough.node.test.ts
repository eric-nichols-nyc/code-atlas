import { describe, expect, it } from "vitest";
import { javascriptLearningCatalog } from "@/content/javascript/learn/catalog";
import { learningWalkthroughs } from "@/content/javascript/learn/walkthroughs";
import { twoPointersWalkthrough } from "@/content/shared/learn/two-pointers/walkthrough";
import {
  type CodeWalkthroughDefinition,
  normalizeCodeSource,
  validateCodeWalkthrough,
  validateWalkthroughRegistry,
} from "./code-walkthrough";

const valid: CodeWalkthroughDefinition = {
  id: "example",
  title: "Example",
  source: "let left = 0;\n\nleft += 1;",
  steps: [
    { id: "start", explanation: "Start at zero.", lines: [1] },
    { id: "move", explanation: "Move once.", lines: [1, 3] },
  ],
};

describe("walkthrough authoring validation", () => {
  it("publishes the palindrome example with six aligned concepts", () => {
    expect(
      validateWalkthroughRegistry(
        learningWalkthroughs,
        javascriptLearningCatalog
          .filter((entry) => entry.status === "published")
          .map((entry) => entry.slug),
      ),
    ).toEqual([]);
    const sourceLines = twoPointersWalkthrough.source.split("\n");
    expect(sourceLines).toHaveLength(17);
    expect(twoPointersWalkthrough.steps.map((step) => step.id)).toEqual([
      "initialize",
      "loop",
      "compare",
      "mismatch",
      "move-inward",
      "complete",
    ]);
    expect(
      twoPointersWalkthrough.steps.map((step) =>
        step.lines.map((line) => sourceLines[line - 1]?.trim()),
      ),
    ).toEqual([
      ["let left = 0;", "let right = text.length - 1;"],
      ["while (left < right) {"],
      ["const matches = text[left] === text[right];"],
      ["if (!matches) return false;"],
      ["left += 1;", "right -= 1;"],
      ["return true;"],
    ]);
    expect(sourceLines.slice(15)).toEqual([
      'isPalindrome("racecar"); // true',
      'isPalindrome("hello"); // false',
    ]);
  });
  it("allows shared line references across steps and normalizes line endings", () => {
    expect(normalizeCodeSource("one\r\n\rtwo\n")).toBe("one\n\ntwo\n");
    expect(validateCodeWalkthrough(valid)).toEqual([]);
    expect(
      validateCodeWalkthrough({
        ...valid,
        source: valid.source.replaceAll("\n", "\r\n"),
      }),
    ).toEqual([]);
  });

  it.each([
    null,
    {},
    ...["id", "title", "source"].map((field) => ({ ...valid, [field]: " " })),
    { ...valid, steps: [] },
    { ...valid, steps: null },
    { ...valid, steps: [null] },
    { ...valid, steps: [{ ...valid.steps[0], id: "" }] },
    { ...valid, steps: [valid.steps[0], valid.steps[0]] },
    { ...valid, steps: [{ ...valid.steps[0], explanation: " " }] },
  ])("rejects missing content or duplicate step identities: %j", (value) => {
    expect(validateCodeWalkthrough(value).length).toBeGreaterThan(0);
  });

  it.each([[], [0], [-1], [1.5], [4], [1, 1], ["1"], [Number.NaN], null])(
    "identifies invalid line references %j with walkthrough and step context",
    (lines) => {
      expect(
        validateCodeWalkthrough({
          ...valid,
          steps: [{ ...valid.steps[0], lines }],
        }),
      ).toEqual([
        "Walkthrough example, step start: lines must be distinct integers from 1 to 3.",
      ]);
    },
  );

  it("counts intentional blank lines and a terminal newline consistently", () => {
    expect(
      validateCodeWalkthrough({
        ...valid,
        source: "one\n\n",
        steps: [{ ...valid.steps[0], lines: [2, 3] }],
      }),
    ).toEqual([]);
  });

  it("checks identities across the registry and published module associations", () => {
    const entry = { moduleSlug: "two-pointers", walkthrough: valid };
    expect(validateWalkthroughRegistry([entry], ["two-pointers"])).toEqual([]);
    expect(
      validateWalkthroughRegistry([entry, entry], ["two-pointers"]),
    ).toEqual([
      "Module two-pointers, walkthrough example: duplicate walkthrough id.",
    ]);
    expect(validateWalkthroughRegistry([entry], [])).toEqual([
      "Module two-pointers, walkthrough: module is not published.",
    ]);
  });
});
