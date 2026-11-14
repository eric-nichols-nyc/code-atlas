"use client";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
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
  trimTutorHistory,
} from "../lib/problem-tutor-contract";
import { useProblemSession } from "./problem-session";

export interface TutorTurn {
  id: string;
  question: string;
  source: string;
  answer: string;
  status: "sending" | "streaming" | "completed" | "stopped" | "failed";
  error?: string;
  signIn?: boolean;
}
function useTutorState() {
  const problem = useProblemSession();
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
  const setDraft = (value: string) => {
    draftRef.current = value;
    setDraftState(value);
    setError("");
  };
  const changeTurns = (update: (previous: TutorTurn[]) => TutorTurn[]) => {
    if (!mounted.current) return;
    currentTurns.current = update(currentTurns.current);
    setTurns(currentTurns.current);
  };
  const send = async (retry?: TutorTurn) => {
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
    const feedback = visibleTutorFeedback(
      session.problem,
      code,
      session.parsedInputs,
      session.latest,
    );
    let input: ReturnType<typeof parseTutorRequest>;
    try {
      input = parseTutorRequest(
        { question, code, history: history.history, ...feedback },
        session.problem,
      );
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
    if (!retry) setDraft("");
    const update = (
      patch: Partial<TutorTurn> | ((turn: TutorTurn) => Partial<TutorTurn>),
    ) => {
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
        session.problem.id,
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
  };
  return {
    draft,
    setDraft,
    turns,
    error,
    historyTrimmed,
    feedbackOmitted,
    busy: turns.some(
      (turn) => turn.status === "sending" || turn.status === "streaming",
    ),
    send: () => send(),
    retry: (turn: TutorTurn) => send(turn),
    stop: () => active.current?.controller.abort(),
    source: problem.source,
  };
}
const Context = createContext<ReturnType<typeof useTutorState> | null>(null);
export function ProblemTutorSession({ children }: { children: ReactNode }) {
  const value = useTutorState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useProblemTutor() {
  const value = useContext(Context);
  if (!value) throw new Error("Problem tutor session required");
  return value;
}
