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
import { useEffect, useMemo, useRef, useState } from "react";
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
      <Workspace />
    </div>
  );
}

function Workspace() {
  const [source, setSource] = useState(exercise.starter);
  const [submission, setSubmission] = useState<{
    code: string;
    revision: number;
  } | null>(null);
  const editorState = useRef<EditorState | null>(null);
  const editorTheme = useRef<Compartment | null>(null);
  const editorCallbacks = useRef<{
    setSource: (source: string) => void;
    run: () => void;
  } | null>(null);
  const submit = () => {
    const code = editorState.current?.doc.toString() ?? source;
    setSubmission((previous) => ({
      code,
      revision: (previous?.revision ?? 0) + 1,
    }));
  };
  editorCallbacks.current = { setSource, run: submit };
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
                Edit App.tsx to try a fix, then select Submit to render it. Ask
                the tutor about your current code.
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSource(exercise.starter)}
                  >
                    Reset code
                  </Button>
                  <Button size="sm" onClick={submit}>
                    Submit
                  </Button>
                </div>
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
                submits
              </p>
            </section>
            <section className="learning-panel" aria-label="React output">
              {submission ? (
                <SubmittedOutput
                  key={submission.revision}
                  code={submission.code}
                />
              ) : (
                <>
                  <header className="learning-panel-header">
                    <h2>Preview</h2>
                  </header>
                  <div className="flex h-[300px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
                    Submit your code to render the React preview.
                  </div>
                </>
              )}
              <p
                role="status"
                className="border-t px-3 py-2 text-xs text-muted-foreground"
              >
                {!submission
                  ? "Ready to submit."
                  : source !== submission.code
                    ? "Code changed since last submission. Select Submit to update the preview."
                    : "Showing submitted code."}
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

function SubmittedOutput({ code }: { code: string }) {
  const submittedFiles = useMemo(
    () => ({ ...files, "/App.tsx": code }),
    [code],
  );
  return (
    <SandpackProvider
      template="react-ts"
      theme={theme}
      customSetup={setup}
      files={submittedFiles}
      options={{ initMode: "immediate", autorun: false, bundlerTimeOut: 30000 }}
    >
      <OutputPanels />
    </SandpackProvider>
  );
}

function OutputPanels() {
  const { sandpack } = useSandpack();
  const error = sandpack.error && (
    <p role="alert" className="border-b p-3 text-sm text-destructive">
      {sandpack.error.path ?? "/App.tsx"}: {sandpack.error.message}
    </p>
  );
  return (
    <>
      <Tabs defaultValue="preview" className="gap-0">
        <div className="learning-panel-header">
          <TabsList variant="line">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="console">Console / errors</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="preview"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          {error}
          <Preview />
        </TabsContent>
        <TabsContent
          value="console"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          {error}
          <SandpackConsole
            showSyntaxError
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
          ? " · Preview service unavailable. Select Submit to retry."
          : ""}
      </p>
    </>
  );
}

function Preview() {
  const runtime = useSandpackClient();
  const current = useRef(runtime);
  current.current = runtime;
  useEffect(() => {
    // Start only this submitted snapshot, after development effect replay settles.
    const timer = setTimeout(
      () => void current.current.sandpack.runSandpack(),
      0,
    );
    return () => clearTimeout(timer);
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
