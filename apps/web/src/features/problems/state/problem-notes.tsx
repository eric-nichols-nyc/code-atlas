"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  loadProblemNote,
  ProblemNotesRequestError,
  saveProblemNote,
} from "../lib/problem-notes-client";
import {
  emptyNoteContent,
  type NoteContent,
  NoteContentError,
  noteContentsEqual,
  type PersonalProblemNote,
  parseNoteContent,
} from "../lib/problem-notes-contract";

type NotesError = { message: string; signIn: boolean };
const errorView = (error: unknown): NotesError => ({
  message:
    error instanceof ProblemNotesRequestError ||
    error instanceof NoteContentError
      ? error.message
      : "Account notes are temporarily unavailable. Please retry.",
  signIn: error instanceof ProblemNotesRequestError && error.status === 401,
});

function useNotesState(problemId: string, learnerId?: string) {
  const [draft, setDraftState] = useState(emptyNoteContent);
  const [saved, setSaved] = useState<PersonalProblemNote>({
    content: emptyNoteContent(),
    updatedAt: null,
  });
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "failed">(
    "idle",
  );
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<NotesError | null>(null);
  const [saveError, setSaveError] = useState<NotesError | null>(null);
  const current = useRef(draft);
  const baseline = useRef(saved);
  const edits = useRef(0);
  const loaded = useRef(false);
  const readFailed = useRef(false);
  const read = useRef<AbortController | null>(null);
  const write = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      read.current?.abort();
      write.current?.abort();
      read.current = null;
      write.current = null;
    },
    [],
  );

  const load = useCallback(
    async (retry = false) => {
      if (
        !learnerId ||
        loaded.current ||
        read.current ||
        (readFailed.current && !retry)
      )
        return;
      const controller = new AbortController();
      const generation = edits.current;
      read.current = controller;
      readFailed.current = false;
      setPhase("loading");
      setLoadError(null);
      try {
        const note = await loadProblemNote(problemId, controller.signal);
        if (controller.signal.aborted || read.current !== controller) return;
        baseline.current = note;
        loaded.current = true;
        setSaved(note);
        if (edits.current === generation) {
          current.current = note.content;
          setDraftState(note.content);
        }
        setPhase("ready");
      } catch (error) {
        if (controller.signal.aborted || read.current !== controller) return;
        readFailed.current = true;
        setLoadError(errorView(error));
        setPhase("failed");
      } finally {
        if (read.current === controller) read.current = null;
      }
    },
    [learnerId, problemId],
  );

  const setDraft = useCallback((content: NoteContent) => {
    const normalized = parseNoteContent(content, false);
    if (!noteContentsEqual(normalized, current.current)) edits.current++;
    current.current = normalized;
    setDraftState(normalized);
  }, []);

  const save = async (retry = false) => {
    if (
      !learnerId ||
      !loaded.current ||
      write.current ||
      (!retry && noteContentsEqual(current.current, baseline.current.content))
    )
      return;
    let snapshot: NoteContent;
    try {
      snapshot = parseNoteContent(current.current);
    } catch (error) {
      setSaveError(errorView(error));
      return;
    }
    const generation = edits.current;
    const controller = new AbortController();
    write.current = controller;
    setSaving(true);
    setSaveError(null);
    try {
      const note = await saveProblemNote(
        problemId,
        snapshot,
        controller.signal,
      );
      if (controller.signal.aborted || write.current !== controller) return;
      baseline.current = note;
      setSaved(note);
      if (edits.current === generation) {
        current.current = note.content;
        setDraftState(note.content);
      }
    } catch (error) {
      if (!controller.signal.aborted && write.current === controller)
        setSaveError(errorView(error));
    } finally {
      if (write.current === controller) {
        write.current = null;
        setSaving(false);
      }
    }
  };

  return {
    draft,
    saved,
    phase,
    saving,
    loadError,
    saveError,
    setDraft,
    save,
    signedIn: Boolean(learnerId),
    dirty: !noteContentsEqual(draft, saved.content),
    ensureLoaded: useCallback(() => {
      void load();
    }, [load]),
    retryLoad: () => {
      void load(true);
    },
  };
}

const Context = createContext<ReturnType<typeof useNotesState> | null>(null);
function NotesState({
  children,
  problemId,
  learnerId,
}: {
  children: ReactNode;
  problemId: string;
  learnerId?: string;
}) {
  return (
    <Context.Provider value={useNotesState(problemId, learnerId)}>
      {children}
    </Context.Provider>
  );
}
export function ProblemNotesSession(props: {
  children: ReactNode;
  problemId: string;
  learnerId?: string;
}) {
  return (
    <NotesState
      key={`${props.learnerId ?? "guest"}:${props.problemId}`}
      {...props}
    />
  );
}
export function useProblemNotes() {
  const value = useContext(Context);
  if (!value) throw new Error("Problem notes session required");
  return value;
}
