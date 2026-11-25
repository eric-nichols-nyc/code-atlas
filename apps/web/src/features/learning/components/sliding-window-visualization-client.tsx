"use client";

import type {
  SlidingWindowFrame,
  SlidingWindowVisualizationDefinition,
} from "../lib/sliding-window-visualization";
import styles from "./sliding-window-visualization.module.css";
import { SteppedExample } from "./stepped-example";
import exampleStyles from "./stepped-example.module.css";

export function SlidingWindowVisualizationClient({
  definition,
}: {
  definition: SlidingWindowVisualizationDefinition;
}) {
  return (
    <SteppedExample
      definition={definition}
      description="Follow the running sum as the three-value window moves from left to right."
    >
      {(frame, index) => (
        <WindowFrame
          values={definition.values}
          size={definition.size}
          frame={frame}
          previousSum={definition.frames[index - 1]?.sum ?? frame.sum}
        />
      )}
    </SteppedExample>
  );
}

function WindowFrame({
  values,
  size,
  frame,
  previousSum,
}: {
  values: readonly number[];
  size: number;
  frame: SlidingWindowFrame;
  previousSum: number;
}) {
  const { start, phase } = frame;
  const end = start + size - 1;
  const leaving = phase === "slide" ? start - 1 : -1;
  const entering = phase === "slide" ? end : -1;
  let equation = `Sum ${frame.sum}`;
  if (phase === "slide")
    equation = `${previousSum} − ${values[leaving]} + ${values[entering]} = ${frame.sum}`;
  if (phase === "complete") equation = `Return ${frame.best}`;

  return (
    <>
      <p className={exampleStyles.positions}>
        Size {size} · Indices {start}–{end}
      </p>
      <ol
        className={exampleStyles.cells}
        aria-label="Array values and active window"
      >
        {values.map((value, index) => {
          const active = index >= start && index <= end;
          const marker =
            index === leaving ? "Out" : index === entering ? "In" : "";
          const label = [
            `Index ${index}, value ${value}`,
            active && "in window",
            index === leaving && "leaving",
            index === entering && "entering",
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: A fixed array may contain repeated values and the cell represents an index.
              key={index}
              data-window-index={index}
              data-active={active}
              data-moving={marker || undefined}
              aria-label={label}
            >
              <span className={exampleStyles.marker} aria-hidden="true">
                {marker}
              </span>
              <span
                className={`${exampleStyles.value} ${styles.number}`}
                aria-hidden="true"
              >
                {value}
              </span>
              <span className={exampleStyles.index} aria-hidden="true">
                {index}
              </span>
            </li>
          );
        })}
      </ol>
      <section
        className={exampleStyles.readout}
        aria-label="Window sum and best sum"
      >
        <strong>{equation}</strong>
        <span>
          {phase === "complete"
            ? "Maximum window sum"
            : `Best sum ${frame.best}`}
        </span>
      </section>
    </>
  );
}
