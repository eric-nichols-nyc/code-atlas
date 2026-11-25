"use client";

import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Slider } from "@workspace/ui/components/slider";
import { useId, useState } from "react";
import {
  sourceForFrame,
  type TwoPointerVisualizationDefinition,
} from "../lib/two-pointer-visualization";
import common from "./code-walkthrough.module.css";
import { StepControls } from "./step-controls";
import styles from "./two-pointer-visualization.module.css";

export function TwoPointerVisualizationClient({
  definition,
}: {
  definition: TwoPointerVisualizationDefinition;
}) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const frame = definition.frames[index] ?? definition.frames[0];
  const leftLetter = definition.word[frame.left];
  const rightLetter = definition.word[frame.right];
  const comparing = frame.phase === "compare";
  const match = comparing && leftLetter === rightLetter;
  const complete = frame.phase === "complete";
  const crossed = frame.left > frame.right;

  return (
    <section className={common.walkthrough} aria-labelledby={`${id}-title`}>
      <header className={common.header}>
        <span className={common.eyebrow}>Worked example</span>
        <h3 className={common.title} id={`${id}-title`}>
          {definition.title}
        </h3>
        <p className={common.description}>
          Step through the letter comparisons or jump to any step.
        </p>
      </header>
      <div className={styles.body}>
        <p className={styles.positions}>
          left = {frame.left} · right = {frame.right}
        </p>
        <ol
          className={styles.letters}
          aria-label="Letters and pointer positions"
        >
          {definition.word.split("").map((letter, cellIndex) => {
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
                <span className={styles.pointer} aria-hidden="true">
                  {left && right ? "L/R ↓" : left ? "L ↓" : right ? "R ↓" : ""}
                </span>
                <span className={styles.value} aria-hidden="true">
                  {letter}
                </span>
                <span className={styles.index} aria-hidden="true">
                  {cellIndex}
                </span>
              </li>
            );
          })}
        </ol>
        <section className={styles.comparison} aria-label="Current comparison">
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
        <div aria-live="polite" aria-atomic="true">
          <p className={common.stepCount}>
            Step {index + 1} of {definition.frames.length}
          </p>
          <p className={common.stepText}>{frame.explanation}</p>
        </div>
        <section
          className={styles.source}
          aria-label="Corresponding JavaScript lines"
        >
          {sourceForFrame(definition.source, frame).map((line) => (
            <div key={line.number}>
              <span>Line {line.number}</span>
              <code>{line.text.trim()}</code>
            </div>
          ))}
        </section>
        <FieldGroup>
          <Field>
            <FieldLabel id={`${id}-step-label`}>Example step</FieldLabel>
            <Slider
              min={1}
              max={definition.frames.length}
              step={1}
              value={[index + 1]}
              aria-labelledby={`${id}-step-label`}
              aria-valuetext={`Step ${index + 1} of ${definition.frames.length}`}
              onValueChange={([step]) => setIndex((step ?? 1) - 1)}
            />
          </Field>
        </FieldGroup>
        <StepControls
          index={index}
          total={definition.frames.length}
          onChange={setIndex}
        />
      </div>
    </section>
  );
}
