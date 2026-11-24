"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import dynamic from "next/dynamic";
import { type RefObject, useSyncExternalStore } from "react";
import { TutorSession } from "@/features/problems/state/problem-tutor";
import type { PlaygroundRunSnapshot } from "../run-result";
import {
  PLAYGROUND_TUTOR_ID,
  parsePlaygroundTutorRequest,
} from "../tutor-request";

const ProblemTutor = dynamic(
  () =>
    import("@/features/problems/components/problem-tutor").then(
      (module) => module.ProblemTutor,
    ),
  {
    loading: () => (
      <p role="status" className="p-3 text-muted-foreground text-sm">
        Loading tutor…
      </p>
    ),
  },
);

const dockWidth = "(min-width: 1280px)";
const isDocked = () => window.matchMedia(dockWidth).matches;
function subscribeToDockWidth(onChange: () => void) {
  const media = window.matchMedia(dockWidth);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useDockedPlaygroundTutor() {
  return useSyncExternalStore(subscribeToDockWidth, isDocked, () => false);
}

export function PlaygroundTutor({
  open,
  docked,
  onOpenChange,
  trigger,
  source,
  readCurrentSource,
  latest,
}: {
  open: boolean;
  docked: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: RefObject<HTMLButtonElement | null>;
  source: string;
  readCurrentSource: () => string;
  latest: PlaygroundRunSnapshot | null;
}) {
  const chat = open && (
    <ProblemTutor contextDescription="Send shares your current code and any error from a Run of that draft." />
  );

  return (
    <TutorSession
      workspace={{
        id: PLAYGROUND_TUTOR_ID,
        source,
        readCurrentSource,
        validateRequest(value) {
          const request = parsePlaygroundTutorRequest(value);
          if (
            latest?.source === request.code &&
            latest.result.status !== "finished"
          ) {
            const runError = latest.result.message.slice(0, 300);
            if (runError.trim()) return { ...request, runError };
          }
          return request;
        },
        feedback: () => ({}),
        endpoint: "/api/javascript/playground/tutor",
      }}
    >
      {docked ? (
        open && (
          <section
            id="playground-tutor"
            className="learning-panel"
            aria-labelledby="playground-tutor-title"
          >
            <h2
              id="playground-tutor-title"
              className="learning-panel-header min-h-12 bg-muted/55 font-medium"
            >
              AI tutor
            </h2>
            <div className="min-h-0 flex-1 overflow-hidden">{chat}</div>
          </section>
        )
      ) : (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            id="playground-tutor"
            side="right"
            className="w-full max-w-sm gap-0"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (!isDocked()) trigger.current?.focus();
            }}
          >
            <SheetHeader className="border-b">
              <SheetTitle>AI tutor</SheetTitle>
              <SheetDescription className="sr-only">
                Ask about the code in Playground.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-hidden">{chat}</div>
          </SheetContent>
        </Sheet>
      )}
    </TutorSession>
  );
}
