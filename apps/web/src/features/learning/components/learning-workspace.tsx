"use client";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeftIcon,
  NotebookPenIcon,
  SparklesIcon,
} from "@workspace/ui/components/icons";
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
import { useWorkspaceTools } from "../state/workspace-tools";
import {
  ResizableWorkspace,
  type WorkspaceHandle,
} from "./resizable-workspace";
import { TutorPanel } from "./tutor-panel";
export function LearningWorkspace({
  lesson,
  code,
  output,
}: {
  lesson: ReactNode;
  code: ReactNode;
  output?: ReactNode;
}) {
  const layout = useWorkspaceLayout();
  const tools = useWorkspaceTools();
  const [tutorOpen, setTutorOpen] = useState(false);
  const toolTrigger = useRef<HTMLButtonElement>(null);
  const api = useRef<WorkspaceHandle>(null);
  const docked = layout.mode === "wide";
  const toggleTool = (tab: "tutor" | "notes", trigger: HTMLButtonElement) => {
    api.current?.capture();
    toolTrigger.current = trigger;
    setTutorOpen(!tutorOpen || tools.tab !== tab);
    tools.setTab(tab);
  };
  const aiActive = tutorOpen && tools.tab === "tutor";
  const notesActive = tutorOpen && tools.tab === "notes";
  return (
    <main className="min-w-0 flex-1" aria-label="JavaScript practice workspace">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <nav
          aria-label="Problem navigation"
          className="flex min-w-0 flex-wrap items-center gap-2"
        >
          <Button asChild variant="ghost" size="sm">
            <Link href="/javascript/practice">
              <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
              Back
            </Link>
          </Button>
        </nav>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={aiActive ? "secondary" : "outline"}
            size="icon"
            aria-label={aiActive ? "Hide AI tutor" : "Show AI tutor"}
            title={aiActive ? "Hide AI tutor" : "Show AI tutor"}
            aria-expanded={aiActive}
            aria-controls="lesson-tutor"
            onClick={(event) => toggleTool("tutor", event.currentTarget)}
          >
            <SparklesIcon aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant={notesActive ? "secondary" : "outline"}
            size="icon"
            aria-label={notesActive ? "Hide notes" : "Show notes"}
            title={notesActive ? "Hide notes" : "Show notes"}
            aria-expanded={notesActive}
            aria-controls="lesson-tutor"
            onClick={(event) => toggleTool("notes", event.currentTarget)}
          >
            <NotebookPenIcon aria-hidden="true" />
          </Button>
        </div>
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
                <div id="lesson-tutor" className="h-full">
                  <TutorPanel />
                </div>
              ) : undefined
            }
            preferences={layout.preferences}
            width={layout.capacity.width}
            height={layout.capacity.height}
            resetVersion={layout.resetVersion}
            onSave={layout.save}
          />
        )}
      </div>
      <Sheet
        open={!docked && tutorOpen}
        onOpenChange={(open) => setTutorOpen(open)}
      >
        <SheetContent
          id="lesson-tutor"
          side="right"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            toolTrigger.current?.focus();
          }}
        >
          <SheetHeader>
            <SheetTitle>Learning tools</SheetTitle>
            <SheetDescription>
              Tutor and notes are coming soon.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 px-4 pb-4">
            <TutorPanel />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
