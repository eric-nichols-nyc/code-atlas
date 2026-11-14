"use client";

import "quill/dist/quill.core.css";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import {
  BoldIcon,
  CodeXmlIcon,
  EraserIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
} from "@workspace/ui/components/icons";
import { Input } from "@workspace/ui/components/input";
import Quill, { type Range } from "quill";
import { useEffect, useId, useRef, useState } from "react";
import {
  isNoteLink,
  type NoteContent,
  noteContentsEqual,
  parseNoteContent,
} from "../lib/problem-notes-contract";

const controls = [
  { name: "bold", label: "Bold", icon: BoldIcon, value: true },
  { name: "italic", label: "Italic", icon: ItalicIcon, value: true },
  { name: "blockquote", label: "Blockquote", icon: QuoteIcon, value: true },
  {
    name: "list",
    label: "Ordered list",
    icon: ListOrderedIcon,
    value: "ordered",
  },
  { name: "list", label: "Bulleted list", icon: ListIcon, value: "bullet" },
  { name: "code-block", label: "Code block", icon: CodeXmlIcon, value: true },
] as const;

function prepareDocumentFocus(root: HTMLElement) {
  // Chromium otherwise adds an implicit Tab stop to overflowing code blocks.
  for (const node of root.querySelectorAll(".ql-code-block-container")) {
    if (node.getAttribute("tabindex") !== "-1")
      node.setAttribute("tabindex", "-1");
  }
}

export default function ProblemNotesEditor({
  content,
  onChange,
  labelId,
  descriptionId,
}: {
  content: NoteContent;
  onChange: (content: NoteContent) => void;
  labelId: string;
  descriptionId: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<Quill | null>(null);
  const current = useRef(content);
  const changed = useRef(onChange);
  current.current = content;
  changed.current = onChange;
  const snapshot = useRef(content);
  const selection = useRef<Range>({ index: 0, length: 0 });
  const [formats, setFormats] = useState<Record<string, unknown>>({});
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const linkInput = useRef<HTMLInputElement>(null);
  const linkButton = useRef<HTMLButtonElement>(null);
  const linkId = useId();

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const node = container.appendChild(document.createElement("div"));
    const quill = new Quill(node, {
      formats: ["bold", "italic", "blockquote", "list", "code-block", "link"],
      placeholder: "Capture patterns, mistakes, and takeaways…",
      modules: {
        toolbar: false,
        syntax: false,
        uploader: false,
        history: { userOnly: true },
        keyboard: {
          bindings: {
            indent: false,
            outdent: false,
            "indent code-block": false,
            "outdent code-block": false,
            "remove tab": false,
            tab: false,
          },
        },
      },
    });
    editor.current = quill;
    quill.root.setAttribute("role", "textbox");
    quill.root.setAttribute("aria-multiline", "true");
    quill.root.setAttribute("aria-labelledby", labelId);
    quill.root.setAttribute("aria-describedby", descriptionId);
    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (_node, delta) => {
      for (const op of delta.ops) {
        if (op.attributes?.link && !isNoteLink(op.attributes.link))
          delete op.attributes.link;
      }
      return delta;
    });
    quill.setContents(current.current.document.ops, "silent");
    prepareDocumentFocus(quill.root);
    snapshot.current = current.current;
    const refresh = () => {
      const range = quill.getSelection();
      if (range) selection.current = range;
      setFormats(quill.getFormat(selection.current));
    };
    const update = () => {
      prepareDocumentFocus(quill.root);
      try {
        const next = parseNoteContent(
          { formatVersion: 1, document: { ops: quill.getContents().ops } },
          false,
        );
        snapshot.current = next;
        changed.current(next);
        setError("");
      } catch {
        setError(
          "This formatting could not be applied. Clear formatting and retry.",
        );
      }
      refresh();
    };
    quill.on("text-change", update);
    quill.on("selection-change", refresh);
    return () => {
      quill.off("text-change", update);
      quill.off("selection-change", refresh);
      quill.disable();
      editor.current = null;
      container.replaceChildren();
    };
  }, [labelId, descriptionId]);

  useEffect(() => {
    if (editor.current && !noteContentsEqual(content, snapshot.current)) {
      editor.current.setContents(content.document.ops, "silent");
      prepareDocumentFocus(editor.current.root);
      snapshot.current = content;
    }
  }, [content]);
  useEffect(() => {
    if (linkOpen) linkInput.current?.focus();
  }, [linkOpen]);

  const restoreSelection = () => {
    const quill = editor.current;
    if (quill) quill.setSelection(selection.current, "silent");
    return quill;
  };
  const closeLink = () => {
    setLinkOpen(false);
    setError("");
    linkButton.current?.focus();
  };
  const applyLink = () => {
    if (!isNoteLink(link)) {
      setError("Use a complete http:// or https:// link.");
      return;
    }
    const quill = restoreSelection();
    if (!quill) return;
    const range = selection.current;
    if (range.length)
      quill.formatText(range.index, range.length, "link", link, "user");
    else {
      quill.insertText(range.index, link, { link }, "user");
      quill.setSelection(range.index + link.length, 0, "silent");
    }
    setLinkOpen(false);
    setError("");
    quill.focus();
  };

  return (
    <div className="problem-notes-editor flex min-h-0 min-w-0 flex-1 flex-col rounded-md border">
      <fieldset
        aria-label="Notes formatting"
        className="flex shrink-0 flex-wrap gap-1 border-b p-2"
      >
        {controls.map((control) => {
          const active =
            control.name === "list"
              ? formats.list === control.value
              : Boolean(formats[control.name]);
          return (
            <Button
              key={control.label}
              type="button"
              variant={active ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label={control.label}
              title={control.label}
              aria-pressed={active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const quill = restoreSelection();
                quill?.format(
                  control.name,
                  active ? false : control.value,
                  "user",
                );
                quill?.focus();
                setFormats(quill?.getFormat(selection.current) ?? {});
              }}
            >
              <control.icon aria-hidden="true" />
            </Button>
          );
        })}
        <Button
          ref={linkButton}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Insert link"
          title="Insert link"
          aria-expanded={linkOpen}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setLink(typeof formats.link === "string" ? formats.link : "");
            setLinkOpen((v) => !v);
            setError("");
          }}
        >
          <LinkIcon aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear formatting"
          title="Clear formatting"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            const quill = restoreSelection();
            if (!quill) return;
            const range = selection.current;
            if (range.length)
              quill.removeFormat(range.index, range.length, "user");
            else
              for (const name of [
                "bold",
                "italic",
                "blockquote",
                "list",
                "code-block",
                "link",
              ])
                quill.format(name, false, "user");
            quill.focus();
            setFormats(quill.getFormat(selection.current));
            setError("");
          }}
        >
          <EraserIcon aria-hidden="true" />
        </Button>
      </fieldset>
      {linkOpen && (
        <Field className="shrink-0 border-b p-3" data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={linkId}>Link URL</FieldLabel>
          <Input
            ref={linkInput}
            id={linkId}
            value={link}
            type="url"
            placeholder="https://example.com"
            aria-invalid={Boolean(error)}
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                closeLink();
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={applyLink}>
              Apply link
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={closeLink}>
              Cancel
            </Button>
          </div>
        </Field>
      )}
      {error && <FieldError className="shrink-0 px-3 py-2">{error}</FieldError>}
      <div ref={host} className="min-h-0 flex-1 overflow-hidden" />
    </div>
  );
}
