"use client";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeftIcon,
  NotebookPenIcon,
  SparklesIcon,
  XIcon,
} from "@workspace/ui/components/icons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import Link from "next/link";
import { type ReactNode, useId, useRef, useState } from "react";
import { WorkspaceTimer } from "../../workspace-timer/components/workspace-timer";
import { useWorkspaceLayout } from "../hooks/use-workspace-layout";
import {
  ResizableWorkspace,
  type WorkspaceHandle,
} from "./resizable-workspace";

const toolOrder = ["tutor", "notes"] as const;
type ToolName = (typeof toolOrder)[number];
const tools = {
  tutor: { title: "AI tutor", icon: SparklesIcon },
  notes: { title: "Notes", icon: NotebookPenIcon },
};

export function LearningWorkspace({
  lesson,
  code,
  output,
  tutor,
  notes,
  backHref = "/javascript/practice",
  subjectTitle = "JavaScript",
}: {
  lesson: ReactNode;
  code: ReactNode;
  output?: ReactNode;
  tutor: ReactNode;
  notes: ReactNode;
  backHref?: string;
  subjectTitle?: string;
}) {
  const layout = useWorkspaceLayout();
  const [tool, setTool] = useState<{ name: ToolName; open: boolean }>({
    name: "tutor",
    open: false,
  });
  const toolbarButtons = {
    tutor: useRef<HTMLButtonElement>(null),
    notes: useRef<HTMLButtonElement>(null),
  };
  const drawerTrigger = useRef<HTMLButtonElement>(null);
  const api = useRef<WorkspaceHandle>(null);
  const panelId = useId();
  const docked = layout.mode === "wide";
  const showingNotes = tool.name === "notes";
  const toolTitle = tools[tool.name].title;
  const toolContent = showingNotes ? notes : tutor;
  const renderToolButtons = (inDrawer: boolean) =>
    toolOrder.map((name) => {
      const { title, icon: Icon } = tools[name];
      const expanded = tool.open && tool.name === name;
      const label = `${expanded ? "Hide" : "Show"} ${title}`;
      return (
        <Button
          key={name}
          ref={inDrawer ? undefined : toolbarButtons[name]}
          type="button"
          variant={expanded ? "secondary" : "outline"}
          size={inDrawer ? "icon-sm" : "icon"}
          aria-label={label}
          title={label}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => {
            if (docked && (!tool.open || expanded)) api.current?.capture();
            setTool({ name, open: !expanded });
          }}
        >
          <Icon aria-hidden="true" />
        </Button>
      );
    });

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
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <WorkspaceTimer />
          <div className="flex items-center gap-2">
            {renderToolButtons(false)}
          </div>
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
            toolsPanel={
              docked && tool.open ? (
                <section
                  id={panelId}
                  className="learning-panel"
                  aria-labelledby={`${panelId}-title`}
                >
                  <h2
                    id={`${panelId}-title`}
                    className="learning-panel-header font-medium"
                  >
                    {toolTitle}
                  </h2>
                  <div
                    className={
                      showingNotes
                        ? "min-h-0 flex-1 overflow-y-auto p-3"
                        : "min-h-0 flex-1 overflow-hidden"
                    }
                  >
                    {toolContent}
                  </div>
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
        <Sheet
          open={tool.open}
          onOpenChange={(open) => setTool({ ...tool, open })}
        >
          <SheetContent
            id={panelId}
            side="right"
            showCloseButton={false}
            onOpenAutoFocus={() => {
              drawerTrigger.current = toolbarButtons[tool.name].current;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              drawerTrigger.current?.focus();
            }}
          >
            <SheetHeader>
              <div className="flex items-center justify-between gap-2">
                <SheetTitle>{toolTitle}</SheetTitle>
                <div className="flex items-center gap-2">
                  {renderToolButtons(true)}
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close"
                    >
                      <XIcon aria-hidden="true" />
                    </Button>
                  </SheetClose>
                </div>
              </div>
              <SheetDescription
                className={showingNotes ? "sr-only" : undefined}
              >
                {showingNotes
                  ? "View and edit your private notes for this problem."
                  : "Ask about your current code."}
              </SheetDescription>
            </SheetHeader>
            <div
              className={
                showingNotes
                  ? "min-h-0 flex-1 overflow-y-auto px-4 pb-4"
                  : "min-h-0 flex-1 px-4 pb-4"
              }
            >
              {toolContent}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </main>
  );
}
