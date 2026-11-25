"use client";

import type {
  TwoPointerFrame,
  TwoPointerVisualizationDefinition,
} from "../lib/two-pointer-visualization";
import { SteppedExample } from "./stepped-example";
import exampleStyles from "./stepped-example.module.css";
import styles from "./two-pointer-visualization.module.css";

export function TwoPointerVisualizationClient({
  definition,
}: {
  definition: TwoPointerVisualizationDefinition;
}) {
  return (
    <SteppedExample
      definition={definition}
      description="Step through the letter comparisons or jump to any step."
    >
      {(frame) => <PalindromeFrame word={definition.word} frame={frame} />}
    </SteppedExample>
  );
}

function PalindromeFrame({
  word,
  frame,
}: {
  word: string;
  frame: TwoPointerFrame;
}) {
  const leftLetter = word[frame.left];
  const rightLetter = word[frame.right];
  const comparing = frame.phase === "compare";
  const match = comparing && leftLetter === rightLetter;
  const complete = frame.phase === "complete";
  const crossed = frame.left > frame.right;

  return (
    <>
      <p className={exampleStyles.positions}>
        left = {frame.left} · right = {frame.right}
      </p>
      <ol
        className={exampleStyles.cells}
        aria-label="Letters and pointer positions"
      >
        {word.split("").map((letter, cellIndex) => {
          const left = !crossed && cellIndex === frame.left;
          const right = !crossed && cellIndex === frame.right;
          const checked = cellIndex < frame.left || cellIndex > frame.right;
          const matching = match && (left || right);
          const label = [
            `Index ${cellIndex}, letter ${letter}`,
            left && "left pointer",
            right && "right pointer",
            (checked || matching) && "matched",
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: Each letter occupies a fixed index and may repeat.
              key={cellIndex}
              data-character-index={cellIndex}
              data-left={left}
              data-right={right}
              data-checked={checked}
              data-match={matching}
              aria-label={label}
            >
              <span className={exampleStyles.marker} aria-hidden="true">
                {left && right ? "L/R ↓" : left ? "L ↓" : right ? "R ↓" : ""}
              </span>
              <span
                className={`${exampleStyles.value} ${styles.letter}`}
                aria-hidden="true"
              >
                {letter}
              </span>
              <span className={exampleStyles.index} aria-hidden="true">
                {cellIndex}
              </span>
            </li>
          );
        })}
      </ol>
      <section
        className={exampleStyles.readout}
        aria-label="Current comparison"
      >
        <strong>
          {comparing
            ? `“${leftLetter}” ${match ? "=" : "≠"} “${rightLetter}”`
            : complete
              ? "Return true"
              : "Pointers ready"}
        </strong>
        <span>
          {comparing
            ? match
              ? "Match · move both pointers inward"
              : "Mismatch · return false"
            : complete
              ? "All mirrored pairs match"
              : "Compare the first and last letters"}
        </span>
      </section>
    </>
  );
}
