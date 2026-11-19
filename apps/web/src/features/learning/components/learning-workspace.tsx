"use client";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon, SparklesIcon } from "@workspace/ui/components/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";
import { useWorkspaceLayout } from "../hooks/use-workspace-layout";
import {
  ResizableWorkspace,
  type WorkspaceHandle,
} from "./resizable-workspace";
export function LearningWorkspace({
  lesson,
  code,
  output,
  tutor,
  backHref = "/javascript/practice",
  subjectTitle = "JavaScript",
}: {
  lesson: ReactNode;
  code: ReactNode;
  output?: ReactNode;
  tutor: ReactNode;
  backHref?: string;
  subjectTitle?: string;
}) {
  const layout = useWorkspaceLayout();
  const [tutorOpen, setTutorOpen] = useState(false);
  const toolTrigger = useRef<HTMLButtonElement>(null);
  const api = useRef<WorkspaceHandle>(null);
  const docked = layout.mode === "wide";
  const toggleTutor = (trigger: HTMLButtonElement) => {
    api.current?.capture();
    toolTrigger.current = trigger;
    setTutorOpen(!tutorOpen);
  };
  return (
    <main
      className="min-w-0 flex-1"
      aria-label={`${subjectTitle} practice workspace`}
    >
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <nav
          aria-label="Problem navigation"
          className="flex min-w-0 flex-wrap items-center gap-2"
        >
          <Button asChild variant="ghost" size="sm">
            <Link href={backHref}>
              <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
              Back
            </Link>
          </Button>
        </nav>
        <Button
          type="button"
          variant={tutorOpen ? "secondary" : "outline"}
          size="icon"
          aria-label={tutorOpen ? "Hide AI tutor" : "Show AI tutor"}
          title={tutorOpen ? "Hide AI tutor" : "Show AI tutor"}
          aria-expanded={tutorOpen}
          aria-controls="lesson-tutor"
          onClick={(event) => toggleTutor(event.currentTarget)}
        >
          <SparklesIcon aria-hidden="true" />
        </Button>
      </header>
      <div
        ref={layout.host}
        className="min-w-0 p-3"
        style={
          layout.mode !== "flow"
            ? { height: layout.capacity.height + 24 }
            : undefined
        }
        data-layout={layout.mode}
      >
        {layout.mode === "flow" ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {lesson}
            {code}
            {output}
          </div>
        ) : (
          <ResizableWorkspace
            apiRef={api}
            lesson={lesson}
            code={code}
            output={output}
            tutor={
              docked && tutorOpen ? (
                <section
                  id="lesson-tutor"
                  className="learning-panel"
                  aria-labelledby="lesson-tutor-title"
                >
                  <h2
                    id="lesson-tutor-title"
                    className="learning-panel-header font-medium"
                  >
                    AI tutor
                  </h2>
                  <div className="min-h-0 flex-1 overflow-hidden">{tutor}</div>
                </section>
              ) : undefined
            }
            preferences={layout.preferences}
            width={layout.capacity.width}
            height={layout.capacity.height}
            onSave={layout.save}
          />
        )}
      </div>
      {!docked && (
        <Sheet open={tutorOpen} onOpenChange={(open) => setTutorOpen(open)}>
          <SheetContent
            id="lesson-tutor"
            side="right"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              toolTrigger.current?.focus();
            }}
          >
            <SheetHeader>
              <SheetTitle>AI tutor</SheetTitle>
              <SheetDescription>Ask about your current code.</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 px-4 pb-4">{tutor}</div>
          </SheetContent>
        </Sheet>
      )}
    </main>
  );
}
