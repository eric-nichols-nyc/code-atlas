"use client";
import type { Compartment, EditorState } from "@codemirror/state";
import {
  SandpackConsole,
  SandpackProvider,
  type SandpackTheme,
  useSandpack,
  useSandpackClient,
} from "@codesandbox/sandpack-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useTheme } from "@workspace/ui/components/theme-provider";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { CodeEditor } from "@/features/problems/components/javascript-editor";
import { ProblemTutor } from "@/features/problems/components/problem-tutor";
import { parseTutorRequest } from "@/features/problems/lib/problem-tutor-contract";
import { TutorSession } from "@/features/problems/state/problem-tutor";
import { reactPrototypeExercise as exercise } from "./exercise";
import styles from "./sandbox.module.css";

const theme: SandpackTheme = {
  colors: {
    surface1: "var(--card)",
    surface2: "var(--muted)",
    surface3: "var(--accent)",
    clickable: "var(--muted-foreground)",
    base: "var(--foreground)",
    disabled: "var(--muted-foreground)",
    hover: "var(--foreground)",
    accent: "var(--primary)",
    error: "var(--destructive)",
    errorSurface: "var(--muted)",
  },
  syntax: {
    plain: "var(--foreground)",
    comment: "var(--code-comment)",
    keyword: "var(--code-keyword)",
    definition: "var(--foreground)",
    punctuation: "var(--foreground)",
    property: "var(--foreground)",
    tag: "var(--code-keyword)",
    static: "var(--code-string)",
    string: "var(--code-string)",
  },
  font: {
    body: "system-ui, sans-serif",
    mono: "Menlo, monospace",
    size: "13px",
    lineHeight: "24px",
  },
};

// Stable inputs prevent Sandpack from resetting the draft on a theme change.
const files = {
  "/App.tsx": exercise.starter,
  "/styles.css": { code: exercise.css, hidden: true },
};
const setup = { dependencies: { react: "19.3.1", "react-dom": "19.3.1" } };

export function ReactSandbox() {
  const { resolvedTheme } = useTheme();
  return (
    <div className={styles.host} data-theme={resolvedTheme}>
      <SandpackProvider
        template="react-ts"
        theme={theme}
        customSetup={setup}
        files={files}
        options={{
          activeFile: "/App.tsx",
          visibleFiles: ["/App.tsx"],
          initMode: "immediate",
          autorun: false,
          recompileMode: "delayed",
          recompileDelay: 350,
          bundlerTimeOut: 30000,
        }}
      >
        <Workspace />
      </SandpackProvider>
    </div>
  );
}

