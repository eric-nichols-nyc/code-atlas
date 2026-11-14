import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { NoteContent } from "../lib/problem-notes-contract";
import { ProblemNotesSession } from "../state/problem-notes";
import { ProblemNotes } from "./problem-notes";

vi.mock("next/dynamic", () => ({
  default: () =>
    function Editor({
      content,
      onChange,
      labelId,
    }: {
      content: NoteContent;
      onChange: (content: NoteContent) => void;
      labelId: string;
    }) {
      return (
        <textarea
          aria-labelledby={labelId}
          value={content.document.ops
            .map((op) => op.insert)
            .join("")
            .slice(0, -1)}
          onChange={(event) =>
            onChange({
              formatVersion: 1,
              document: { ops: [{ insert: `${event.target.value}\n` }] },
            })
          }
        />
      );
    },
}));
afterEach(() => vi.unstubAllGlobals());
const empty = {
  content: { formatVersion: 1, document: { ops: [{ insert: "\n" }] } },
  updatedAt: null,
};
const mount = (learnerId?: string) =>
  render(
    <ProblemNotesSession problemId="javascript.sleep" learnerId={learnerId}>
      <ProblemNotes />
    </ProblemNotesSession>,
  );

it("shows sign-in without requests and disables save", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  mount();
  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    "/sign-in",
  );
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  expect(fetch).not.toHaveBeenCalled();
});

it("recovers initial/read and save failures with truthful status and preserved literal text", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("private config", { status: 503 }))
    .mockResolvedValueOnce(Response.json(empty))
    .mockResolvedValueOnce(new Response("private config", { status: 503 }))
    .mockImplementation(async (_url: string, init: RequestInit) =>
      Response.json({
        ...JSON.parse(init.body as string),
        updatedAt: "2026-11-13T21:00:00.000Z",
      }),
    );
  vi.stubGlobal("fetch", fetch);
  mount("A");
  expect(screen.getByRole("status")).toHaveTextContent("Loading your notes");
  fireEvent.click(
    await screen.findByRole("button", { name: "Retry loading notes" }),
  );
  const editor = await screen.findByRole("textbox", { name: "Your notes" });
  expect(screen.getByRole("status")).toHaveTextContent("No saved notes yet");
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  fireEvent.change(editor, { target: { value: "<script>literal</script>" } });
  expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes");
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("button", { name: "Retry saving notes" });
  expect(editor).toHaveValue("<script>literal</script>");
  expect(screen.getByRole("status")).toHaveTextContent("Not saved");
  expect(screen.getByRole("alert")).not.toHaveTextContent("private config");
  fireEvent.change(editor, { target: { value: "Corrected" } });
  fireEvent.click(screen.getByRole("button", { name: "Retry saving notes" }));
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("Saved "),
  );
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  expect(editor).toHaveValue("Corrected");
  expect(screen.getByText(/Unsaved changes last until/)).toBeVisible();
});
