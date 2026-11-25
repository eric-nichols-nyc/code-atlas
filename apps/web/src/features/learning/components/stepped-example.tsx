import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Slider } from "@workspace/ui/components/slider";
import { type ReactNode, useId, useState } from "react";
import {
  type CodeWalkthroughStep,
  sourceForStep,
} from "../lib/code-walkthrough";
import common from "./code-walkthrough.module.css";
import { StepControls } from "./step-controls";
import styles from "./stepped-example.module.css";

export function SteppedExample<Frame extends CodeWalkthroughStep>({
  definition,
  description,
  children,
}: {
  definition: {
    title: string;
    source: string;
    frames: readonly [Frame, ...Frame[]];
  };
  description: string;
  children: (frame: Frame, index: number) => ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const frame = definition.frames[index] ?? definition.frames[0];
  const total = definition.frames.length;
  const stepLabel = `Step ${index + 1} of ${total}`;

  return (
    <section className={common.walkthrough} aria-labelledby={`${id}-title`}>
      <header className={common.header}>
        <span className={common.eyebrow}>Worked example</span>
        <h3 className={common.title} id={`${id}-title`}>
          {definition.title}
        </h3>
        <p className={common.description}>{description}</p>
      </header>
      <div className={styles.body}>
        {children(frame, index)}
        <div aria-live="polite" aria-atomic="true">
          <p className={common.stepCount}>{stepLabel}</p>
          <p className={common.stepText}>{frame.explanation}</p>
        </div>
        <section
          className={styles.source}
          aria-label="Corresponding JavaScript lines"
        >
          {sourceForStep(definition.source, frame).map((line) => (
            <div key={line.number}>
              <span>Line {line.number}</span>
              <code>{line.text.trim()}</code>
            </div>
          ))}
        </section>
        <FieldGroup>
          <Field>
            <FieldLabel className="text-base" id={`${id}-step-label`}>
              Example step
            </FieldLabel>
            <Slider
              min={1}
              max={total}
              step={1}
              value={[index + 1]}
              aria-labelledby={`${id}-step-label`}
              aria-valuetext={stepLabel}
              onValueChange={([step]) => setIndex((step ?? 1) - 1)}
            />
          </Field>
        </FieldGroup>
        <StepControls index={index} total={total} onChange={setIndex} />
      </div>
    </section>
  );
}
