"use client";

import "@mantine/core/styles.layer.css";
import "@blocknote/mantine/style.css";

import {
  BlockNoteSchema,
  type DefaultStyleSchema,
  defaultBlockSpecs,
  type Link,
  type StyledText,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "@workspace/ui/components/theme-provider";
import {
  emptyNoteContent,
  isNoteLink,
  type NoteBlock,
  type NoteContent,
  noteBlockTypes,
} from "../lib/problem-notes-contract";

const schema = BlockNoteSchema.create({
  blockSpecs: Object.fromEntries(
    noteBlockTypes.map((type) => [type, defaultBlockSpecs[type]]),
  ) as Pick<typeof defaultBlockSpecs, (typeof noteBlockTypes)[number]>,
});

function initialBlocks(content: NoteContent): NoteBlock[] | undefined {
  if (content.formatVersion === 2)
    return content.document.blocks.length ? content.document.blocks : undefined;

  const blocks: NoteBlock[] = [];
  let line: (StyledText<DefaultStyleSchema> | Link<DefaultStyleSchema>)[] = [];
  for (const { insert, attributes } of content.document.ops) {
    for (const [index, text] of insert.split("\n").entries()) {
      if (index > 0) {
        if (attributes?.["code-block"]) {
          const source = line
            .map((item) =>
              item.type === "text"
                ? item.text
                : item.content.map((part) => part.text).join(""),
            )
            .join("");
          const previous = blocks.at(-1);
          if (previous?.type === "codeBlock") previous.content += `\n${source}`;
          else blocks.push({ type: "codeBlock", content: source });
        } else {
          const type = attributes?.blockquote
            ? "quote"
            : attributes?.list === "bullet"
              ? "bulletListItem"
              : attributes?.list === "ordered"
                ? "numberedListItem"
                : "paragraph";
          blocks.push({ type, content: line });
        }
        line = [];
      }
      if (text) {
        const styled: StyledText<DefaultStyleSchema> = {
          type: "text",
          text,
          styles: {
            ...(attributes?.bold ? { bold: true } : {}),
            ...(attributes?.italic ? { italic: true } : {}),
          },
        };
        line.push(
          attributes?.link
            ? { type: "link", href: attributes.link, content: [styled] }
            : styled,
        );
      }
    }
  }
  return blocks;
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
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote({
    schema,
    links: { isValidLink: isNoteLink },
    initialContent: initialBlocks(content),
    domAttributes: {
      editor: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelId,
        "aria-describedby": descriptionId,
      },
    },
  });

  return (
    <div className="problem-notes-editor min-h-0 min-w-0 flex-1 overflow-auto rounded-md border [[data-layout=flow]_&]:min-h-40">
      <BlockNoteView
        editor={editor}
        theme={
          resolvedTheme === "dark" || resolvedTheme === "dark-purple"
            ? "dark"
            : "light"
        }
        onChange={(editor) => {
          const blocks = editor.document;
          const empty = blocks.every(
            (block) =>
              block.type === "paragraph" &&
              block.content.length === 0 &&
              block.children.length === 0,
          );
          onChange(
            empty
              ? emptyNoteContent()
              : { formatVersion: 2, document: { blocks } },
          );
        }}
      />
    </div>
  );
}
