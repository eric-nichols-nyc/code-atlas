"use client";

import {
  BoxIcon,
  CodeXmlIcon,
  LayersIcon,
  TerminalIcon,
} from "@workspace/ui/components/icons";
import { useId } from "react";
import type { PreparedHeapStackVisualization } from "../lib/heap-stack-visualization";
import styles from "./heap-stack-visualization.module.css";
import { useWalkthroughPlayback } from "./use-walkthrough-playback";
import player from "./walkthrough-player.module.css";
import { WalkthroughPlayerHeader } from "./walkthrough-player-header";
import { WalkthroughSource } from "./walkthrough-source";

export function HeapStackVisualizationClient({
  example,
}: {
  example: PreparedHeapStackVisualization;
}) {
  const id = useId();
  const playback = useWalkthroughPlayback([example]);
  const { index, total } = playback;
  const step = example.steps[index] ?? example.steps[0];
  // The tracked object is referenced only by the locals shown in this example.
  const refs = step.stack.flatMap((frame) =>
    Object.values(frame.bindings).flatMap((value) =>
      typeof value === "number" ? [] : [value.objectId],
    ),
  );

  return (
    <section className={player.visualizer} aria-labelledby={`${id}-title`}>
      <WalkthroughPlayerHeader
        title={example.title}
        titleId={`${id}-title`}
        icon={LayersIcon}
        playback={playback}
      >
        <a className={player.headerLink} href="#heap-stack-theory">
          Theory
        </a>
      </WalkthroughPlayerHeader>
      <div className={styles.explanation} aria-live="polite" aria-atomic="true">
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
            label="Heap and stack JavaScript source"
          />
        </div>
        <section className={styles.stack} aria-labelledby={`${id}-stack`}>
          <h2 id={`${id}-stack`} className={player.panelTitle}>
            <LayersIcon aria-hidden="true" />
            Call Stack
          </h2>
          <div className={styles.body}>
            {step.stack.length ? (
              // biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden.
              <ol role="list" className={styles.cards}>
                {step.stack.map((frame, position) => (
                  <li className={styles.card} key={frame.id}>
                    <div className={styles.cardHeader}>
                      <h3>{frame.title}</h3>
                      {position === 0 && <small>Top</small>}
                    </div>
                    {Object.keys(frame.bindings).length > 0 && (
                      <dl className={styles.bindings}>
                        {Object.entries(frame.bindings).map(([name, value]) => (
                          <div key={name}>
                            <dt>{name}</dt>
                            <dd>
                              {typeof value === "number" ? (
                                value
                              ) : (
                                <span className={styles.reference}>
                                  <span aria-hidden="true">→ </span>
                                  <span className="sr-only">Reference to </span>
                                  {value.objectId}
                                </span>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.empty}>Stack empty</p>
            )}
          </div>
        </section>
        <div className={styles.memory}>
          <section className={styles.heap} aria-labelledby={`${id}-heap`}>
            <h2 id={`${id}-heap`} className={player.panelTitle}>
              <BoxIcon aria-hidden="true" />
              Heap
            </h2>
            <div className={styles.body}>
              {step.heap.length ? (
                // biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden.
                <ul role="list" className={styles.cards}>
                  {step.heap.map((object) => {
                    const count = refs.filter(
                      (ref) => ref === object.id,
                    ).length;
                    return (
                      <li className={styles.card} key={object.id}>
                        <div className={styles.cardHeader}>
                          <h3>{object.id}</h3>
                          <small>
                            {count > 0
                              ? `${count} ${count === 1 ? "reference" : "references"}`
                              : "Eligible for collection"}
                          </small>
                        </div>
                        <dl className={styles.bindings}>
                          {Object.entries(object.properties).map(
                            ([name, value]) => (
                              <div key={name}>
                                <dt>{name}</dt>
                                <dd>{value}</dd>
                              </div>
                            ),
                          )}
                        </dl>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={styles.empty}>No tracked objects</p>
              )}
            </div>
          </section>
          <section className={styles.console} aria-labelledby={`${id}-console`}>
            <h2 id={`${id}-console`} className={player.panelTitle}>
              <TerminalIcon aria-hidden="true" />
              Console Output
            </h2>
            <div className={styles.body}>
              {step.output.length ? (
                // biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden.
                <ol role="list" className={styles.logs}>
                  {step.output.map((entry, position) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Console lines can repeat and have no local state.
                    <li key={position}>{entry}</li>
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
