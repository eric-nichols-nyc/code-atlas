import type { LayoutPreferences } from "./types";
export const LAYOUT_KEY = "code-atlas:learning-layout:v1";
export const DEFAULT_LAYOUT: LayoutPreferences = {
  version: 1,
  lessonWidthPx: 340,
  lastTutorWidthPx: 288,
  codeSharePercent: 54,
};
export function parsePreferences(raw: string | null): LayoutPreferences {
  try {
    const p = JSON.parse(raw ?? "null");
    if (
      p &&
      Object.keys(p).length === 4 &&
      p.version === 1 &&
      Number.isFinite(p.lessonWidthPx) &&
      p.lessonWidthPx >= 280 &&
      p.lessonWidthPx <= 2000 &&
      Number.isFinite(p.lastTutorWidthPx) &&
      p.lastTutorWidthPx >= 256 &&
      p.lastTutorWidthPx <= 2000 &&
      Number.isFinite(p.codeSharePercent) &&
      p.codeSharePercent > 0 &&
      p.codeSharePercent < 100
    )
      return p;
  } catch {}
  return { ...DEFAULT_LAYOUT };
}
export function workspaceMode(width: number, height: number) {
  return height < 510 || width < 770 ? "flow" : width < 1036 ? "split" : "wide";
}
export function fitLayout(
  p: LayoutPreferences,
  width: number,
  height: number,
  tutor: boolean,
): LayoutPreferences {
  const maxLesson = Math.min(440, width - 480 - 10 - (tutor ? 266 : 0));
  const lesson = Math.max(280, Math.min(p.lessonWidthPx, maxLesson));
  const right = Math.max(
    256,
    Math.min(p.lastTutorWidthPx, 360, width - lesson - 480 - 20),
  );
  const usableHeight = Math.max(500, height - 10);
  return {
    ...p,
    lessonWidthPx: lesson,
    lastTutorWidthPx: right,
    codeSharePercent: Math.max(
      (240 / usableHeight) * 100,
      Math.min(p.codeSharePercent, ((usableHeight - 260) / usableHeight) * 100),
    ),
  };
}

export function measuredCapacity(
  width: number,
  viewportTop: number,
  scrollY: number,
  viewportHeight: number,
) {
  return {
    width: Math.max(0, width - 24),
    height: Math.max(0, viewportHeight - (viewportTop + scrollY) - 24),
  };
}
