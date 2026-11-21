"use client";

import { useEffect, useReducer } from "react";

export type TimerMode = "stopwatch" | "timer";
type TimerState = {
  mode: TimerMode;
  duration: number;
  elapsed: number;
  startedAt: number | null;
  now: number;
  phase: "idle" | "running" | "paused" | "finished";
};
type Action =
  | { type: "mode"; mode: TimerMode }
  | { type: "start"; now: number; duration?: number }
  | { type: "pause" | "tick"; now: number }
  | { type: "reset" };

const initial: TimerState = {
  mode: "stopwatch",
  duration: 3600,
  elapsed: 0,
  startedAt: null,
  now: 0,
  phase: "idle",
};

function elapsedAt(state: TimerState, now: number) {
  return (
    state.elapsed +
    (state.startedAt === null ? 0 : Math.max(0, now - state.startedAt))
  );
}

function reduce(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case "mode":
      return action.mode === state.mode
        ? state
        : { ...initial, mode: action.mode, duration: state.duration };
    case "start": {
      if (state.phase === "running") return state;
      const duration = action.duration ?? state.duration;
      if (!Number.isInteger(duration) || duration <= 0 || duration > 359940)
        return state;
      return {
        ...state,
        duration,
        elapsed: state.phase === "finished" ? 0 : state.elapsed,
        startedAt: action.now,
        now: action.now,
        phase: "running",
      };
    }
    case "tick":
    case "pause": {
      if (state.phase !== "running") return state;
      const elapsed = elapsedAt(state, action.now);
      if (state.mode === "timer" && elapsed >= state.duration * 1000)
        return {
          ...state,
          elapsed: state.duration * 1000,
          startedAt: null,
          now: action.now,
          phase: "finished",
        };
      return action.type === "pause"
        ? {
            ...state,
            elapsed,
            startedAt: null,
            now: action.now,
            phase: "paused",
          }
        : { ...state, now: action.now };
    }
    case "reset":
      return { ...state, elapsed: 0, startedAt: null, phase: "idle" };
  }
}

export function formatTime(seconds: number) {
  return [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function useWorkspaceTimer() {
  const [state, dispatch] = useReducer(reduce, initial);
  const running = state.phase === "running";
  useEffect(() => {
    if (!running) return;
    const tick = () => dispatch({ type: "tick", now: Date.now() });
    const interval = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("pageshow", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("pageshow", tick);
    };
  }, [running]);
  const elapsed = elapsedAt(state, state.now);
  const seconds =
    state.mode === "stopwatch"
      ? Math.floor(elapsed / 1000)
      : Math.max(0, Math.ceil((state.duration * 1000 - elapsed) / 1000));
  return {
    ...state,
    seconds,
    running,
    setMode: (mode: TimerMode) => dispatch({ type: "mode", mode }),
    start: (duration?: number) =>
      dispatch({ type: "start", now: Date.now(), duration }),
    pause: () => dispatch({ type: "pause", now: Date.now() }),
    reset: () => dispatch({ type: "reset" }),
  };
}
