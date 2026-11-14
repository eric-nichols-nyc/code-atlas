import { describe, expect, it } from "vitest";
import {
  emptyNoteContent,
  MAX_NOTE_BYTES,
  MAX_NOTE_OPS,
  NoteContentError,
  noteContentsEqual,
  parseNoteContent,
  parsePersonalNote,
} from "./problem-notes-contract";

const content = (ops: unknown[]) => ({ formatVersion: 1, document: { ops } });
const text = (insert: string) => content([{ insert }]);

it("round trips each supported format and canonicalizes equivalent documents", () => {
  const document = content([
    { insert: "A", attributes: { italic: true, bold: true } },
    { insert: "B", attributes: { bold: true, italic: true } },
    { insert: "\n" },
    { insert: "Quote" },
    { insert: "\n", attributes: { blockquote: true } },
    { insert: "First" },
    { insert: "\n", attributes: { list: "ordered" } },
    { insert: "Bullet" },
    { insert: "\n", attributes: { list: "bullet" } },
    { insert: "const x = 0;" },
    { insert: "\n", attributes: { "code-block": true } },
    { insert: "Docs", attributes: { link: "https://example.com/docs" } },
    { insert: "\n" },
  ]);
  const parsed = parseNoteContent(document);
  expect(parsed.document.ops[0]).toEqual({
    insert: "AB",
    attributes: { bold: true, italic: true },
  });
  expect(parsed.document.ops).toContainEqual({
    insert: "\n",
    attributes: { "code-block": "plain" },
  });
  expect(noteContentsEqual(parsed, parseNoteContent(parsed))).toBe(true);
  expect(parseNoteContent(emptyNoteContent())).toEqual(emptyNoteContent());
  expect(parseNoteContent(text("  intentional whitespace  \n"))).toEqual(
    text("  intentional whitespace  \n"),
  );
});

describe("untrusted document rejection", () => {
  it.each([
    null,
    [],
    { ...emptyNoteContent(), formatVersion: 2 },
    { ...emptyNoteContent(), userId: "forged" },
    { formatVersion: 1, document: { ops: [], html: "<script>" } },
    content([]),
    content([{ insert: "" }]),
    text("missing newline"),
    content([{ insert: { image: "https://example.com/a.png" } }]),
    content([{ insert: { video: "https://example.com/a.mp4" } }]),
    content([{ retain: 1 }]),
    content([{ delete: 1 }]),
    content([{ insert: "\n", html: "<script>" }]),
    content([{ insert: "\n", attributes: { color: "red" } }]),
    content([{ insert: "\n", attributes: { list: "checked" } }]),
    content([
      { insert: "\n", attributes: { list: "bullet", blockquote: true } },
    ]),
    content([{ insert: "text\n", attributes: { blockquote: true } }]),
    content([{ insert: "text\n", attributes: { bold: true } }]),
    content([{ insert: "x", attributes: { bold: false } }, { insert: "\n" }]),
    content([{ insert: "\n", attributes: { "code-block": "javascript" } }]),
  ])("rejects unsupported structure %#", (value) => {
    expect(() => parseNoteContent(value)).toThrow(NoteContentError);
  });
  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "mailto:a@example.com",
    "/relative",
    "//example.com",
    "https://examp\nle.com",
    "https://user:secret@example.com",
    `https://example.com/${"x".repeat(2048)}`,
  ])("rejects unsafe link %s", (link) => {
    expect(() =>
      parseNoteContent(
        content([{ insert: "Link", attributes: { link } }, { insert: "\n" }]),
      ),
    ).toThrow();
  });
  it("retains literal markup as inert text", () => {
    const value = text('<script>alert("literal")</script>\n');
    expect(parseNoteContent(value)).toEqual(value);
  });
});

it("enforces serialized UTF-8 bounds before normalization and preserves oversized local drafts", () => {
  const overhead = new TextEncoder().encode(JSON.stringify(text("\n"))).length;
  const atLimit = text(`${"a".repeat(MAX_NOTE_BYTES - overhead)}\n`);
  expect(parseNoteContent(atLimit)).toEqual(atLimit);
  for (const tooLarge of [
    text(`${"a".repeat(MAX_NOTE_BYTES - overhead + 1)}\n`),
    text(`${"😀".repeat(17_000)}\n`),
  ]) {
    try {
      parseNoteContent(tooLarge);
      expect.fail("must reject");
    } catch (error) {
      expect(error).toMatchObject({ status: 413 });
    }
    expect(parseNoteContent(tooLarge, false)).toEqual(tooLarge);
  }
});

it("bounds operation complexity independently of normalized size", () => {
  expect(() =>
    parseNoteContent(
      content(Array.from({ length: 100 }, () => ({ insert: "\n" }))),
    ),
  ).not.toThrow();
  try {
    parseNoteContent(
      content(
        Array.from({ length: MAX_NOTE_OPS + 1 }, () => ({ insert: "\n" })),
      ),
    );
    expect.fail("must reject");
  } catch (error) {
    expect(error).toMatchObject({ status: 400 });
  }
});

it("validates timestamps, absent notes, and successful response envelopes", () => {
  expect(
    parsePersonalNote({ content: emptyNoteContent(), updatedAt: null })
      .updatedAt,
  ).toBeNull();
  expect(
    parsePersonalNote({
      content: text("saved\n"),
      updatedAt: "2026-11-13T20:00:00.000Z",
    }).content,
  ).toEqual(text("saved\n"));
  for (const updatedAt of [undefined, 1, "invalid", "2026-02-30T00:00:00.000Z"])
    expect(() =>
      parsePersonalNote({ content: emptyNoteContent(), updatedAt }),
    ).toThrow();
  expect(() =>
    parsePersonalNote({ content: text("not absent\n"), updatedAt: null }),
  ).toThrow();
});
