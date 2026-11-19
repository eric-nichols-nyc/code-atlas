import type { PartialBlock, StyledText } from "@blocknote/core";

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
export type QuillNoteContent = {
  formatVersion: 1;
  document: { ops: NoteOperation[] };
};
export const noteBlockTypes = [
  "paragraph",
  "heading",
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
  "quote",
  "codeBlock",
  "divider",
] as const;
type NoteBlockType = (typeof noteBlockTypes)[number];
export type NoteBlock = Extract<PartialBlock, { type?: NoteBlockType }>;
export type BlockNoteContent = {
  formatVersion: 2;
  document: { blocks: NoteBlock[] };
};
export type NoteContent = QuillNoteContent | BlockNoteContent;

export type PersonalProblemNote = {
  content: NoteContent;
  updatedAt: string | null;
};

export const emptyNoteContent = (): QuillNoteContent => ({
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
export function parseNoteContent(
  value: QuillNoteContent,
  bounded?: boolean,
): QuillNoteContent;
export function parseNoteContent(
  value: unknown,
  bounded?: boolean,
): NoteContent;
export function parseNoteContent(value: unknown, bounded = true): NoteContent {
  if (!isObject(value)) throw new NoteContentError();
  keys(value, ["formatVersion", "document"]);
  if (value.formatVersion === 2) return parseBlockNote(value, bounded);
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

const colors = [
  "default",
  "gray",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
];

function noteText(
  value: unknown,
): StyledText<import("@blocknote/core").DefaultStyleSchema> {
  if (
    !isObject(value) ||
    value.type !== "text" ||
    typeof value.text !== "string" ||
    !isObject(value.styles)
  )
    throw new NoteContentError();
  keys(value, ["type", "text", "styles"]);
  const styles: Record<string, true | string> = {};
  for (const [key, style] of Object.entries(value.styles).sort()) {
    if (
      (["bold", "italic", "underline", "strike", "code"].includes(key) &&
        style === true) ||
      (["textColor", "backgroundColor"].includes(key) &&
        typeof style === "string" &&
        colors.includes(style))
    )
      styles[key] = style;
    else throw new NoteContentError();
  }
  return { type: "text", text: value.text, styles };
}

function noteInline(value: unknown) {
  if (!isObject(value) || value.type !== "link") return noteText(value);
  keys(value, ["type", "href", "content"]);
  const href = value.href;
  if (typeof href !== "string" || !isNoteLink(href))
    throw new NoteContentError("Use a complete http:// or https:// link.");
  if (!Array.isArray(value.content)) throw new NoteContentError();
  return { type: "link" as const, href, content: value.content.map(noteText) };
}

function parseBlockNote(
  value: Record<string, unknown>,
  bounded: boolean,
): BlockNoteContent {
  if (!isObject(value.document) || !Array.isArray(value.document.blocks))
    throw new NoteContentError();
  keys(value.document, ["blocks"]);
  if (bounded) checkBytes(value);
  const ids = new Set<string>();
  const parseBlock = (value: unknown, depth: number): NoteBlock => {
    if (
      depth > 24 ||
      !isObject(value) ||
      typeof value.id !== "string" ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(value.id) ||
      ids.has(value.id) ||
      typeof value.type !== "string" ||
      !noteBlockTypes.some((type) => type === value.type) ||
      !isObject(value.props) ||
      !Array.isArray(value.children)
    )
      throw new NoteContentError();
    ids.add(value.id);
    if (bounded && ids.size > MAX_NOTE_OPS) throw new NoteContentError();
    keys(value, ["id", "type", "props", "content", "children"]);
    const type = value.type;
    const props: Record<string, string | number | boolean> = {};
    for (const [key, prop] of Object.entries(value.props).sort()) {
      if (
        (["backgroundColor", "textColor"].includes(key) &&
          type !== "codeBlock" &&
          type !== "divider" &&
          typeof prop === "string" &&
          colors.includes(prop)) ||
        (key === "textAlignment" &&
          !["quote", "codeBlock", "divider"].includes(type) &&
          typeof prop === "string" &&
          ["left", "center", "right", "justify"].includes(prop)) ||
        (type === "heading" &&
          key === "level" &&
          typeof prop === "number" &&
          [1, 2, 3, 4, 5, 6].includes(prop)) ||
        (type === "heading" &&
          key === "isToggleable" &&
          typeof prop === "boolean") ||
        (type === "checkListItem" &&
          key === "checked" &&
          typeof prop === "boolean") ||
        (type === "numberedListItem" &&
          key === "start" &&
          typeof prop === "number" &&
          Number.isSafeInteger(prop)) ||
        (type === "codeBlock" &&
          key === "language" &&
          typeof prop === "string" &&
          /^[\w+.#-]{1,40}$/.test(prop))
      )
        props[key] = prop;
      else throw new NoteContentError();
    }
    let content: string | ReturnType<typeof noteInline>[] | undefined;
    if (type === "codeBlock" && typeof value.content === "string")
      content = value.content;
    else if (type !== "divider" && Array.isArray(value.content)) {
      content = value.content.map(
        type === "codeBlock"
          ? (item: unknown) => {
              const text = noteText(item);
              if (Object.keys(text.styles).length) throw new NoteContentError();
              return text;
            }
          : noteInline,
      );
    } else if (type !== "divider" || value.content !== undefined)
      throw new NoteContentError();
    return {
      id: value.id,
      type,
      props,
      ...(content === undefined ? {} : { content }),
      children: value.children.map((child) => parseBlock(child, depth + 1)),
    } as NoteBlock;
  };
  const blocks = value.document.blocks.map((block) => parseBlock(block, 0));
  return { formatVersion: 2, document: { blocks } };
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
  if (
    timestamp === null &&
    !noteContentsEqual(content, emptyNoteContent()) &&
    !(content.formatVersion === 2 && content.document.blocks.length === 0)
  )
    throw new NoteContentError();
  return { content, updatedAt: timestamp as string | null };
}
