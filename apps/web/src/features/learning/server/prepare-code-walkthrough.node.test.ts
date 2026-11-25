import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { twoPointersWalkthrough } from "@/content/shared/learn/two-pointers/walkthrough";

const state = vi.hoisted(() => ({ failHighlighting: false }));
vi.mock("@lezer/highlight", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lezer/highlight")>();
  return {
    ...actual,
    highlightTree: (...args: Parameters<typeof actual.highlightTree>) => {
      if (state.failHighlighting) throw new Error("Highlighting unavailable");
      return actual.highlightTree(...args);
    },
  };
});

import { CodeWalkthrough } from "../components/code-walkthrough";
import { normalizeCodeSource } from "../lib/code-walkthrough";
import { prepareCodeWalkthrough } from "./prepare-code-walkthrough";

afterEach(() => {
  state.failHighlighting = false;
});

describe("server walkthrough presentation", () => {
  it.each([
    twoPointersWalkthrough.source,
    "const text = `first\r\n\r\nlast`;\r\n// ending\r\n",
    "\nconst n = 1;\n\n",
  ])("reconstructs complete source including blank lines", (source) => {
    const prepared = prepareCodeWalkthrough({
      ...twoPointersWalkthrough,
      source,
    });
    expect(
      prepared.codeLines
        .map((line) => line.tokens.map((token) => token.text).join(""))
        .join("\n"),
    ).toBe(normalizeCodeSource(source));
    expect(prepared.codeLines.length).toBe(
      normalizeCodeSource(source).split("\n").length,
    );
  });

  it("prepares semantic syntax roles without changing source", () => {
    const prepared = prepareCodeWalkthrough(twoPointersWalkthrough);
    expect(prepared.codeLines.flatMap((line) => line.tokens)).toContainEqual({
      text: "function",
      offset: 0,
      role: "keyword",
    });
    expect(prepared.codeLines.flatMap((line) => line.tokens)).toContainEqual({
      text: "0",
      offset: twoPointersWalkthrough.source.indexOf("0;"),
      role: "number",
    });
    expect(prepared.codeLines.at(-1)?.tokens.at(-1)?.role).toBe("comment");
  });

  it("retains plain source and guidance if optional syntax coloring fails", () => {
    state.failHighlighting = true;
    const prepared = prepareCodeWalkthrough(twoPointersWalkthrough);
    expect(
      prepared.codeLines
        .flatMap((line) => line.tokens)
        .every((token) => !token.role),
    ).toBe(true);
    expect(
      prepared.codeLines
        .map((line) => line.tokens.map((token) => token.text).join(""))
        .join("\n"),
    ).toBe(twoPointersWalkthrough.source);
    expect(prepared.steps).toEqual(twoPointersWalkthrough.steps);
  });

  it("escapes source text instead of interpreting markup", () => {
    const html = renderToStaticMarkup(
      createElement(CodeWalkthrough, {
        definition: {
          ...twoPointersWalkthrough,
          source: 'const text = "</script><img src=x>";\n'.repeat(17),
        },
      }),
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;/script&gt;&lt;img src=x&gt;");
  });

  it.each([
    null,
    { ...twoPointersWalkthrough, steps: [] },
    {
      ...twoPointersWalkthrough,
      steps: [{ id: "bad", explanation: "Invalid reference", lines: [99] }],
    },
  ])(
    "keeps surrounding prose and available source for malformed data",
    (definition) => {
      const html = renderToStaticMarkup(
        createElement(
          "article",
          null,
          "Surrounding lesson prose",
          createElement(CodeWalkthrough, { definition }),
        ),
      );
      expect(html).toContain("Surrounding lesson prose");
      expect(html).toContain("Guided walkthrough unavailable.");
      expect(html).not.toContain("<button");
      expect(html).not.toContain("Step 1 of");
      if (definition) expect(html).toContain("function isPalindrome");
    },
  );
});
