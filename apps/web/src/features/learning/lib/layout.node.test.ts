import { describe, expect, it } from "vitest";
import {
  DEFAULT_LAYOUT,
  fitLayout,
  measuredCapacity,
  parsePreferences,
  workspaceMode,
} from "./layout";

describe("safe local dimensions", () => {
  it.each([
    null,
    "bad",
    "{}",
    '{"version":2}',
    JSON.stringify({ ...DEFAULT_LAYOUT, lessonWidthPx: null }),
    JSON.stringify({ ...DEFAULT_LAYOUT, codeSharePercent: 110 }),
  ])("rejects corrupt data %s", (raw) =>
    expect(parsePreferences(raw)).toEqual(DEFAULT_LAYOUT),
  );
  it("accepts a valid desired layout", () => {
    const p = { ...DEFAULT_LAYOUT, lessonWidthPx: 390 };
    expect(parsePreferences(JSON.stringify(p))).toEqual(p);
  });
  it("derives modes from width and remaining height", () => {
    expect(workspaceMode(1036, 510)).toBe("wide");
    expect(workspaceMode(1024, 800)).toBe("split");
    expect(workspaceMode(769, 800)).toBe("flow");
    expect(workspaceMode(1440, 509)).toBe("flow");
  });
  it("clamps side widths and center heights to readable bounds", () => {
    const p = fitLayout(
      {
        ...DEFAULT_LAYOUT,
        lessonWidthPx: 1000,
        lastTutorWidthPx: 1000,
        codeSharePercent: 99,
      },
      1036,
      510,
      true,
    );
    expect(p.lessonWidthPx).toBe(280);
    expect(p.lastTutorWidthPx).toBe(256);
    expect(p.codeSharePercent).toBe(48);
    expect(fitLayout(DEFAULT_LAYOUT, 1400, 800, false).lessonWidthPx).toBe(340);
  });
  it("does not inflate desktop height after scrolling a mobile lesson", () => {
    expect(measuredCapacity(1440, 110, 0, 900)).toEqual({
      width: 1416,
      height: 766,
    });
    expect(measuredCapacity(1440, -1221, 1331, 900)).toEqual({
      width: 1416,
      height: 766,
    });
  });
});
