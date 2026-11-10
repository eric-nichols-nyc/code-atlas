"use client";
import type { Compartment, EditorState } from "@codemirror/state";
import {
  type ExecutionAction,
  type ExecutionResult,
  isExecutionResult,
  type ProblemDefinition,
  type ProblemInput,
} from "@workspace/problems";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { loadSavedProgress } from "../../catalog/lib/progress-client";
import { markProblemSolved } from "../../catalog/state/practice-records";
import {
  clearCodeBackup,
  keepCodeBackup,
  readCodeBackup,
} from "../lib/code-backup";
import {
  type InputDraft,
  inputDraft,
  parseInputDraft,
} from "../lib/input-drafts";

interface ResultSnapshot {
  result: ExecutionResult;
  source: string;
  inputs: ProblemInput[];
}
function useProblemState(problem: ProblemDefinition, learnerId?: string) {
  const [source, setSourceState] = useState(problem.starterCode);
  const sourceRef = useRef(source);
  const interactions = useRef(0);
  const [savedSource, setSavedSource] = useState<string | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [restoreStatus, setRestoreStatus] = useState(
    learnerId ? "loading" : "ready",
  );
  const [saveFailed, setSaveFailed] = useState(false);
  const editorState = useRef<EditorState | null>(null);
  const resetGeneration = useRef(0);
  const editorCallbacks = useRef<{
    setSource: (value: string) => void;
    run: () => void;
  } | null>(null);
  const editorTheme = useRef<Compartment | null>(null);
  const [inputs, setInputs] = useState(() =>
    problem.samples.map((sample) => inputDraft(sample.input)),
  );
  const parsedInputs = inputs.map((draft) => parseInputDraft(problem, draft));
  const updateInput = (index: number, patch: Partial<InputDraft>) =>
    setInputs((old) =>
      old.map((draft, i) => (i === index ? { ...draft, ...patch } : draft)),
    );
  const inputIds = useRef(problem.samples.map((x) => x.id));
  const [selectedCase, setSelectedCase] = useState("0");
  const [helpSections, setHelpSections] = useState<string[]>([]);
  const [outputTab, setOutputTab] = useState("testcase");
  const [pending, setPending] = useState<ExecutionAction | null>(null);
  const [error, setError] = useState("");
  const [latest, setLatest] = useState<ResultSnapshot | null>(null);
  const controller = useRef<AbortController | null>(null);
  const setSource = (next: string) => {
    if (next !== sourceRef.current) interactions.current++;
    sourceRef.current = next;
    setSourceState(next);
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: restoreAttempt intentionally triggers an explicit user retry.
  useEffect(() => {
    if (!learnerId) return;
    const readController = new AbortController();
    setRestoreStatus("loading");
    const backup = readCodeBackup(learnerId, problem.id);
    if (backup && interactions.current === 0) {
      sourceRef.current = backup;
      setSourceState(backup);
    }
    void loadSavedProgress(problem.id, readController.signal)
      .then((record) => {
        if (readController.signal.aborted) return;
        // Never let a delayed read overwrite typing, Reset, or a Run/Submit.
        if (interactions.current === 0) {
          setSavedSource(record?.lastCode ?? null);
          if (
            !backup &&
            record?.lastCode !== null &&
            record?.lastCode !== undefined
          ) {
            sourceRef.current = record.lastCode;
            setSourceState(record.lastCode);
          }
        }
        setRestoreStatus("ready");
      })
      .catch(() => {
        if (!readController.signal.aborted) setRestoreStatus("unavailable");
      });
    return () => readController.abort();
  }, [learnerId, problem.id, restoreAttempt]);
  useEffect(() => () => controller.current?.abort(), []);
  const execute = async (action: ExecutionAction) => {
    if (controller.current) return;
    interactions.current++;
    if (action === "run" && parsedInputs.some((input) => input === undefined)) {
      setError(problem.inputError);
      setOutputTab("testcase");
      return;
    }
    const numbers = parsedInputs.filter(
      (input): input is ProblemInput => input !== undefined,
    );
    const submittedSource = sourceRef.current;
    if (learnerId) keepCodeBackup(learnerId, problem.id, submittedSource);
    const requestController = new AbortController();
    controller.current = requestController;
    setPending(action);
    setError("");
    setOutputTab("test-result");
    try {
      const response = await fetch(`/api/problems/${problem.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: submittedSource,
          ...(action === "run" ? { inputs: numbers } : {}),
        }),
        signal: requestController.signal,
      });
      const result: unknown = await response.json();
      if (requestController.signal.aborted) return;
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
        throw new Error("The runner returned an invalid result. Please retry.");
      const snapshot = {
        result,
        source: submittedSource,
        inputs: numbers,
      };
      setLatest(snapshot);
      if (learnerId) {
        const saved = result.persistence === "saved";
        setSaveFailed(!saved);
        if (saved) {
          setSavedSource(submittedSource);
          clearCodeBackup(learnerId, problem.id, submittedSource);
        }
      }
      if (
        action === "submit" &&
        result.action === "submit" &&
        result.verdict === "accepted" &&
        result.passed === result.total &&
        result.total > 0
      )
        markProblemSolved(learnerId, problem.id);
    } catch (e) {
      if (learnerId && !requestController.signal.aborted) setSaveFailed(true);
      if (!requestController.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "The runner is unavailable. Your code has been kept.",
        );
    } finally {
      if (controller.current === requestController) {
        controller.current = null;
        setPending(null);
      }
    }
  };
  const resetCode = () => {
    interactions.current++;
    setSource(problem.starterCode);
    resetGeneration.current++;
    setLatest(null);
    setError("");
  };
  editorCallbacks.current = { setSource, run: () => void execute("run") };
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
    problem,
    source,
    setSource,
    editorState,
    editorTheme,
    editorCallbacks,
    resetGeneration,
    inputs,
    setInputs,
    updateInput,
    parsedInputs,
    inputIds,
    selectedCase,
    setSelectedCase,
    helpSections,
    setHelpSections,
    outputTab,
    setOutputTab,
    pending,
    error,
    latest,
    execute,
    resetCode,
    codeStatus,
    restoreUnavailable: restoreStatus === "unavailable",
    retryRestore: () => setRestoreAttempt((attempt) => attempt + 1),
  };
}
const Context = createContext<ReturnType<typeof useProblemState> | null>(null);
export function ProblemSession({
  problem,
  learnerId,
  children,
}: {
  problem: ProblemDefinition;
  learnerId?: string;
  children: ReactNode;
}) {
  const value = useProblemState(problem, learnerId);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useProblemSession() {
  const value = useContext(Context);
  if (!value) throw new Error("Problem session required");
  return value;
}
