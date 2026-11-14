import { beforeEach, expect, it, vi } from "vitest";
import {
  emptyNoteContent,
  MAX_NOTE_REQUEST_BYTES,
} from "../../problems/lib/problem-notes-contract";
import { createProblemNotesHandlers } from "./problem-notes-handlers";
import type { ProblemNotesService } from "./problem-notes-service";

const state = vi.hoisted(() => ({
  configured: true,
  userId: "A" as string | null,
  unavailable: false,
}));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => {
    if (state.unavailable) throw new Error("private service config");
    return state.userId;
  },
}));
const note = { content: emptyNoteContent(), updatedAt: null };
const notes = {
  read: vi.fn(async () => note),
  save: vi.fn(async () => ({ ...note, updatedAt: "2026-11-13T20:00:00.000Z" })),
};
const handlers = createProblemNotesHandlers(notes);
const context = (problemId = "javascript.sleep") => ({
  params: Promise.resolve({ problemId }),
});
const req = (
  method = "GET",
  body?: unknown,
  origin = "http://localhost:3000",
) =>
  new Request(
    "http://localhost:3000/api/problems/javascript.sleep/notes?userId=forged",
    {
      method,
      headers: { origin, "Content-Type": "application/json" },
      ...(body === undefined
        ? {}
        : { body: typeof body === "string" ? body : JSON.stringify(body) }),
    },
  );
beforeEach(() => {
  vi.clearAllMocks();
  state.configured = true;
  state.userId = "A";
  state.unavailable = false;
});

it("denies auth/origin/unknown problems before persistence and returns no-store", async () => {
  const responses: Response[] = [];
  state.configured = false;
  responses.push(await handlers.GET(req(), context()));
  state.configured = true;
  state.userId = null;
  responses.push(await handlers.GET(req(), context()));
  state.userId = "A";
  state.unavailable = true;
  responses.push(await handlers.GET(req(), context()));
  state.unavailable = false;
  responses.push(
    await handlers.PUT(
      req("PUT", { content: emptyNoteContent() }, "https://foreign.example"),
      context(),
    ),
  );
  responses.push(await handlers.GET(req(), context("unknown")));
  expect(responses.map((r) => r.status)).toEqual([503, 401, 503, 403, 404]);
  for (const response of responses)
    expect(response.headers.get("cache-control")).toBe("no-store");
  expect(notes.read).not.toHaveBeenCalled();
  expect(notes.save).not.toHaveBeenCalled();
});

it("uses canonical IDs and only server identity, projects valid GET/PUT envelopes", async () => {
  const read = await handlers.GET(req(), context("sleep"));
  expect(await read.json()).toEqual(note);
  expect(notes.read).toHaveBeenLastCalledWith("A", "javascript.sleep");
  state.userId = "B";
  const saved = await handlers.PUT(
    req("PUT", { content: emptyNoteContent() }),
    context("sleep"),
  );
  expect(saved.status).toBe(200);
  expect(saved.headers.get("cache-control")).toBe("no-store");
  expect(notes.save).toHaveBeenLastCalledWith(
    "B",
    "javascript.sleep",
    emptyNoteContent(),
  );
  expect(await saved.json()).toMatchObject({
    updatedAt: "2026-11-13T20:00:00.000Z",
  });
});

it("rejects malformed, forged, unsafe and oversized payloads without saving", async () => {
  const cases: [unknown, number][] = [
    ["{", 400],
    [null, 400],
    [{}, 400],
    [{ content: emptyNoteContent(), userId: "B" }, 400],
    [
      { content: { formatVersion: 2, document: { ops: [{ insert: "\n" }] } } },
      400,
    ],
    [
      {
        content: {
          formatVersion: 1,
          document: { ops: [{ insert: { image: "https://example.com/x" } }] },
        },
      },
      400,
    ],
    [
      {
        content: {
          formatVersion: 1,
          document: {
            ops: [
              { insert: "x", attributes: { link: "javascript:alert(1)" } },
              { insert: "\n" },
            ],
          },
        },
      },
      400,
    ],
    [
      {
        content: {
          formatVersion: 1,
          document: { ops: [{ insert: `${"x".repeat(65_536)}\n` }] },
        },
      },
      413,
    ],
    [`${" ".repeat(MAX_NOTE_REQUEST_BYTES)}{}`, 413],
  ];
  for (const [body, status] of cases) {
    const response = await handlers.PUT(req("PUT", body), context());
    expect(response.status).toBe(status);
    expect(response.headers.get("cache-control")).toBe("no-store");
  }
  expect(notes.save).not.toHaveBeenCalled();
});

it("hides database errors and rejects malformed service projections", async () => {
  notes.read.mockRejectedValueOnce(new Error("database password private"));
  const failed = await handlers.GET(req(), context());
  expect(failed.status).toBe(503);
  expect(await failed.text()).not.toContain("password");
  const malformed = createProblemNotesHandlers({
    read: async () => ({ html: "private" }),
    save: notes.save,
  } as unknown as ProblemNotesService);
  expect((await malformed.GET(req(), context())).status).toBe(503);
});
