export const MAX_NOTE_BYTES = 65_536;
export const MAX_NOTE_OPS = 4_096;
export const MAX_NOTE_REQUEST_BYTES = 512 * 1_024;

export type NoteAttributes = {
  bold?: true;
  italic?: true;
  link?: string;
  blockquote?: true;
  list?: "ordered" | "bullet";
  "code-block"?: "plain";
};
export type NoteOperation = { insert: string; attributes?: NoteAttributes };
export type NoteContent = {
  formatVersion: 1;
  document: { ops: NoteOperation[] };
};
export type PersonalProblemNote = {
  content: NoteContent;
  updatedAt: string | null;
};

export const emptyNoteContent = (): NoteContent => ({
  formatVersion: 1,
  document: { ops: [{ insert: "\n" }] },
});

export class NoteContentError extends Error {
  constructor(
    message = "Provide a valid notes document.",
    readonly status: 400 | 413 = 400,
  ) {
    super(message);
    this.name = "NoteContentError";
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw new NoteContentError();
}
export function isNoteLink(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.length > 2_048 ||
    Array.from(value).some(
      (char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127,
    ) ||
    !/^https?:\/\//i.test(value)
  )
    return false;
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function attributes(value: unknown, text: string): NoteAttributes | undefined {
  if (value === undefined) return;
  if (!isObject(value)) throw new NoteContentError();
  keys(value, ["bold", "italic", "link", "blockquote", "list", "code-block"]);
  const result: NoteAttributes = {};
  for (const key of ["bold", "italic", "blockquote"] as const) {
    if (value[key] !== undefined) {
      if (value[key] !== true) throw new NoteContentError();
      result[key] = true;
    }
  }
  if (value.link !== undefined) {
    if (!isNoteLink(value.link))
      throw new NoteContentError("Use a complete http:// or https:// link.");
    result.link = value.link;
  }
  if (value.list !== undefined) {
    if (value.list !== "ordered" && value.list !== "bullet")
      throw new NoteContentError();
    result.list = value.list;
  }
  if (value["code-block"] !== undefined) {
    if (value["code-block"] !== true && value["code-block"] !== "plain")
      throw new NoteContentError();
    result["code-block"] = "plain";
  }
  const blocks = [result.blockquote, result.list, result["code-block"]].filter(
    Boolean,
  ).length;
  const inline = result.bold || result.italic || result.link;
  if (
    blocks > 1 ||
    (blocks && /[^\n]/.test(text)) ||
    (inline && text.includes("\n"))
  )
    throw new NoteContentError();
  return Object.keys(result).length ? result : undefined;
}

function checkBytes(value: unknown) {
  let encoded: string;
  try {
    encoded = JSON.stringify(value);
  } catch {
    throw new NoteContentError();
  }
  if (new TextEncoder().encode(encoded).byteLength > MAX_NOTE_BYTES)
    throw new NoteContentError(
      "Notes must fit within 64 KiB. Shorten the note and retry.",
      413,
    );
}

/** Disable size limits only for a local editor draft; network/storage always use the default. */
export function parseNoteContent(value: unknown, bounded = true): NoteContent {
  if (!isObject(value)) throw new NoteContentError();
  keys(value, ["formatVersion", "document"]);
  if (value.formatVersion !== 1 || !isObject(value.document))
    throw new NoteContentError();
  keys(value.document, ["ops"]);
  const input = value.document.ops;
  if (
    !Array.isArray(input) ||
    input.length < 1 ||
    (bounded && input.length > MAX_NOTE_OPS)
  )
    throw new NoteContentError(
      "Notes contain too many formatting changes or an invalid document.",
    );
  if (bounded) checkBytes(value);
  const ops: NoteOperation[] = [];
  for (const op of input) {
    if (!isObject(op)) throw new NoteContentError();
    keys(op, ["insert", "attributes"]);
    if (typeof op.insert !== "string" || op.insert.length === 0)
      throw new NoteContentError();
    const attrs = attributes(op.attributes, op.insert);
    const previous = ops.at(-1);
    if (
      previous &&
      JSON.stringify(previous.attributes) === JSON.stringify(attrs)
    )
      previous.insert += op.insert;
    else
      ops.push({ insert: op.insert, ...(attrs ? { attributes: attrs } : {}) });
  }
  if (!ops.at(-1)?.insert.endsWith("\n")) throw new NoteContentError();
  const content: NoteContent = { formatVersion: 1, document: { ops } };
  if (bounded) checkBytes(content);
  return content;
}

export const noteContentsEqual = (a: NoteContent, b: NoteContent) =>
  JSON.stringify(a) === JSON.stringify(b);

export function parsePersonalNote(value: unknown): PersonalProblemNote {
  if (!isObject(value)) throw new NoteContentError();
  keys(value, ["content", "updatedAt"]);
  const content = parseNoteContent(value.content);
  const timestamp = value.updatedAt;
  if (
    timestamp !== null &&
    (typeof timestamp !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp) ||
      !Number.isFinite(Date.parse(timestamp)) ||
      new Date(timestamp).toISOString() !== timestamp)
  )
    throw new NoteContentError();
  if (timestamp === null && !noteContentsEqual(content, emptyNoteContent()))
    throw new NoteContentError();
  return { content, updatedAt: timestamp as string | null };
}
