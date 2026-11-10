"use client";
import { Button } from "@workspace/ui/components/button";
import { RotateCcwIcon, Share2Icon } from "@workspace/ui/components/icons";
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher";
import dynamic from "next/dynamic";
import { useProblemSession } from "../state/problem-session";

const JavaScriptEditor = dynamic(() => import("./javascript-editor"), {
  ssr: false,
  loading: () => (
    <p className="p-4 text-sm text-muted-foreground" role="status">
      Loading JavaScript editor…
    </p>
  ),
});
export function CodePanel() {
  const s = useProblemSession();
  return (
    <section className="learning-panel" aria-label="Code editor">
      <div className="learning-panel-header justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 font-medium">Code</span>
          <span className="truncate text-xs text-muted-foreground">
            JavaScript
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Share code (coming soon)"
            title="Share code (coming soon)"
            disabled
          >
            <Share2Icon aria-hidden="true" data-icon="inline-start" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Reset code"
            title="Reset code"
            onClick={s.resetCode}
            disabled={Boolean(s.pending) || s.source === s.problem.starterCode}
          >
            <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
          </Button>
          <ThemeSwitcher />
        </div>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <JavaScriptEditor />
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Session draft · Tab moves focus out
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void s.execute("run")}
            disabled={Boolean(s.pending)}
          >
            {s.pending === "run" ? "Running…" : "Run"}
          </Button>
          <Button
            size="sm"
            onClick={() => void s.execute("submit")}
            disabled={Boolean(s.pending)}
          >
            {s.pending === "submit" ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </div>
    </section>
  );
}
