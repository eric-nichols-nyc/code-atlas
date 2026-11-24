"use client";

import {
  ArrowRightIcon,
  CodeXmlIcon,
  ListOrderedIcon,
  Repeat2Icon,
  TerminalIcon,
} from "@workspace/ui/components/icons";
import { useId } from "react";
import type {
  GeneratorResult,
  PreparedGeneratorVisualization,
} from "../lib/generator-visualization";
import styles from "./generator-visualization.module.css";
import { useWalkthroughPlayback } from "./use-walkthrough-playback";
import player from "./walkthrough-player.module.css";
import { WalkthroughPlayerHeader } from "./walkthrough-player-header";
import { WalkthroughSource } from "./walkthrough-source";

const phaseLabels = {
  "not-created": "Not created",
  ready: "Ready",
  running: "Running",
  suspended: "Suspended",
  completed: "Completed",
};

function formatResult({ value, done }: GeneratorResult) {
  return `{ value: ${JSON.stringify(value) ?? "undefined"}, done: ${done} }`;
}

export function GeneratorVisualizationClient({
  example,
}: {
  example: PreparedGeneratorVisualization;
}) {
  const id = useId();
  const playback = useWalkthroughPlayback([example]);
  const { index, total } = playback;
  const step = example.steps[index] ?? example.steps[0];
  const { call } = step;
  const logs = example.steps
    .slice(0, index + 1)
    .flatMap(({ call }) =>
      call?.result
        ? [{ line: call.line, text: formatResult(call.result) }]
        : [],
    );

  return (
    <section className={player.visualizer} aria-labelledby={`${id}-title`}>
      <WalkthroughPlayerHeader
        title={example.title}
        titleId={`${id}-title`}
        icon={Repeat2Icon}
        playback={playback}
      >
        <a className={player.headerLink} href="#generators-theory">
          Theory
        </a>
      </WalkthroughPlayerHeader>
      <div className={player.explanation} aria-live="polite" aria-atomic="true">
        <span>
          Step {index + 1} of {total}
        </span>
        <p>{step.explanation}</p>
      </div>
      <div className={`${player.board} ${styles.board}`}>
        <div className={player.source}>
          <h2 className={player.panelTitle}>
            <CodeXmlIcon aria-hidden="true" />
            Input Script
          </h2>
          <WalkthroughSource
            codeLines={example.codeLines}
            activeLines={step.lines}
            label="Generator JavaScript source"
          />
        </div>
        <section className={styles.state} aria-labelledby={`${id}-state`}>
          <h2 id={`${id}-state`} className={player.panelTitle}>
            <Repeat2Icon aria-hidden="true" />
            Generator State
          </h2>
          <div className={styles.body}>
            <div className={styles.stateCard}>
              <div className={styles.stateHeading}>
                <code>cursor</code>
                <span className={styles.phase} data-phase={step.phase}>
                  {phaseLabels[step.phase]}
                </span>
              </div>
              <p>{step.location}</p>
            </div>
            <div className={styles.locals}>
              <h3>Local bindings</h3>
              {step.locals ? (
                <dl>
                  {Object.entries(step.locals).map(([name, value]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={styles.empty}>No active or saved bindings</p>
              )}
            </div>
          </div>
        </section>
        <div className={styles.output}>
          <section className={styles.flow} aria-labelledby={`${id}-flow`}>
            <h2 id={`${id}-flow`} className={player.panelTitle}>
              <ListOrderedIcon aria-hidden="true" />
              Call Flow
            </h2>
            <div className={styles.body}>
              {call ? (
                // biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden.
                <ol role="list" className={styles.flowSteps}>
                  <li>
                    <span>Caller · line {call.line}</span>
                    <code>{call.expression}</code>
                  </li>
                  <li>
                    <span>Generator</span>
                    <p>{call.transition}</p>
                  </li>
                  {call.result && (
                    <li>
                      <span>
                        <ArrowRightIcon aria-hidden="true" /> Result to caller
                      </span>
                      <code>{formatResult(call.result)}</code>
                    </li>
                  )}
                </ol>
              ) : (
                <p className={styles.empty}>No next() calls yet</p>
              )}
            </div>
          </section>
          <section className={styles.console} aria-labelledby={`${id}-console`}>
            <h2 id={`${id}-console`} className={player.panelTitle}>
              <TerminalIcon aria-hidden="true" />
              Console Output
            </h2>
            <div className={styles.body}>
              {logs.length ? (
                // biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden.
                <ol role="list" className={styles.logs}>
                  {logs.map(({ line, text }) => (
                    <li key={line}>
                      <code>{text}</code>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.empty}>No output yet</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
