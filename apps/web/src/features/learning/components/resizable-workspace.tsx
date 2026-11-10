"use client";
import {
  type PanelImperativeHandle,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";
import {
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { fitLayout } from "../lib/layout";
import type { LayoutPreferences } from "../lib/types";
export interface WorkspaceHandle {
  capture: () => void;
}
export function ResizableWorkspace({
  lesson,
  code,
  output,
  tutor,
  preferences,
  width,
  height,
  resetVersion,
  onSave,
  apiRef,
}: {
  lesson: ReactNode;
  code: ReactNode;
  output?: ReactNode;
  tutor?: ReactNode;
  preferences: LayoutPreferences;
  width: number;
  height: number;
  resetVersion: number;
  onSave: (p: Partial<LayoutPreferences>) => void;
  apiRef: Ref<WorkspaceHandle>;
}) {
  const left = useRef<PanelImperativeHandle>(null);
  const right = useRef<PanelImperativeHandle>(null);
  const upper = useRef<PanelImperativeHandle>(null);
  const capture = useRef<{ left: number; right: number } | null>(null);
  const previousReset = useRef(resetVersion);
  const desired = useRef(preferences);
  desired.current = preferences;
  const hasTutor = Boolean(tutor);
  const fitted = fitLayout(preferences, width, height, hasTutor);
  useImperativeHandle(
    apiRef,
    () => ({
      capture: () => {
        capture.current = {
          left:
            left.current?.getSize().inPixels || desired.current.lessonWidthPx,
          right:
            right.current?.getSize().inPixels ||
            desired.current.lastTutorWidthPx,
        };
      },
    }),
    [],
  );
  useEffect(() => {
    const resetting = previousReset.current !== resetVersion;
    previousReset.current = resetVersion;
    const requested = capture.current;
    capture.current = null;
    const p = fitLayout(
      resetting
        ? desired.current
        : {
            ...desired.current,
            ...(requested
              ? {
                  lessonWidthPx: requested.left,
                  lastTutorWidthPx: requested.right,
                }
              : {}),
          },
      width,
      height,
      hasTutor,
    );
    let frame = 0;
    let attempts = 0;
    const apply = () => {
      if (
        !left.current?.getSize().inPixels ||
        (hasTutor && !right.current?.getSize().inPixels)
      ) {
        if (attempts++ < 12) frame = requestAnimationFrame(apply);
        return;
      }
      left.current.resize(`${p.lessonWidthPx}px`);
      if (hasTutor) right.current?.resize(`${p.lastTutorWidthPx}px`);
      if (resetting) upper.current?.resize(`${p.codeSharePercent}%`);
    };
    frame = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(frame);
  }, [hasTutor, width, height, resetVersion]);
  return (
    <ResizablePanelGroup
      id="learning-columns"
      orientation="horizontal"
      resizeTargetMinimumSize={{ coarse: 24, fine: 10 }}
      onLayoutChanged={(_, meta) => {
        if (meta.isUserInteraction)
          onSave({
            lessonWidthPx:
              left.current?.getSize().inPixels ?? preferences.lessonWidthPx,
            ...(right.current
              ? { lastTutorWidthPx: right.current.getSize().inPixels }
              : {}),
          });
      }}
    >
      <ResizablePanel
        id="lesson"
        panelRef={left}
        defaultSize={`${fitted.lessonWidthPx}px`}
        minSize="280px"
        maxSize={`${Math.min(440, width - 490 - (tutor ? 266 : 0))}px`}
        groupResizeBehavior="preserve-pixel-size"
      >
        {lesson}
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize description and code" />
      <ResizablePanel id="center" minSize="480px">
        {output ? (
          <ResizablePanelGroup
            id="learning-center"
            orientation="vertical"
            resizeTargetMinimumSize={{ coarse: 24, fine: 10 }}
            onLayoutChanged={(layout, meta) => {
              if (meta.isUserInteraction && layout.code !== undefined)
                onSave({ codeSharePercent: layout.code });
            }}
          >
            <ResizablePanel
              id="code"
              panelRef={upper}
              defaultSize={`${fitted.codeSharePercent}%`}
              minSize="240px"
            >
              {code}
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize code and results" />
            <ResizablePanel id="results" minSize="260px">
              {output}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          code
        )}
      </ResizablePanel>
      {tutor && (
        <>
          <ResizableHandle withHandle aria-label="Resize code and tutor" />
          <ResizablePanel
            id="tutor"
            panelRef={right}
            defaultSize={`${fitted.lastTutorWidthPx}px`}
            minSize="256px"
            maxSize="360px"
            groupResizeBehavior="preserve-pixel-size"
          >
            {tutor}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
