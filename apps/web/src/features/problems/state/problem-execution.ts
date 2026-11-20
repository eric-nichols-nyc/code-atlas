"use client";

import {
  type ExecutionAction,
  type ExecutionResult,
  isExecutionResult,
  type ProblemDefinition,
  type ProblemInput,
} from "@workspace/problems";
import { useCallback, useEffect, useRef, useState } from "react";
import { keepCodeBackup } from "../lib/code-backup";

interface ResultSnapshot {
  result: ExecutionResult;
  source: string;
  inputs: ProblemInput[];
}
type ExecutionOutcome =
  | { status: "completed"; source: string; result: ExecutionResult }
  | { status: "failed"; source: string };

export function useProblemExecution({
  problem,
  learnerId,
  captureSource,
  inputs,
}: {
  problem: ProblemDefinition;
  learnerId?: string;
  captureSource: () => string;
  inputs: (ProblemInput | undefined)[];
}) {
  const [pending, setPending] = useState<ExecutionAction | null>(null);
  const [error, setError] = useState("");
  const [latest, setLatest] = useState<ResultSnapshot | null>(null);
  const controller = useRef<AbortController | null>(null);
  const isActive = useCallback(() => Boolean(controller.current), []);

  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    [],
  );

  // Invalid, overlapping or cancelled attempts have no account outcome to apply.
  const execute = useCallback(
    async (action: ExecutionAction): Promise<ExecutionOutcome | null> => {
      if (controller.current) return null;
      const source = captureSource();
      if (action === "run" && inputs.some((input) => input === undefined)) {
        setError(problem.inputError);
        return null;
      }
      const validInputs = inputs.filter(
        (input): input is ProblemInput => input !== undefined,
      );
      if (learnerId) keepCodeBackup(learnerId, problem.id, source);
      const request = new AbortController();
      controller.current = request;
      setPending(action);
      setError("");
      try {
        const response = await fetch(`/api/problems/${problem.id}/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: source,
            ...(action === "run" ? { inputs: validInputs } : {}),
          }),
          signal: request.signal,
        });
        const result: unknown = await response.json();
        if (request.signal.aborted) return null;
        if (!response.ok) {
          throw new Error(
            result &&
              typeof result === "object" &&
              "error" in result &&
              typeof result.error === "string"
              ? result.error
              : "Execution failed. Please retry.",
          );
        }
        if (!isExecutionResult(result))
          throw new Error(
            "The runner returned an invalid result. Please retry.",
          );
        setLatest({ result, source, inputs: validInputs });
        return { status: "completed", source, result };
      } catch (reason) {
        if (request.signal.aborted) return null;
        setError(
          reason instanceof Error
            ? reason.message
            : "The runner is unavailable. Your code has been kept.",
        );
        return { status: "failed", source };
      } finally {
        if (controller.current === request) {
          controller.current = null;
          setPending(null);
        }
      }
    },
    [captureSource, inputs, learnerId, problem],
  );

  const resetResult = useCallback(() => {
    setLatest(null);
    setError("");
  }, []);

  return { pending, error, latest, isActive, execute, resetResult };
}
