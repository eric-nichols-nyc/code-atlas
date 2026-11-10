"use client";
import type { Compartment, EditorState } from "@codemirror/state";
import {
  type ExecutionAction,
  type ExecutionResult,
  isExecutionResult,
  type ProblemDefinition,
  validMillis,
} from "@workspace/problems";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
export interface ResultSnapshot {
  result: ExecutionResult;
  source: string;
  inputs: number[];
}
function useProblemState(problem: ProblemDefinition) {
  const [source, setSourceState] = useState(problem.starterCode);
  const sourceRef = useRef(source);
  const editorState = useRef<EditorState | null>(null);
  const resetGeneration = useRef(0);
  const editorCallbacks = useRef<{
    setSource: (value: string) => void;
    run: () => void;
  } | null>(null);
  const editorTheme = useRef<Compartment | null>(null);
  const [inputs, setInputs] = useState(
    problem.samples.map((x) => String(x.millis)),
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
    sourceRef.current = next;
    setSourceState(next);
  };
  useEffect(() => () => controller.current?.abort(), []);
  const execute = async (action: ExecutionAction) => {
    if (controller.current) return;
    const numbers = inputs.map((x) => Number(x));
    if (action === "run" && !numbers.every(validMillis)) {
      setError("Use integer delays between 1 and 1000 milliseconds.");
      setOutputTab("testcase");
      return;
    }
    const submittedSource = sourceRef.current;
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
    } catch (e) {
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
    setSource(problem.starterCode);
    resetGeneration.current++;
    setLatest(null);
    setError("");
  };
  editorCallbacks.current = { setSource, run: () => void execute("run") };
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
  };
}
const Context = createContext<ReturnType<typeof useProblemState> | null>(null);
export function ProblemSession({
  problem,
  children,
}: {
  problem: ProblemDefinition;
  children: ReactNode;
}) {
  const value = useProblemState(problem);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useProblemSession() {
  const value = useContext(Context);
  if (!value) throw new Error("Problem session required");
  return value;
}
