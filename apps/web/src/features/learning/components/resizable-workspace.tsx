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
  toolsPanel,
  preferences,
  width,
  height,
  onSave,
  apiRef,
}: {
  lesson: ReactNode;
  code: ReactNode;
  output?: ReactNode;
  toolsPanel?: ReactNode;
  preferences: LayoutPreferences;
  width: number;
  height: number;
  onSave: (p: Partial<LayoutPreferences>) => void;
  apiRef: Ref<WorkspaceHandle>;
}) {
  const left = useRef<PanelImperativeHandle>(null);
  const right = useRef<PanelImperativeHandle>(null);
  const capture = useRef<{ left: number; right: number } | null>(null);
  const desired = useRef(preferences);
  desired.current = preferences;
  const hasToolsPanel = Boolean(toolsPanel);
  const fitted = fitLayout(preferences, width, height, hasToolsPanel);
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
    const requested = capture.current;
    capture.current = null;
    const p = fitLayout(
      {
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
      hasToolsPanel,
    );
    let frame = 0;
    let attempts = 0;
    const apply = () => {
      if (
        !left.current?.getSize().inPixels ||
        (hasToolsPanel && !right.current?.getSize().inPixels)
      ) {
        if (attempts++ < 12) frame = requestAnimationFrame(apply);
        return;
      }
      left.current.resize(`${p.lessonWidthPx}px`);
      if (hasToolsPanel) right.current?.resize(`${p.lastTutorWidthPx}px`);
    };
    frame = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(frame);
  }, [hasToolsPanel, width, height]);
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
        maxSize={`${Math.min(440, width - 490 - (hasToolsPanel ? 266 : 0))}px`}
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
      {toolsPanel && (
        <>
          <ResizableHandle
            withHandle
            aria-label="Resize code and workspace tools"
          />
          <ResizablePanel
            id="tools"
            panelRef={right}
            defaultSize={`${fitted.lastTutorWidthPx}px`}
            minSize="256px"
            maxSize="360px"
            groupResizeBehavior="preserve-pixel-size"
          >
            {toolsPanel}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
