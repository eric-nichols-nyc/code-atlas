"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AI_LIMITS } from "@/features/ai/lib/contract";
import {
  AiRequestError,
  readAiTextStream,
} from "@/features/ai/lib/stream-client";
import {
  type CodeEvaluation,
  parseCodeEvaluation,
  parseEvaluationRequest,
} from "../lib/code-evaluation-contract";
import { SAMPLE_EVALUATION } from "../lib/code-evaluation-sample";

const sampleSnapshot = {
  kind: "sample" as const,
  source: null,
  report: SAMPLE_EVALUATION,
};

export function useCodeEvaluation(options: {
  problemId: string;
  readCode: () => string;
  onStart: () => void;
  isExecuting: () => boolean;
  sampleEnabled: boolean;
}) {
  const current = useRef(options);
  current.current = options;
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signIn, setSignIn] = useState(false);
  const [sampleMode, setSampleMode] = useState(false);
  const sampleModeRef = useRef(false);
  const [attemptSource, setAttemptSource] = useState<string | null>(null);
  const [latest, setLatest] = useState<{
    kind: "ai";
    source: string;
    report: CodeEvaluation;
  } | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current?.abort();
    };
  }, []);

  const setSamplePreview = useCallback((enabled: boolean) => {
    if (
      !current.current.sampleEnabled ||
      active.current ||
      current.current.isExecuting()
    )
      return;
    sampleModeRef.current = enabled;
    setSampleMode(enabled);
    if (enabled) current.current.onStart();
  }, []);

  const evaluate = useCallback(async () => {
    if (active.current || current.current.isExecuting()) return;
    current.current.onStart();
    // A separate local path: no source validation, network call, execution or save.
    if (current.current.sampleEnabled && sampleModeRef.current) return;
    const source = current.current.readCode();
    setAttemptSource(source);
    setError("");
    setSignIn(false);
    let input: { code: string };
    try {
      input = parseEvaluationRequest({ code: source });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Write some code before evaluating.",
      );
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    const timer = setTimeout(
      () => controller.abort("timeout"),
      AI_LIMITS.timeout,
    );
    try {
      const response = await fetch(
        `/api/problems/${encodeURIComponent(current.current.problemId)}/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          cache: "no-store",
          signal: controller.signal,
        },
      );
      let text = "";
      await readAiTextStream(
        response,
        (event) => {
          if (event.type === "delta") text += event.text;
        },
        controller.signal,
      );
      controller.signal.throwIfAborted();
      const report = parseCodeEvaluation(JSON.parse(text));
      if (mounted.current && active.current === controller)
        setLatest({ kind: "ai", source, report });
    } catch (reason) {
      if (mounted.current && active.current === controller) {
        setError(
          controller.signal.aborted
            ? controller.signal.reason === "timeout"
              ? "Evaluation took too long. Retry with current code."
              : "Evaluation stopped. Your code is kept."
            : reason instanceof Error
              ? reason.message
              : "Evaluation is unavailable. Please try again.",
        );
        setSignIn(reason instanceof AiRequestError && reason.status === 401);
      }
    } finally {
      clearTimeout(timer);
      if (active.current === controller) {
        active.current = null;
        if (mounted.current) setBusy(false);
      }
    }
  }, []);
  const stop = useCallback(() => active.current?.abort(), []);
  const isActive = useCallback(() => Boolean(active.current), []);
  return useMemo(
    () => ({
      busy,
      error: sampleMode ? "" : error,
      signIn: sampleMode ? false : signIn,
      latest: sampleMode ? sampleSnapshot : latest,
      sampleEnabled: options.sampleEnabled,
      sampleMode,
      setSamplePreview,
      attemptSource,
      evaluate,
      stop,
      isActive,
    }),
    [
      busy,
      error,
      signIn,
      latest,
      options.sampleEnabled,
      sampleMode,
      setSamplePreview,
      attemptSource,
      evaluate,
      stop,
      isActive,
    ],
  );
}
