"use client";

import type { Compartment, EditorState } from "@codemirror/state";
import type { ExecutionAction, ProblemDefinition } from "@workspace/problems";
import {
  type Context,
  createContext,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useContext,
  useMemo,
} from "react";
import type { useCodeEvaluation } from "./code-evaluation";
import type { useProblemDraft } from "./problem-draft";
import type { useProblemExecution } from "./problem-execution";
import type { useProblemInputs } from "./problem-inputs";

type Draft = ReturnType<typeof useProblemDraft>;
type Evaluation = ReturnType<typeof useCodeEvaluation>;
type Execution = ReturnType<typeof useProblemExecution>;
export interface ProblemEditorState {
  source: string;
  setSource: Draft["setSource"];
  readCurrentSource: Draft["readCurrentSource"];
  editorState: RefObject<EditorState | null>;
  editorTheme: RefObject<Compartment | null>;
  editorCallbacks: RefObject<{
    setSource: (value: string) => void;
    run: () => void;
  } | null>;
}
export interface ProblemSessionValues {
  problem: ProblemDefinition;
  cases: ReturnType<typeof useProblemInputs>;
  editor: ProblemEditorState;
  controls: Pick<
    Draft,
    "codeStatus" | "restoreUnavailable" | "retryRestore"
  > & {
    canReset: boolean;
    pending: ExecutionAction | null;
    execute: (action: ExecutionAction) => Promise<void>;
    resetCode: () => void;
    evaluation: Pick<Evaluation, "busy" | "sampleMode" | "evaluate">;
  };
  results: Pick<
    Execution,
    | "pending"
    | "error"
    | "latest"
    | "selectedResultCase"
    | "setSelectedResultCase"
  > & { stale: boolean };
  evaluation: Evaluation & {
    pending: ExecutionAction | null;
    stale: boolean;
    attemptStale: boolean;
  };
  hints: {
    helpSections: string[];
    setHelpSections: Dispatch<SetStateAction<string[]>>;
  };
  output: {
    outputTab: string;
    setOutputTab: Dispatch<SetStateAction<string>>;
  };
}

// Each reader subscribes to one stable value rather than the whole workspace.
const DefinitionContext = createContext<ProblemDefinition | null>(null);
const CasesContext = createContext<ProblemSessionValues["cases"] | null>(null);
const EditorContext = createContext<ProblemEditorState | null>(null);
const ControlsContext = createContext<ProblemSessionValues["controls"] | null>(
  null,
);
const ResultsContext = createContext<ProblemSessionValues["results"] | null>(
  null,
);
const EvaluationContext = createContext<
  ProblemSessionValues["evaluation"] | null
>(null);
const HintsContext = createContext<ProblemSessionValues["hints"] | null>(null);
const OutputContext = createContext<ProblemSessionValues["output"] | null>(
  null,
);

function useSessionContext<T>(context: Context<T | null>) {
  const value = useContext(context);
  if (value === null) throw new Error("Problem session required");
  return value;
}

export function useProblemDefinition() {
  return useSessionContext(DefinitionContext);
}

export function useProblemCases() {
  return useSessionContext(CasesContext);
}

export function useProblemEditor() {
  return useSessionContext(EditorContext);
}

export function useProblemControls() {
  return useSessionContext(ControlsContext);
}

export function useProblemResults() {
  return useSessionContext(ResultsContext);
}

export function useProblemEvaluation() {
  return useSessionContext(EvaluationContext);
}

export function useProblemHints() {
  return useSessionContext(HintsContext);
}

export function useProblemOutput() {
  return useSessionContext(OutputContext);
}

export interface ProblemSessionState {
  problem: ProblemDefinition;
  cases: ReturnType<typeof useProblemInputs>;
  draft: Draft;
  execution: Execution;
  evaluation: Evaluation;
  execute: ProblemSessionValues["controls"]["execute"];
  resetCode: () => void;
  editor: ProblemEditorState;
  hints: ProblemSessionValues["hints"];
  output: ProblemSessionValues["output"];
}

