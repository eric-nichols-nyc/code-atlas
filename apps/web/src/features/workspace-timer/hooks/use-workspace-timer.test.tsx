import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { formatTime, useWorkspaceTimer } from "./use-workspace-timer";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-21T02:00:00Z"));
});
afterEach(() => vi.useRealTimers());

it("preserves fractional elapsed time across pause and resume", () => {
  const { result } = renderHook(useWorkspaceTimer);
  act(() => result.current.start());
  act(() => vi.advanceTimersByTime(1750));
  act(() => result.current.pause());
  expect(result.current.seconds).toBe(1);
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.seconds).toBe(1);
  act(() => result.current.start());
  act(() => vi.advanceTimersByTime(250));
  expect(result.current.seconds).toBe(2);
  act(() => result.current.reset());
  expect(result.current.seconds).toBe(0);
  expect(result.current.running).toBe(false);
});

it("catches up after throttling, completes at zero, and restarts the chosen duration", () => {
  const { result } = renderHook(useWorkspaceTimer);
  act(() => result.current.setMode("timer"));
  act(() => result.current.start(60));
  expect(result.current.seconds).toBe(60);
  act(() => {
    vi.setSystemTime(Date.now() + 45000);
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(result.current.seconds).toBe(15);
  act(() => {
    vi.setSystemTime(Date.now() + 90000);
    window.dispatchEvent(new Event("pageshow"));
  });
  expect(result.current.seconds).toBe(0);
  expect(result.current.phase).toBe("finished");
  expect(vi.getTimerCount()).toBe(0);
  act(() => result.current.start());
  expect(result.current.seconds).toBe(60);
  act(() => vi.advanceTimersByTime(1250));
  act(() => result.current.pause());
  expect(result.current.seconds).toBe(59);
  act(() => result.current.reset());
  expect(result.current.seconds).toBe(60);
  expect(result.current.running).toBe(false);
});

it("uses a changed countdown duration on the first start and clears it when changing mode", () => {
  const { result, unmount } = renderHook(useWorkspaceTimer);
  act(() => result.current.setMode("timer"));
  act(() => result.current.start(300));
  expect(result.current.seconds).toBe(300);
  act(() => result.current.setMode("stopwatch"));
  expect(result.current.seconds).toBe(0);
  expect(result.current.phase).toBe("idle");
  act(() => result.current.start());
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("formats hour boundaries without wrapping the stopwatch at a day", () => {
  expect(formatTime(59)).toBe("00:00:59");
  expect(formatTime(3600)).toBe("01:00:00");
  expect(formatTime(360061)).toBe("100:01:01");
});
