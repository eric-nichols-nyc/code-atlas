"use client";

import type { Compartment, EditorState } from "@codemirror/state";
import { Button } from "@workspace/ui/components/button";
import {
  Clock3Icon,
  FileCode2Icon,
  PlayIcon,
  SparklesIcon,
  TerminalIcon,
} from "@workspace/ui/components/icons";
import { cn } from "@workspace/ui/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { CodeEditorSession } from "@/features/problems/components/javascript-editor";
import { isPlaygroundResult, type PlaygroundRunSnapshot } from "../run-result";
import { PlaygroundTutor, useDockedPlaygroundTutor } from "./playground-tutor";

const CodeEditor = dynamic(
  () =>
    import("@/features/problems/components/javascript-editor").then(
      (module) => module.CodeEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="p-4 text-muted-foreground text-sm" role="status">
        Loading JavaScript editor…
      </p>
    ),
  },
);

const starter = `const nums = [2, 4, 6]
const out = nums.map(
  n => n * 2
)

console.log(nums)
console.log(out)`;

const resultLabels = {
  finished: "Finished",
  error: "Error",
  "time-limit-exceeded": "Time limit exceeded",
};

export function Playground() {
  const [source, setSource] = useState(starter);
  const [latest, setLatest] = useState<PlaygroundRunSnapshot | null>(null);
  const [requestError, setRequestError] = useState("");
  const [pending, setPending] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const tutorTrigger = useRef<HTMLButtonElement>(null);
  const tutorDocked = useDockedPlaygroundTutor();
  const activeRun = useRef<AbortController | null>(null);
  const editorState = useRef<EditorState | null>(null);
  const editorTheme = useRef<Compartment | null>(null);
  const editorCallbacks =
    useRef<CodeEditorSession["editorCallbacks"]["current"]>(null);
  useEffect(
    () => () => {
      activeRun.current?.abort();
      activeRun.current = null;
    },
    [],
  );

  const readCurrentSource = () => editorState.current?.doc.toString() ?? source;

  async function run() {
    if (activeRun.current) return;
    const snapshot = readCurrentSource();
    if (!snapshot.trim()) {
      setRequestError("Enter JavaScript to run.");
      return;
    }
    const controller = new AbortController();
    activeRun.current = controller;
    setPending(true);
    setRequestError("");
    try {
      const response = await fetch("/api/javascript/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: snapshot }),
        signal: controller.signal,
      });
      const body: unknown = await response.json();
      if (controller.signal.aborted) return;
      if (response.ok && isPlaygroundResult(body)) {
        setLatest({ source: snapshot, result: body });
      } else if (
        !response.ok &&
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        setRequestError(body.error);
      } else {
        setRequestError("The runner returned an invalid response. Try again.");
      }
    } catch {
      if (!controller.signal.aborted)
        setRequestError("The runner is unavailable. Your draft is still here.");
    } finally {
      if (activeRun.current === controller) {
        activeRun.current = null;
        setPending(false);
      }
    }
  }

  editorCallbacks.current = { setSource, run: () => void run() };

  const result = latest?.result;
  const status = pending
    ? "Running"
    : requestError
      ? "Unable to run"
      : result
        ? resultLabels[result.status]
        : "Ready";
  const stale =
    !pending && latest && (latest.source !== source || requestError);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 md:px-6 md:py-9">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-semibold text-3xl tracking-tight md:text-[40px]">
            Playground
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm">
            Your draft lasts until you leave or reload.
          </p>
        </div>
        <Button
          ref={tutorTrigger}
          type="button"
          size="sm"
          variant={tutorOpen ? "secondary" : "outline"}
          className="pointer-coarse:min-h-11"
          aria-expanded={tutorOpen}
          aria-label={tutorOpen ? "Hide AI tutor" : "Show AI tutor"}
          aria-controls={tutorOpen ? "playground-tutor" : undefined}
          aria-haspopup={tutorDocked ? undefined : "dialog"}
          onClick={() => setTutorOpen((open) => !open)}
        >
          <SparklesIcon aria-hidden="true" />
          AI tutor
        </Button>
      </header>
      <div
        className={cn(
          "mt-5 grid gap-3 md:mt-6 md:min-h-[30rem] md:grow md:basis-0 md:grid-rows-[minmax(0,1fr)]",
          tutorOpen && tutorDocked
            ? "md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_20rem]"
            : "md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
        )}
      >
        <section className="learning-panel" aria-labelledby="playground-source">
          <div className="learning-panel-header min-h-12 justify-between bg-muted/55 py-1.5">
            <h2
              id="playground-source"
              className="flex items-center gap-2 font-medium"
            >
              <FileCode2Icon
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              script.js
            </h2>
            <Button
              type="button"
              size="sm"
              className="pointer-coarse:min-h-11 aria-disabled:opacity-60"
              onClick={() => void run()}
              aria-disabled={pending}
              aria-label="Run"
              aria-keyshortcuts="Meta+Enter Control+Enter"
            >
              <PlayIcon aria-hidden="true" className="size-3.5 fill-current" />
              Run
              <kbd className="hidden border-s border-current/25 ps-1.5 text-xs sm:inline">
                Ctrl/⌘ ↵
              </kbd>
            </Button>
          </div>
          <div className="h-[clamp(20rem,48svh,32rem)] min-h-0 min-w-0 overflow-hidden md:h-auto md:flex-1">
            <CodeEditor
              label="JavaScript source"
              session={{ source, editorState, editorTheme, editorCallbacks }}
            />
          </div>
        </section>
        <section
          className="learning-panel min-h-40 md:min-h-0"
          aria-labelledby="playground-console"
        >
          <div className="learning-panel-header min-h-12 justify-between bg-muted/55 py-1.5">
            <h2
              id="playground-console"
              className="flex items-center gap-2 font-medium"
            >
              <TerminalIcon
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Console
            </h2>
            <p
              role="status"
              className={cn(
                "flex items-center gap-1.5 text-xs",
                pending || (!requestError && !result)
                  ? "text-muted-foreground"
                  : !requestError && result?.status === "finished"
                    ? "text-interactive"
                    : "text-destructive",
              )}
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-current"
              />
              {status}
            </p>
          </div>
          {stale && (
            <p className="flex shrink-0 items-center gap-2 border-b bg-badge-amber px-3 py-2 text-badge-amber-foreground text-xs">
              <Clock3Icon aria-hidden="true" className="size-3.5 shrink-0" />
              Output is from your last run.
            </p>
          )}
          <div className="min-h-0 overflow-y-auto md:flex-1">
            {!pending && requestError && (
              <p className="px-3 py-3 text-destructive text-sm" role="alert">
                {requestError}
              </p>
            )}
            <div aria-live="polite">
              {!pending &&
                (result ? (
                  <>
                    {result.logs.length > 0 && (
                      <ol className="divide-y" aria-label="Console output">
                        {result.logs.map((line, index) => (
                          <li
                            // biome-ignore lint/suspicious/noArrayIndexKey: Logs can repeat and remain in immutable order within a run.
                            key={index}
                            className="flex gap-2 px-3 py-2 font-mono text-[13px] leading-6"
                          >
                            <span
                              aria-hidden="true"
                              className="text-muted-foreground"
                            >
                              ›
                            </span>
                            <code className="min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]">
                              {line}
                            </code>
                          </li>
                        ))}
                      </ol>
                    )}
                    {result.status !== "finished" ? (
                      <p className="whitespace-pre-wrap px-3 py-3 font-mono text-destructive text-sm [overflow-wrap:anywhere]">
                        {result.message}
                      </p>
                    ) : result.logs.length === 0 ? (
                      <p className="px-3 py-3 text-muted-foreground text-sm">
                        Script finished without console output.
                      </p>
                    ) : null}
                  </>
                ) : (
                  !requestError && (
                    <p className="px-3 py-3 text-muted-foreground text-sm">
                      Run your code to see logs and errors.
                    </p>
                  )
                ))}
            </div>
          </div>
        </section>
        <PlaygroundTutor
          open={tutorOpen}
          docked={tutorDocked}
          onOpenChange={setTutorOpen}
          trigger={tutorTrigger}
          source={source}
          readCurrentSource={readCurrentSource}
          latest={latest}
        />
      </div>
    </main>
  );
}
