import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { StrictMode, useEffect, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  emptyNoteContent,
  type NoteContent,
} from "../lib/problem-notes-contract";
import { ProblemNotesSession, useProblemNotes } from "./problem-notes";

let api: ReturnType<typeof useProblemNotes>;
const content = (text: string): NoteContent => ({
  formatVersion: 1,
  document: { ops: [{ insert: `${text}\n` }] },
});
const note = (text = "") => ({
  content: text ? content(text) : emptyNoteContent(),
  updatedAt: text ? "2026-11-13T20:00:00.000Z" : null,
});
function Capture() {
  api = useProblemNotes();
  return <output>{api.phase}</output>;
}
function Visible() {
  const { ensureLoaded } = useProblemNotes();
  useEffect(ensureLoaded, [ensureLoaded]);
  return <p>Notes view</p>;
}
function Host({
  learnerId = "A",
  problemId = "javascript.sleep",
}: {
  learnerId?: string;
  problemId?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <ProblemNotesSession
      learnerId={learnerId || undefined}
      problemId={problemId}
    >
      <Capture />
      <button type="button" onClick={() => setOpen((v) => !v)}>
        Toggle
      </button>
      {open && <Visible />}
    </ProblemNotesSession>
  );
}
const open = () =>
  fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
const ready = () => waitFor(() => expect(api.phase).toBe("ready"));
const deferred = () => {
  let resolve!: (value: Response) => void;
  return {
    promise: new Promise<Response>((r) => {
      resolve = r;
    }),
    resolve: (value: unknown) => resolve(Response.json(value)),
  };
};
afterEach(() => vi.unstubAllGlobals());

it("loads only on first open, retains drafts across view remounts, and resets identity/problem", async () => {
  const fetch = vi.fn(async () => Response.json(note()));
  vi.stubGlobal("fetch", fetch);
  const view = render(<Host />);
  expect(fetch).not.toHaveBeenCalled();
  open();
  await ready();
  expect(fetch).toHaveBeenCalledTimes(1);
  act(() => api.setDraft(content("private A")));
  open();
  open();
  await ready();
  expect(api.draft).toEqual(content("private A"));
  expect(fetch).toHaveBeenCalledTimes(1);
  view.rerender(<Host learnerId="B" />);
  await ready();
  expect(api.draft).toEqual(emptyNoteContent());
  act(() => api.setDraft(content("private B")));
  view.rerender(<Host learnerId="B" problemId="javascript.counter" />);
  await ready();
  expect(api.draft).toEqual(emptyNoteContent());
  view.rerender(<Host learnerId="" />);
  expect(api.signedIn).toBe(false);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("blocks initial failures until explicit retry and keeps read errors separate from save errors", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("private", { status: 503 }))
    .mockResolvedValueOnce(Response.json(note("restored")));
  vi.stubGlobal("fetch", fetch);
  render(<Host />);
  open();
  await waitFor(() => expect(api.phase).toBe("failed"));
  expect(api.loadError?.message).not.toContain("private");
  await act(async () => api.save());
  expect(fetch).toHaveBeenCalledTimes(1);
  open();
  open();
  expect(fetch).toHaveBeenCalledTimes(1);
  act(() => api.retryLoad());
  await ready();
  expect(api.draft).toEqual(content("restored"));
  expect(api.saveError).toBeNull();
});

it("saves the submitted snapshot once while retaining later typing as unsaved", async () => {
  const put = deferred();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(note()))
    .mockImplementation(() => put.promise);
  vi.stubGlobal("fetch", fetch);
  render(<Host />);
  open();
  await ready();
  act(() => api.setDraft(content("A")));
  act(() => {
    void api.save();
    void api.save();
  });
  expect(api.saving).toBe(true);
  expect(fetch).toHaveBeenCalledTimes(2);
  act(() => api.setDraft(content("B")));
  await act(async () => put.resolve(note("A")));
  expect(api.saved.content).toEqual(content("A"));
  expect(api.draft).toEqual(content("B"));
  expect(api.dirty).toBe(true);
  expect(api.saving).toBe(false);
});

it("keeps failed saves and expires authentication without automatic retry; retries the current draft", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(note("old")))
    .mockResolvedValueOnce(new Response("expired", { status: 401 }))
    .mockResolvedValueOnce(Response.json(note("current")));
  vi.stubGlobal("fetch", fetch);
  render(<Host />);
  open();
  await ready();
  act(() => api.setDraft(content("attempt")));
  await act(async () => api.save());
  expect(api.saveError?.signIn).toBe(true);
  expect(api.draft).toEqual(content("attempt"));
  expect(fetch).toHaveBeenCalledTimes(2);
  act(() => api.setDraft(content("current")));
  await act(async () => api.save(true));
  expect(api.saved.content).toEqual(content("current"));
  expect(api.dirty).toBe(false);
  expect(api.saveError).toBeNull();
  expect(JSON.parse(fetch.mock.calls[2]?.[1]?.body).content).toEqual(
    content("current"),
  );
});

it("clears a saved note explicitly and keeps oversized drafts available for correction", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(note("old")))
    .mockResolvedValueOnce(
      Response.json({ ...note(), updatedAt: "2026-11-13T21:00:00.000Z" }),
    );
  vi.stubGlobal("fetch", fetch);
  render(<Host />);
  open();
  await ready();
  act(() => api.setDraft(emptyNoteContent()));
  await act(async () => api.save());
  expect(api.dirty).toBe(false);
  expect(api.saved.updatedAt).not.toBeNull();
  const large = content("x".repeat(66_000));
  act(() => api.setDraft(large));
  await act(async () => api.save());
  expect(api.draft).toEqual(large);
  expect(api.saveError?.message).toContain("64 KiB");
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("ignores old account requests and late reads after newer edits", async () => {
  const first = deferred(),
    second = deferred();
  const fetch = vi
    .fn()
    .mockImplementationOnce(() => first.promise)
    .mockImplementationOnce(() => second.promise);
  vi.stubGlobal("fetch", fetch);
  const view = render(<Host />);
  open();
  view.rerender(<Host learnerId="B" />);
  act(() => api.setDraft(content("newer B")));
  await act(async () => first.resolve(note("private A")));
  expect(api.draft).toEqual(content("newer B"));
  await act(async () => second.resolve(note("old B")));
  expect(api.draft).toEqual(content("newer B"));
  expect(api.saved.content).toEqual(content("old B"));
});

it("abandons an old save when the problem changes and cleans up Strict Mode requests", async () => {
  const oldSave = deferred();
  const signals: AbortSignal[] = [];
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    signals.push(init.signal as AbortSignal);
    return init.method === "PUT" ? oldSave.promise : Response.json(note());
  });
  vi.stubGlobal("fetch", fetch);
  const view = render(
    <StrictMode>
      <Host />
    </StrictMode>,
  );
  open();
  await ready();
  act(() => api.setDraft(content("old")));
  act(() => {
    void api.save();
  });
  view.rerender(
    <StrictMode>
      <Host problemId="javascript.counter" />
    </StrictMode>,
  );
  await ready();
  await act(async () => oldSave.resolve(note("old")));
  expect(api.draft).toEqual(emptyNoteContent());
  expect(api.saved.updatedAt).toBeNull();
  expect(api.saving).toBe(false);
  view.unmount();
  expect(signals.some((s) => s.aborted)).toBe(true);
});
