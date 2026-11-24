"use client";

import { useId, useState } from "react";
import type { PreparedWalkthrough } from "../lib/code-walkthrough";
import styles from "./code-walkthrough.module.css";
import { StepControls } from "./step-controls";
import { WalkthroughSource } from "./walkthrough-source";

export function CodeWalkthroughClient({
  walkthrough,
}: {
  walkthrough: PreparedWalkthrough;
}) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const step = walkthrough.steps[index] ?? walkthrough.steps[0];

  return (
    <section className={styles.walkthrough} aria-labelledby={`${id}-title`}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Guided code walkthrough</span>
        <h3 className={styles.title} id={`${id}-title`}>
          {walkthrough.title}
        </h3>
        <p className={styles.description}>
          Follow the function one idea at a time, including its alternative
          branches. These steps explain the code without running it.
        </p>
      </header>
      <div className={styles.layout}>
        <WalkthroughSource
          codeLines={walkthrough.codeLines}
          activeLines={step.lines}
          label={`${walkthrough.title} JavaScript source`}
        />
        <div className={styles.guidance}>
          <div
            className={styles.explanation}
            aria-live="polite"
            aria-atomic="true"
          >
            <p className={styles.stepCount}>
              Step {index + 1} of {walkthrough.steps.length}
            </p>
            <p className={styles.stepText}>{step.explanation}</p>
          </div>
          <div className={styles.indicators} aria-hidden="true">
            {walkthrough.steps.map((item, stepIndex) => (
              <span
                key={item.id}
                data-current={stepIndex === index}
                data-visited={stepIndex < index}
              />
            ))}
          </div>
          <StepControls
            index={index}
            total={walkthrough.steps.length}
            onChange={setIndex}
          />
        </div>
      </div>
    </section>
  );
}
