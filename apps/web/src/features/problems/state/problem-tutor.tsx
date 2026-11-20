"use client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  askProblemTutor,
  TutorRequestError,
  visibleTutorFeedback,
} from "../lib/problem-tutor-client";
import {
  parseTutorRequest,
  TUTOR_LIMITS,
  type TutorHistoryMessage,
  type TutorRequest,
  type TutorRunFeedback,
  trimTutorHistory,
} from "../lib/problem-tutor-contract";
import {
  useProblemCases,
  useProblemDefinition,
  useProblemEditor,
  useProblemResults,
} from "./problem-context";

export interface TutorTurn {
  id: string;
  question: string;
  source: string;
  answer: string;
  status: "sending" | "streaming" | "completed" | "stopped" | "failed";
  error?: string;
  signIn?: boolean;
}
export interface TutorWorkspace {
  id: string;
  source: string;
  readCurrentSource: () => string;
  validateRequest: (value: unknown) => TutorRequest;
  feedback: (code: string) => {
    runFeedback?: TutorRunFeedback;
    feedbackOmitted?: boolean;
  };
  endpoint?: string;
}
function useTutorState(problem: TutorWorkspace) {
  const currentProblem = useRef(problem);
  currentProblem.current = problem;
  const [draft, setDraftState] = useState("");
  const draftRef = useRef("");
  const [turns, setTurns] = useState<TutorTurn[]>([]);
  const currentTurns = useRef<TutorTurn[]>([]);
  const [error, setError] = useState("");
  const [historyTrimmed, setHistoryTrimmed] = useState(false);
  const [feedbackOmitted, setFeedbackOmitted] = useState(false);
  const active = useRef<{ id: string; controller: AbortController } | null>(
    null,
  );
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current?.controller.abort();
      active.current = null;
    };
  }, []);
  const setDraft = useCallback((value: string) => {
    draftRef.current = value;
    setDraftState(value);
    setError("");
  }, []);
  const changeTurns = useCallback(
    (update: (previous: TutorTurn[]) => TutorTurn[]) => {
      if (!mounted.current) return;
      currentTurns.current = update(currentTurns.current);
      setTurns(currentTurns.current);
    },
    [],
  );
  // Only Send/Retry starts a request; snapshot the latest code at action time.
  const send = useCallback(
    async (retry?: TutorTurn) => {
      if (active.current) return;
      const session = currentProblem.current;
      const question = retry?.question ?? draftRef.current;
      const code = session.readCurrentSource();
      const messages = currentTurns.current
        .filter((turn) => turn.status === "completed")
        .flatMap((turn): TutorHistoryMessage[] => [
          { role: "user", content: turn.question },
          { role: "assistant", content: turn.answer },
        ]);
      const history = trimTutorHistory(messages);
      const feedback = session.feedback(code);
      let input: ReturnType<typeof parseTutorRequest>;
      try {
        input = session.validateRequest({
          question,
          code,
          history: history.history,
          ...feedback,
        });
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : "Enter a valid question.",
        );
        return;
      }
      setError("");
      setHistoryTrimmed(history.trimmed);
      setFeedbackOmitted(feedback.feedbackOmitted === true);
      const id = crypto.randomUUID();
      const controller = new AbortController();
      active.current = { id, controller };
      const turn: TutorTurn = {
        id,
        question,
        source: code,
        answer: "",
        status: "sending",
      };
      changeTurns((previous) =>
        retry
          ? previous.map((item) => (item.id === retry.id ? turn : item))
          : [...previous, turn],
      );
      // Retrying an earlier question must preserve any newer unsent draft.
      if (!retry) setDraft("");
      const update = (
        patch: Partial<TutorTurn> | ((turn: TutorTurn) => Partial<TutorTurn>),
      ) => {
        // Late chunks from an old attempt cannot update its replacement.
        if (active.current?.id !== id) return;
        changeTurns((previous) =>
          previous.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...(typeof patch === "function" ? patch(item) : patch),
                }
              : item,
          ),
        );
      };
      const timeout = setTimeout(
        () => controller.abort("timeout"),
        TUTOR_LIMITS.timeout,
      );
      try {
        await askProblemTutor(
          session.id,
          input,
          controller.signal,
          (event) => {
            if (event.type === "delta")
              update((item) => ({
                answer: item.answer + event.text,
                status: "streaming",
              }));
            if (event.type === "done") update({ status: "completed" });
          },
          session.endpoint,
        );
      } catch (reason) {
        update({
          status: controller.signal.aborted ? "stopped" : "failed",
          error: controller.signal.aborted
            ? controller.signal.reason === "timeout"
              ? "The tutor took too long. Your question is kept."
              : "Reply stopped. Your question is kept."
            : reason instanceof Error
              ? reason.message
              : "The tutor is unavailable. Please try sending again.",
          signIn: reason instanceof TutorRequestError && reason.status === 401,
        });
      } finally {
        clearTimeout(timeout);
        if (active.current?.id === id) active.current = null;
      }
    },
    [changeTurns, setDraft],
  );
  const sendQuestion = useCallback(() => send(), [send]);
  const stop = useCallback(() => active.current?.controller.abort(), []);
  return useMemo(
    () => ({
      draft,
      setDraft,
      turns,
      error,
      historyTrimmed,
      feedbackOmitted,
      busy: turns.some(
        (turn) => turn.status === "sending" || turn.status === "streaming",
      ),
      send: sendQuestion,
      retry: send,
      stop,
    }),
    [
      draft,
      setDraft,
      turns,
      error,
      historyTrimmed,
      feedbackOmitted,
      sendQuestion,
      send,
      stop,
    ],
  );
}
const Context = createContext<ReturnType<typeof useTutorState> | null>(null);
const MatchingSourceContext = createContext<string | null | undefined>(
  undefined,
);
// Lives above panel remounts, inside the keyed learner/problem workspace.
export function TutorSession({
  workspace,
  children,
}: {
  workspace: TutorWorkspace;
  children: ReactNode;
}) {
  const value = useTutorState(workspace);
  // Only a match with a captured turn affects its notice. Further edits with no
  // matching turn must not repeatedly render the conversation or its Markdown.
  const matchingSource = value.turns.some(
    (turn) => turn.source === workspace.source,
  )
    ? workspace.source
    : null;
  return (
    <MatchingSourceContext.Provider value={matchingSource}>
      <Context.Provider value={value}>{children}</Context.Provider>
    </MatchingSourceContext.Provider>
  );
}
export function ProblemTutorSession({ children }: { children: ReactNode }) {
  const definition = useProblemDefinition();
  const editor = useProblemEditor();
  const cases = useProblemCases();
  const results = useProblemResults();
  return (
    <TutorSession
      workspace={{
        id: definition.id,
        source: editor.source,
        readCurrentSource: editor.readCurrentSource,
        validateRequest: (value) => parseTutorRequest(value, definition),
        feedback: (code) =>
          visibleTutorFeedback(
            definition,
            code,
            cases.parsedInputs,
            results.latest,
          ),
      }}
    >
      {children}
    </TutorSession>
  );
}
export function useProblemTutor() {
  const value = useContext(Context);
  if (!value) throw new Error("Problem tutor session required");
  return value;
}

export function useTutorSourceChanged(source: string) {
  const matchingSource = useContext(MatchingSourceContext);
  if (matchingSource === undefined)
    throw new Error("Problem tutor session required");
  return source !== matchingSource;
}
