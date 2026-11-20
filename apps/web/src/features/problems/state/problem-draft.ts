"use client";

import type { ExecutionResult, ProblemDefinition } from "@workspace/problems";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadSavedProgress } from "../../catalog/lib/progress-client";
import { clearCodeBackup, readCodeBackup } from "../lib/code-backup";

export function useProblemDraft(
  problem: ProblemDefinition,
  learnerId?: string,
) {
  const [source, setSourceState] = useState(problem.starterCode);
  const sourceRef = useRef(source);
  const interactions = useRef(0);
  const [savedSource, setSavedSource] = useState<string | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [restoreStatus, setRestoreStatus] = useState(
    learnerId ? "loading" : "ready",
  );
  const [saveFailed, setSaveFailed] = useState(false);
  const retryRestore = useCallback(
    () => setRestoreAttempt((attempt) => attempt + 1),
    [],
  );
  const { id: problemId, starterCode } = problem;

  const readCurrentSource = useCallback(() => sourceRef.current, []);
  const setSource = useCallback((next: string) => {
    if (next !== sourceRef.current) interactions.current++;
    sourceRef.current = next;
    setSourceState(next);
  }, []);
  const captureExecutionSource = useCallback(() => {
    // Even an invalid Run attempt must protect the draft from a delayed restore.
    interactions.current++;
    return sourceRef.current;
  }, []);
  const resetSource = useCallback(() => {
    interactions.current++;
    setSource(starterCode);
  }, [setSource, starterCode]);
  const recordExecution = useCallback(
    (submittedSource: string, persistence: ExecutionResult["persistence"]) => {
      if (!learnerId) return;
      const saved = persistence === "saved";
      setSaveFailed(!saved);
      if (saved) {
        setSavedSource(submittedSource);
        clearCodeBackup(learnerId, problemId, submittedSource);
      }
    },
    [learnerId, problemId],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: restoreAttempt intentionally triggers an explicit user retry.
  useEffect(() => {
    if (!learnerId) return;
    const controller = new AbortController();
    setRestoreStatus("loading");
    const backup = readCodeBackup(learnerId, problemId);
    if (backup && interactions.current === 0) {
      sourceRef.current = backup;
      setSourceState(backup);
    }
    void loadSavedProgress(problemId, controller.signal)
      .then((record) => {
        if (controller.signal.aborted) return;
        // Typing, Reset and Run/Submit take precedence over account restoration.
        if (interactions.current === 0) {
          setSavedSource(record?.lastCode ?? null);
          if (!backup && record?.lastCode != null) {
            sourceRef.current = record.lastCode;
            setSourceState(record.lastCode);
          }
        }
        setRestoreStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setRestoreStatus("unavailable");
      });
    return () => controller.abort();
  }, [learnerId, problemId, restoreAttempt]);

  const codeStatus = !learnerId
    ? "Session draft · Tab moves focus out"
    : saveFailed
      ? "Not saved to account · retry Run or Submit"
      : restoreStatus === "unavailable"
        ? "Saved code unavailable · current edits kept"
        : source === savedSource
          ? "Saved to account · Tab moves focus out"
          : restoreStatus === "loading"
            ? "Loading saved code…"
            : "Unsaved edits · Run or Submit to save";

  return {
    source,
    setSource,
    readCurrentSource,
    captureExecutionSource,
    resetSource,
    recordExecution,
    codeStatus,
    restoreUnavailable: restoreStatus === "unavailable",
    retryRestore,
  };
}
