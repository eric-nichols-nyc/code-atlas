"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_LAYOUT,
  LAYOUT_KEY,
  measuredCapacity,
  parsePreferences,
  workspaceMode,
} from "../lib/layout";
import type { LayoutPreferences } from "../lib/types";

function readLayout() {
  try {
    return parsePreferences(localStorage.getItem(LAYOUT_KEY));
  } catch {
    return { ...DEFAULT_LAYOUT };
  }
}
function storeLayout(preferences: LayoutPreferences) {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(preferences));
  } catch {
    /* Layout remains usable when browser storage is denied. */
  }
}
export function useWorkspaceLayout() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_LAYOUT);
  const [capacity, setCapacity] = useState({ width: 0, height: 0 });
  useEffect(() => {
    setPreferences(readLayout());
    setReady(true);
    const measure = () => {
      const el = host.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = measuredCapacity(
        rect.width,
        rect.top,
        window.scrollY,
        window.innerHeight,
      );
      setCapacity((old) =>
        old.width === next.width && old.height === next.height ? old : next,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    if (host.current) observer?.observe(host.current);
    const header = document.querySelector("body > header, header");
    if (header) observer?.observe(header);
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, []);
  const save = useCallback((patch: Partial<LayoutPreferences>) => {
    setPreferences((old) => {
      const next = { ...old, ...patch };
      storeLayout(next);
      return next;
    });
  }, []);
  const mode = ready ? workspaceMode(capacity.width, capacity.height) : "flow";
  useLayoutEffect(() => {
    document.documentElement.dataset.learningWorkspace = mode;
    // Returning from the long reading flow must reveal the viewport-sized workspace.
    if (mode !== "flow" && window.scrollY !== 0)
      window.scrollTo({ top: 0, behavior: "instant" });
    return () => {
      delete document.documentElement.dataset.learningWorkspace;
    };
  }, [mode]);
  return {
    host,
    capacity,
    preferences,
    save,
    mode,
  };
}
