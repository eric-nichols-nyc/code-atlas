"use client";

import { Badge } from "@workspace/ui/components/badge";
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
  const leftValue = definition.numbers[frame.left];
  const rightValue = definition.numbers[frame.right];
  const sum = (leftValue ?? 0) + (rightValue ?? 0);
  const compared = frame.phase === "compare" || frame.phase === "found";
  const found = frame.phase === "found";
  const previous = definition.frames[index - 1] ?? frame;

  return (
    <section className={common.walkthrough} aria-labelledby={`${id}-title`}>
      <header className={common.header}>
        <span className={common.eyebrow}>Worked example</span>
        <h3 className={common.title} id={`${id}-title`}>
          {definition.title}
        </h3>
        <p className={common.description}>
          Follow this fixed example with a target of {definition.target}. Move
          through the comparisons or jump to any step.
        </p>
      </header>
      <div className={styles.body}>
        <div className={styles.summary}>
          <Badge variant="secondary">Target: {definition.target}</Badge>
          <span className={styles.positions}>
            left = {frame.left} · right = {frame.right}
          </span>
        </div>
        <ol
          className={styles.array}
          aria-label="Array values and pointer positions"
        >
          {definition.numbers.map((value, cellIndex) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: An array cell is identified by its fixed index; duplicate values are allowed.
              key={cellIndex}
              data-array-index={cellIndex}
              data-left={cellIndex === frame.left}
              data-right={cellIndex === frame.right}
              data-discarded={cellIndex < frame.left || cellIndex > frame.right}
              data-match={
                found && (cellIndex === frame.left || cellIndex === frame.right)
              }
              aria-label={`Index ${cellIndex}, value ${value}${cellIndex === frame.left ? ", left pointer" : ""}${cellIndex === frame.right ? ", right pointer" : ""}${cellIndex < frame.left || cellIndex > frame.right ? ", ruled out" : ""}${found && (cellIndex === frame.left || cellIndex === frame.right) ? ", matching pair" : ""}`}
            >
              <span className={styles.pointer} aria-hidden="true">
                {cellIndex === frame.left
                  ? "left ↓"
                  : cellIndex === frame.right
                    ? "right ↓"
                    : "\u00a0"}
              </span>
              <span className={styles.value} aria-hidden="true">
                {value}
              </span>
              <span className={styles.index} aria-hidden="true">
                {cellIndex}
              </span>
            </li>
          ))}
        </ol>
        <section className={styles.equation} aria-label="Current comparison">
          {compared ? (
            <>
              <strong>
                {leftValue} + {rightValue} = {sum}
              </strong>
              <span>
                {sum > definition.target
                  ? `${sum} > ${definition.target} · sum too large`
                  : sum < definition.target
                    ? `${sum} < ${definition.target} · sum too small`
                    : `${sum} = ${definition.target} · target matched`}
              </span>
            </>
          ) : (
            <>
              <strong>
                {frame.phase === "initialize"
                  ? "Pointers ready"
                  : frame.phase === "move-right"
                    ? `right moved: ${previous.right} → ${frame.right}`
                    : `left moved: ${previous.left} → ${frame.left}`}
              </strong>
              <span>Next, compare the values at the pointers.</span>
            </>
          )}
        </section>
        <div aria-live="polite" aria-atomic="true">
          <p className={common.stepCount}>
            Step {index + 1} of {definition.frames.length}
          </p>
          <p className={common.stepText}>{frame.explanation}</p>
        </div>
        {found && (
          <p className={styles.result}>
            Return [{frame.left}, {frame.right}] · values {leftValue} and{" "}
            {rightValue}
          </p>
        )}
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
