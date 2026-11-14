import { afterEach, expect, it, vi } from "vitest";
import { loadProblemNote, saveProblemNote } from "./problem-notes-client";
import { emptyNoteContent } from "./problem-notes-contract";

afterEach(() => vi.unstubAllGlobals());
const note = {
  content: emptyNoteContent(),
  updatedAt: "2026-11-13T20:00:00.000Z",
};
const signal = () => new AbortController().signal;
it("uses encoded same-origin no-store reads and validated explicit writes", async () => {
  const fetch = vi.fn(async () => Response.json(note));
  vi.stubGlobal("fetch", fetch);
  expect(await loadProblemNote("a/b", signal())).toEqual(note);
  expect(fetch.mock.calls[0]).toMatchObject([
    "/api/problems/a%2Fb/notes",
    { cache: "no-store", credentials: "same-origin" },
  ]);
  await saveProblemNote("javascript.sleep", emptyNoteContent(), signal());
  expect(fetch.mock.calls[1]).toMatchObject([
    "/api/problems/javascript.sleep/notes",
    { method: "PUT", body: JSON.stringify({ content: emptyNoteContent() }) },
  ]);
});
it.each([401, 403, 404, 413, 503])(
  "maps HTTP %s to safe guidance without reflecting a raw response",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("private database details", { status })),
    );
    await expect(loadProblemNote("sleep", signal())).rejects.toMatchObject({
      status,
    });
    await expect(loadProblemNote("sleep", signal())).rejects.not.toThrow(
      "private database",
    );
  },
);
it.each([
  {},
  { content: emptyNoteContent(), updatedAt: "bad" },
  { content: { html: "<script>" }, updatedAt: null },
])("rejects malformed successful replies", async (value) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(value)),
  );
  await expect(loadProblemNote("sleep", signal())).rejects.toThrow(
    "invalid notes response",
  );
});
it("treats non-JSON success and unacknowledged saves as failure", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("not json"))
    .mockResolvedValueOnce(
      Response.json({ content: emptyNoteContent(), updatedAt: null }),
    );
  vi.stubGlobal("fetch", fetch);
  await expect(loadProblemNote("sleep", signal())).rejects.toThrow(
    "invalid notes response",
  );
  await expect(
    saveProblemNote("sleep", emptyNoteContent(), signal()),
  ).rejects.toThrow("invalid notes response");
});
it("distinguishes network failures and aborts and validates local drafts before sending", async () => {
  const fetch = vi.fn(async () => {
    throw new Error("network private");
  });
  vi.stubGlobal("fetch", fetch);
  await expect(loadProblemNote("sleep", signal())).rejects.toMatchObject({
    status: 0,
  });
  const controller = new AbortController();
  controller.abort();
  await expect(loadProblemNote("sleep", controller.signal)).rejects.toThrow(
    "network private",
  );
  fetch.mockClear();
  await expect(
    saveProblemNote(
      "sleep",
      {
        formatVersion: 1,
        document: { ops: [{ insert: `${"x".repeat(66_000)}\n` }] },
      },
      signal(),
    ),
  ).rejects.toMatchObject({ status: 413 });
  expect(fetch).not.toHaveBeenCalled();
});
