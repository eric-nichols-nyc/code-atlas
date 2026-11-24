import "server-only";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import { highlightTree, tagHighlighter, tags } from "@lezer/highlight";
import {
  type CodeTokenRole,
  type CodeWalkthroughDefinition,
  normalizeCodeSource,
  type PreparedWalkthrough,
} from "../lib/code-walkthrough";

const highlighter = tagHighlighter([
  { tag: tags.keyword, class: "keyword" },
  { tag: tags.string, class: "string" },
  { tag: tags.number, class: "number" },
  { tag: tags.comment, class: "comment" },
]);

export function prepareCodeWalkthrough(
  definition: CodeWalkthroughDefinition,
): PreparedWalkthrough {
  return { ...definition, ...prepareCodeSource(definition.source) };
}

export function prepareCodeSource(
  code: string,
): Pick<PreparedWalkthrough, "source" | "codeLines"> {
  const source = normalizeCodeSource(code);
  const spans: { from: number; to: number; role: CodeTokenRole }[] = [];
  try {
    highlightTree(
      javascriptLanguage.parser.parse(source),
      highlighter,
      (from, to, role) => {
        spans.push({ from, to, role: role as CodeTokenRole });
      },
    );
  } catch {
    // Syntax color is optional; the complete source and guidance remain usable.
    spans.length = 0;
  }
  let currentLine: PreparedWalkthrough["codeLines"][number] = {
    number: 1,
    tokens: [],
  };
  const codeLines = [currentLine];
  let offset = 0;
  function append(text: string, role?: CodeTokenRole) {
    for (const [index, part] of text.split("\n").entries()) {
      if (index > 0) {
        currentLine = { number: codeLines.length + 1, tokens: [] };
        codeLines.push(currentLine);
        offset += 1;
      }
      if (part)
        currentLine.tokens.push({
          text: part,
          offset,
          role,
        });
      offset += part.length;
    }
  }
  let cursor = 0;
  for (const { from, to, role } of spans) {
    append(source.slice(cursor, from));
    append(source.slice(from, to), role);
    cursor = to;
  }
  append(source.slice(cursor));
  return { source, codeLines };
}