export function ProblemSessionContexts({
  state,
  children,
}: {
  state: ProblemSessionState;
  children: ReactNode;
}) {
  const {
    problem,
    cases,
    draft,
    execution,
    evaluation,
    execute,
    resetCode,
    editor: editorStateValue,
    hints: hintState,
    output: outputState,
  } = state;
  const editor = useMemo(
    () => ({
      source: editorStateValue.source,
      setSource: editorStateValue.setSource,
      readCurrentSource: editorStateValue.readCurrentSource,
      editorState: editorStateValue.editorState,
      editorTheme: editorStateValue.editorTheme,
      editorCallbacks: editorStateValue.editorCallbacks,
    }),
    [
      editorStateValue.source,
      editorStateValue.setSource,
      editorStateValue.readCurrentSource,
      editorStateValue.editorState,
      editorStateValue.editorTheme,
      editorStateValue.editorCallbacks,
    ],
  );
  const controlEvaluation = useMemo(
    () => ({
      busy: evaluation.busy,
      sampleMode: evaluation.sampleMode,
      evaluate: evaluation.evaluate,
    }),
    [evaluation.busy, evaluation.sampleMode, evaluation.evaluate],
  );
  const canReset = draft.source !== problem.starterCode;
  const controls = useMemo(
    () => ({
      canReset,
      codeStatus: draft.codeStatus,
      restoreUnavailable: draft.restoreUnavailable,
      retryRestore: draft.retryRestore,
      pending: execution.pending,
      execute,
      resetCode,
      evaluation: controlEvaluation,
    }),
    [
      canReset,
      draft.codeStatus,
      draft.restoreUnavailable,
      draft.retryRestore,
      execution.pending,
      execute,
      resetCode,
      controlEvaluation,
    ],
  );

  // Compare input snapshots only when inputs/results change, never on each keystroke.
  const inputsChanged = useMemo(
    () =>
      Boolean(
        execution.latest?.result.action === "run" &&
          JSON.stringify(execution.latest.inputs) !==
            JSON.stringify(cases.parsedInputs),
      ),
    [execution.latest, cases.parsedInputs],
  );
  const resultStale = Boolean(
    execution.latest &&
      (execution.latest.source !== draft.source || inputsChanged),
  );
  const results = useMemo(
    () => ({
      pending: execution.pending,
      error: execution.error,
      latest: execution.latest,
      selectedResultCase: execution.selectedResultCase,
      setSelectedResultCase: execution.setSelectedResultCase,
      stale: resultStale,
    }),
    [
      execution.pending,
      execution.error,
      execution.latest,
      execution.selectedResultCase,
      execution.setSelectedResultCase,
      resultStale,
    ],
  );
  const evaluationStale =
    evaluation.latest?.kind === "ai" &&
    evaluation.latest.source !== draft.source;
  const attemptStale =
    evaluation.busy && evaluation.attemptSource !== draft.source;
  const feedback = useMemo(
    () => ({
      ...evaluation,
      pending: execution.pending,
      stale: evaluationStale,
      attemptStale,
    }),
    [evaluation, execution.pending, evaluationStale, attemptStale],
  );
  const hints = useMemo(
    () => ({
      helpSections: hintState.helpSections,
      setHelpSections: hintState.setHelpSections,
    }),
    [hintState.helpSections, hintState.setHelpSections],
  );
  const output = useMemo(
    () => ({
      outputTab: outputState.outputTab,
      setOutputTab: outputState.setOutputTab,
    }),
    [outputState.outputTab, outputState.setOutputTab],
  );

  const value: ProblemSessionValues = {
    problem,
    cases,
    editor,
    controls,
    results,
    evaluation: feedback,
    hints,
    output,
  };
  return (
    <DefinitionContext.Provider value={value.problem}>
      <CasesContext.Provider value={value.cases}>
        <EditorContext.Provider value={value.editor}>
          <ControlsContext.Provider value={value.controls}>
            <ResultsContext.Provider value={value.results}>
              <EvaluationContext.Provider value={value.evaluation}>
                <HintsContext.Provider value={value.hints}>
                  <OutputContext.Provider value={value.output}>
                    {children}
                  </OutputContext.Provider>
                </HintsContext.Provider>
              </EvaluationContext.Provider>
            </ResultsContext.Provider>
          </ControlsContext.Provider>
        </EditorContext.Provider>
      </CasesContext.Provider>
    </DefinitionContext.Provider>
  );
}
