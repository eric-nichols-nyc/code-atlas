"use client";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import {
  bracketMatching,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { useTheme } from "@workspace/ui/components/theme-provider";
import { useEffect, useRef } from "react";
import { useProblemSession } from "../state/problem-session";

const syntax = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--code-keyword)" },
  { tag: tags.string, color: "var(--code-string)" },
  { tag: tags.comment, color: "var(--code-comment)" },
  { tag: tags.number, color: "var(--code-number)" },
]);
function appearance(dark: boolean) {
  return EditorView.theme(
    {
      "&": {
        height: "100%",
        backgroundColor: "var(--card)",
        color: "var(--foreground)",
      },
      ".cm-scroller": {
        overflow: "auto",
        fontFamily: "Menlo, monospace",
        fontSize: "13px",
        lineHeight: "24px",
      },
      ".cm-content": { padding: "16px 0", caretColor: "var(--foreground)" },
      ".cm-gutters": {
        backgroundColor: "var(--card)",
        color: "var(--muted-foreground)",
        border: "none",
      },
      ".cm-activeLine, .cm-activeLineGutter": {
        backgroundColor: "var(--badge-blue)",
      },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
        backgroundColor: "var(--accent)",
      },
      ".cm-tooltip": {
        backgroundColor: "var(--popover)",
        borderColor: "var(--border)",
        color: "var(--popover-foreground)",
      },
    },
    { dark },
  );
}
export default function JavaScriptEditor() {
  const s = useProblemSession();
  const { resolvedTheme } = useTheme();
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const current = useRef(s);
  current.current = s;
  useEffect(() => {
    if (!host.current) return;
    const theme = current.current.editorTheme;
    theme.current ??= new Compartment();
    const saved = current.current.editorState.current;
    const state =
      saved ??
      EditorState.create({
        doc: current.current.source,
        extensions: [
          lineNumbers(),
          history(),
          drawSelection(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          javascript(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          syntaxHighlighting(syntax),
          keymap.of([
            {
              key: "Mod-Enter",
              run: () => {
                current.current.editorCallbacks.current?.run();
                return true;
              },
            },
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            ...completionKeymap,
          ]),
          theme.current.of(
            appearance(document.documentElement.classList.contains("dark")),
          ),
          EditorView.contentAttributes.of({
            "aria-label": "JavaScript solution",
            spellcheck: "false",
          }),
          EditorView.updateListener.of((update) => {
            current.current.editorState.current = update.state;
            if (update.docChanged)
              current.current.editorCallbacks.current?.setSource(
                update.state.doc.toString(),
              );
          }),
        ],
      });
    const instance = new EditorView({ parent: host.current, state });
    view.current = instance;
    // A restored state carries the old compartment object; retain it alongside the state.
    return () => {
      current.current.editorState.current = instance.state;
      instance.destroy();
      view.current = null;
    };
  }, []);
  useEffect(() => {
    const instance = view.current;
    const theme = current.current.editorTheme;
    if (instance && theme.current)
      instance.dispatch({
        effects: theme.current.reconfigure(
          appearance(resolvedTheme === "dark"),
        ),
      });
  }, [resolvedTheme]);
  useEffect(() => {
    const instance = view.current;
    if (instance && instance.state.doc.toString() !== s.source)
      instance.dispatch({
        changes: { from: 0, to: instance.state.doc.length, insert: s.source },
      });
  }, [s.source]);
  return (
    <div
      ref={host}
      className="h-full min-h-0 min-w-0"
      data-testid="javascript-editor"
    />
  );
}
