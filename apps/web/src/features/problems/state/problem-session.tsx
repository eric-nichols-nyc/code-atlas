"use client";

import type { Compartment, EditorState } from "@codemirror/state";
import type { ExecutionAction, ProblemDefinition } from "@workspace/problems";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { markProblemSolved } from "../../catalog/state/practice-records";
import { useCodeEvaluation } from "./code-evaluation";
import {
  ProblemSessionContexts,
  type ProblemSessionState,
} from "./problem-context";
import { useProblemDraft } from "./problem-draft";
import { useProblemExecution } from "./problem-execution";
import { useProblemInputs } from "./problem-inputs";

export function ProblemSession({
  problem,
  learnerId,
  evaluationSamples = false,
  children,
}: {
  problem: ProblemDefinition;
  learnerId?: string;
  evaluationSamples?: boolean;
  children: ReactNode;
}) {
  const draft = useProblemDraft(problem, learnerId);
  const cases = useProblemInputs(problem);
  const execution = useProblemExecution({
    problem,
    learnerId,
    captureSource: draft.captureExecutionSource,
    inputs: cases.parsedInputs,
  });
  const [helpSections, setHelpSections] = useState<string[]>([]);
  const [outputTab, setOutputTab] = useState("testcase");
  const evaluation = useCodeEvaluation({
    problemId: problem.id,
    readCode: draft.readCurrentSource,
    onStart: () => setOutputTab("feedback"),
    isExecuting: execution.isActive,
    sampleEnabled: evaluationSamples,
  });

  const execute = useCallback(
    async (action: ExecutionAction) => {
      if (execution.isActive() || evaluation.isActive()) return;
      const invalidRun =
        action === "run" &&
        cases.parsedInputs.some((input) => input === undefined);
      setOutputTab(invalidRun ? "testcase" : "test-result");
      const outcome = await execution.execute(action);
      if (!outcome) return;
      draft.recordExecution(
        outcome.source,
        outcome.status === "completed"
          ? outcome.result.persistence
          : "unavailable",
      );
      if (outcome.status === "completed") {
        const { result } = outcome;
        if (
          action === "submit" &&
          result.action === "submit" &&
          result.verdict === "accepted" &&
          result.passed === result.total &&
          result.total > 0
        )
          markProblemSolved(learnerId, problem.id);
      }
    },
    [
      execution.isActive,
      execution.execute,
      evaluation.isActive,
      cases.parsedInputs,
      draft.recordExecution,
      learnerId,
      problem.id,
    ],
  );
  const resetCode = useCallback(() => {
    draft.resetSource();
    execution.resetResult();
  }, [draft.resetSource, execution.resetResult]);

  // Editor history and callbacks survive responsive panel remounts.
  const editorState = useRef<EditorState | null>(null);
  const editorTheme = useRef<Compartment | null>(null);
  const editorCallbacks = useRef<{
    setSource: (value: string) => void;
    run: () => void;
  } | null>(null);
  editorCallbacks.current = {
    setSource: draft.setSource,
    run: () => void execute("run"),
  };

  const state: ProblemSessionState = {
    problem,
    cases,
    draft,
    execution,
    evaluation,
    execute,
    resetCode,
    editor: {
      source: draft.source,
      setSource: draft.setSource,
      readCurrentSource: draft.readCurrentSource,
      editorState,
      editorTheme,
      editorCallbacks,
    },
    hints: { helpSections, setHelpSections },
    output: { outputTab, setOutputTab },
  };
  return (
    <ProblemSessionContexts state={state}>{children}</ProblemSessionContexts>
  );
}
