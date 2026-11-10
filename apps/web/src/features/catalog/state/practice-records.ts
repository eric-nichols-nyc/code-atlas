"use client";
import { publicProblems } from "@workspace/problems";
import { useCallback, useEffect, useRef, useState } from "react";
import { progressRecords, progressRequest } from "../lib/progress-client";

interface PracticeRecord {
  version: 1;
  flagged: string[];
  solved: string[];
}
const changeEvent = "code-atlas:practice-records";
const emptyRecord = (): PracticeRecord => ({
  version: 1,
  flagged: [],
  solved: [],
});
const recordKey = (id: string) =>
  `code-atlas:practice:${encodeURIComponent(id)}:v1`;
const known = (id: string) => publicProblems.some((p) => p.id === id);
export function readPracticeRecord(learnerId?: string): PracticeRecord {
  if (!learnerId) return emptyRecord();
  try {
    const value = JSON.parse(
      localStorage.getItem(recordKey(learnerId)) ?? "null",
    );
    const valid = (items: unknown): items is string[] =>
      Array.isArray(items) &&
      items.length <= 1000 &&
      items.every((id) => typeof id === "string" && id.length <= 160);
    return value?.version === 1 && valid(value.flagged) && valid(value.solved)
      ? value
      : emptyRecord();
  } catch {
    return emptyRecord();
  }
}
function savePracticeRecord(id: string, record: PracticeRecord) {
  try {
    localStorage.setItem(recordKey(id), JSON.stringify(record));
  } catch {
    /* Keep in-memory work usable. */
  }
}
// Retain a browser backup. Only the server's solvedAt establishes account completion.
export function markProblemSolved(
  learnerId: string | undefined,
  problemId: string,
) {
  if (!learnerId) return;
  const record = readPracticeRecord(learnerId);
  if (!record.solved.includes(problemId))
    savePracticeRecord(learnerId, {
      ...record,
      solved: [...record.solved, problemId],
    });
  window.dispatchEvent(new Event(changeEvent));
}
function pendingFlags(id: string): Record<string, boolean> {
  try {
    const data = JSON.parse(
      localStorage.getItem(`${recordKey(id)}:pending`) ?? "{}",
    );
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => known(key) && typeof value === "boolean",
      ),
    ) as Record<string, boolean>;
  } catch {
    return {};
  }
}
function writePending(id: string, values: Record<string, boolean>) {
  try {
    localStorage.setItem(`${recordKey(id)}:pending`, JSON.stringify(values));
  } catch {
    /* Retry remains available. */
  }
}
interface RecordsState {
  owner?: string;
  flagged: string[];
  solved: string[];
  legacySolved: string[];
  ready: boolean;
  synced: boolean;
  error: string;
}
const initial = (owner?: string): RecordsState => ({
  owner,
  flagged: [],
  solved: [],
  legacySolved: [],
  ready: false,
  synced: false,
  error: "",
});
export function usePracticeRecords(learnerId?: string) {
  const [state, setState] = useState(() => initial(learnerId));
  const [pending, setPending] = useState<string[]>([]);
  const generation = useRef(0);
  const request = useRef<AbortController | null>(null);
  const owner = useRef(learnerId);
  owner.current = learnerId;
  const reload = useCallback(async () => {
    const revision = ++generation.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    if (!learnerId) {
      setState({ ...initial(), ready: true });
      return;
    }
    const local = readPracticeRecord(learnerId);
    setState((old) =>
      old.owner === learnerId && old.ready
        ? old
        : {
            ...initial(learnerId),
            flagged: local.flagged.filter(known),
            legacySolved: local.solved.filter(known),
          },
    );
    try {
      const flagged = local.flagged.filter(known),
        solved = local.solved.filter(known);
      let data = await progressRequest(
        flagged.length || solved.length ? "/import" : "",
        {
          method: flagged.length || solved.length ? "POST" : "GET",
          ...(flagged.length || solved.length
            ? { body: JSON.stringify({ flagged, solved }) }
            : {}),
          signal: controller.signal,
        },
      );
      const queued = pendingFlags(learnerId);
      for (const [id, value] of Object.entries(queued)) {
        await progressRequest(`/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify({ flagged: value }),
          signal: controller.signal,
        });
        const latest = pendingFlags(learnerId);
        if (latest[id] === value) {
          delete latest[id];
          writePending(learnerId, latest);
        }
      }
      if (Object.keys(queued).length)
        data = await progressRequest("", { signal: controller.signal });
      const records = progressRecords(data);
      if (revision !== generation.current || controller.signal.aborted) return;
      setState({
        owner: learnerId,
        ready: true,
        synced: true,
        error: "",
        flagged: records.filter((r) => r.flagged).map((r) => r.problemId),
        solved: records.filter((r) => r.solvedAt).map((r) => r.problemId),
        legacySolved: records
          .filter((r) => r.legacyCompleted && !r.solvedAt)
          .map((r) => r.problemId),
      });
    } catch {
      if (revision !== generation.current || controller.signal.aborted) return;
      setState((old) => ({
        ...old,
        ready: true,
        synced: false,
        error:
          "Account progress is unavailable. Browser records are kept; retry to sync.",
      }));
    }
  }, [learnerId]);
  useEffect(() => {
    setPending([]);
    void reload();
    const refresh = () => void reload();
    const storage = (event: StorageEvent) => {
      if (
        learnerId &&
        (event.key === null || event.key?.startsWith(recordKey(learnerId)))
      )
        refresh();
    };
    window.addEventListener(changeEvent, refresh);
    window.addEventListener("storage", storage);
    window.addEventListener("focus", refresh);
    return () => {
      ++generation.current;
      request.current?.abort();
      window.removeEventListener(changeEvent, refresh);
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", refresh);
    };
  }, [learnerId, reload]);
  const toggleFlag = async (problemId: string) => {
    if (pending.includes(problemId)) return;
    const flagged = !state.flagged.includes(problemId);
    setState((old) => ({
      ...old,
      flagged: flagged
        ? [...old.flagged, problemId]
        : old.flagged.filter((id) => id !== problemId),
    }));
    if (!learnerId) return;
    const local = readPracticeRecord(learnerId);
    savePracticeRecord(learnerId, {
      ...local,
      flagged: flagged
        ? [...new Set([...local.flagged, problemId])]
        : local.flagged.filter((id) => id !== problemId),
    });
    writePending(learnerId, {
      ...pendingFlags(learnerId),
      [problemId]: flagged,
    });
    setPending((old) => [...old, problemId]);
    try {
      await progressRequest(`/${encodeURIComponent(problemId)}`, {
        method: "PATCH",
        body: JSON.stringify({ flagged }),
      });
      if (owner.current !== learnerId) return;
      const queued = pendingFlags(learnerId);
      delete queued[problemId];
      writePending(learnerId, queued);
      await reload();
    } catch {
      if (owner.current === learnerId)
        setState((old) => ({
          ...old,
          synced: false,
          error:
            "Flag kept in this browser; it was not saved to your account. Retry to sync.",
        }));
    } finally {
      if (owner.current === learnerId)
        setPending((old) => old.filter((id) => id !== problemId));
    }
  };
  return {
    ...(state.owner === learnerId ? state : initial(learnerId)),
    pending,
    toggleFlag,
    reload,
  };
}
