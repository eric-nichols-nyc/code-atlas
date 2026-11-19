"use client";
import { useEffect, useRef, useState } from "react";
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

export function useCodeEvaluation(options: {
  problemId: string;
  readCode: () => string;
  onStart: () => void;
  isExecuting: () => boolean;
}) {
  const current = useRef(options);
  current.current = options;
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signIn, setSignIn] = useState(false);
  const [attemptSource, setAttemptSource] = useState<string | null>(null);
  const [latest, setLatest] = useState<{
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

  const evaluate = async () => {
    if (active.current || current.current.isExecuting()) return;
    current.current.onStart();
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
        setLatest({ source, report });
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
  };
  return {
    busy,
    error,
    signIn,
    latest,
    attemptSource,
    evaluate,
    stop: () => active.current?.abort(),
    isActive: () => Boolean(active.current),
  };
}