function Workspace() {
  const { sandpack, dispatch } = useSandpack();
  const currentSandpack = useRef(sandpack);
  currentSandpack.current = sandpack;
  useEffect(() => {
    // Defer startup until React's development effect replay has settled. Sandpack
    // 2.20 can otherwise create overlapping clients for the same iframe.
    const timer = setTimeout(
      () => void currentSandpack.current.runSandpack(),
      0,
    );
    return () => clearTimeout(timer);
  }, []);
  const source = sandpack.files["/App.tsx"]?.code ?? exercise.starter;
  const editorState = useRef<EditorState | null>(null);
  const editorTheme = useRef<Compartment | null>(null);
  const editorCallbacks = useRef<{
    setSource: (source: string) => void;
    run: () => void;
  } | null>(null);
  const restart = () => {
    if (sandpack.status === "timeout" || sandpack.status === "idle")
      void sandpack.runSandpack();
    else dispatch({ type: "refresh" });
  };
  editorCallbacks.current = {
    setSource: (value) => sandpack.updateFile("/App.tsx", value),
    run: restart,
  };
  return (
    <TutorSession
      key={exercise.id}
      workspace={{
        id: exercise.id,
        source,
        readCurrentSource: () => editorState.current?.doc.toString() ?? source,
        validateRequest: (value) => parseTutorRequest(value),
        feedback: () => ({}),
        endpoint: "/api/react-prototype/tutor",
      }}
    >
      <main
        data-layout="flow"
        className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-col gap-4 p-3 md:p-5"
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">← Dashboard</Link>
            </Button>
            <Badge variant="secondary">React sandbox prototype</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Session draft · no judging or saved progress
          </p>
        </header>
        <div className={styles.columns}>
          <section
            className="learning-panel self-start"
            aria-label="React exercise"
          >
            <div className="flex flex-col gap-5 p-5">
              <div className="flex gap-2">
                <Badge variant="secondary">React</Badge>
                <Badge variant="amber">Medium</Badge>
              </div>
              <h1 className="text-2xl leading-8 font-semibold">
                {exercise.title}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {exercise.statement}
              </p>
              <h2 className="font-semibold">Requirements</h2>
              <ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-6 text-muted-foreground">
                {exercise.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-xs leading-5 text-muted-foreground">
                Edit App.tsx to try a fix. The preview updates after a short
                pause. Ask the tutor about your current code.
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                The hosted CodeSandbox preview receives these example files.
                Keep credentials out of sandbox code.
              </p>
            </div>
          </section>
          <div className="flex min-w-0 flex-col gap-3">
            <section
              className="learning-panel"
              aria-label="React TypeScript editor"
            >
              <header className="learning-panel-header flex-wrap justify-between gap-2">
                <h2>
                  Code{" "}
                  <span className="ml-2 text-muted-foreground">
                    App.tsx · TypeScript
                  </span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sandpack.resetFile("/App.tsx")}
                >
                  Reset code
                </Button>
              </header>
              <div className={styles.editor}>
                <CodeEditor
                  typescript
                  session={{
                    source,
                    editorState,
                    editorTheme,
                    editorCallbacks,
                  }}
                />
              </div>
              <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                {source.length} characters · Tab moves focus out · Mod-Enter
                restarts preview
              </p>
            </section>
            <section className="learning-panel" aria-label="React output">
              <Tabs defaultValue="preview" className="gap-0">
                <div className="learning-panel-header justify-between">
                  <TabsList variant="line">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="console">Console / errors</TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="sm" onClick={restart}>
                    Restart
                  </Button>
                </div>
                <TabsContent
                  value="preview"
                  forceMount
                  className="data-[state=inactive]:hidden"
                >
                  {sandpack.error && (
                    <p
                      role="alert"
                      className="border-b p-3 text-sm text-destructive"
                    >
                      {sandpack.error.path ?? "/App.tsx"}:{" "}
                      {sandpack.error.message}
                    </p>
                  )}
                  <Preview />
                </TabsContent>
                <TabsContent
                  value="console"
                  forceMount
                  className="data-[state=inactive]:hidden"
                >
                  {sandpack.error && (
                    <p
                      role="alert"
                      className="border-b p-3 text-sm text-destructive"
                    >
                      {sandpack.error.path ?? "/App.tsx"}:{" "}
                      {sandpack.error.message}
                    </p>
                  )}
                  <SandpackConsole
                    showSyntaxError
                    resetOnPreviewRestart
                    showRestartButton={false}
                    showHeader
                    maxMessageCount={100}
                    style={{ height: 300 }}
                  />
                </TabsContent>
              </Tabs>
              <p
                role="status"
                className="border-t px-3 py-2 text-xs text-muted-foreground"
              >
                Preview: {sandpack.status}
                {sandpack.status === "timeout"
                  ? " · Preview service unavailable. Use Restart to retry."
                  : ""}
                {sandpack.error ? ` · ${sandpack.error.message}` : ""}
              </p>
            </section>
          </div>
          <section
            className={`learning-panel ${styles.tutor}`}
            aria-label="Tutor panel"
          >
            <header className="learning-panel-header">
              <h2>AI tutor</h2>
            </header>
            <div className="min-h-0 flex-1">
              <ProblemTutor />
            </div>
          </section>
        </div>
      </main>
    </TutorSession>
  );
}

function Preview() {
  const runtime = useSandpackClient();
  const current = useRef(runtime);
  current.current = runtime;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = current.current.listen((message) => {
      if (message.type !== "done") return;
      // Sandpack skips file updates while compiling. Flush a newer edit after
      // completion instead of leaving the preview on the previous source.
      timer = setTimeout(() => {
        const { sandpack, getClient } = current.current;
        const client = getClient();
        if (
          client?.sandboxSetup.files["/App.tsx"]?.code !==
          sandpack.files["/App.tsx"]?.code
        )
          client?.updateSandbox({
            files: sandpack.files,
            template: sandpack.environment,
          });
      }, 0);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  return (
    <iframe
      ref={runtime.iframe}
      title="React live preview"
      sandbox="allow-scripts allow-same-origin"
      allow="camera 'none'; microphone 'none'; geolocation 'none'; clipboard-read 'none'; clipboard-write 'none'"
      referrerPolicy="no-referrer"
      className={styles.preview}
    />
  );
}
