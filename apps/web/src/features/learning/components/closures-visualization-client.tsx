"use client";

import { LayersIcon, LinkIcon } from "@workspace/ui/components/icons";
import type { PreparedClosuresVisualization } from "../lib/closures-visualization";
import styles from "./closures-visualization.module.css";
import { useWalkthroughPlayback } from "./use-walkthrough-playback";
import {
  WalkthroughConsole,
  WalkthroughPanel,
  WalkthroughWorkbench,
} from "./walkthrough-workbench";

export function ClosuresVisualizationClient({
  example,
}: {
  example: PreparedClosuresVisualization;
}) {
  const playback = useWalkthroughPlayback([example]);
  const step = example.steps[playback.index] ?? example.steps[0];
  const { frame } = step;
  const scopes = Object.entries(step.totals);
  const logs = example.steps
    .slice(0, playback.index + 1)
    .flatMap(({ log }) => (log === undefined ? [] : [String(log)]));

  return (
    <WalkthroughWorkbench
      title={example.title}
      icon={LinkIcon}
      playback={playback}
      theoryId="closures-theory"
      codeLines={example.codeLines}
      activeLines={step.lines}
      explanation={step.explanation}
      sourceLabel="Closures JavaScript source"
      boardClassName={styles.board}
    >
      <WalkthroughPanel
        title="Call Stack"
        icon={LayersIcon}
        className={styles.stack}
      >
        {/* biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden. */}
        <ol role="list" className={styles.cards}>
          {frame.kind !== "script" && (
            <li className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>
                  {frame.kind === "factory" ? "makeMeter()" : "add()"} ·{" "}
                  {frame.meter}
                </h3>
                <small>Top</small>
              </div>
              {frame.kind === "add" && (
                <dl className={styles.binding}>
                  <dt>amount</dt>
                  <dd>{frame.amount}</dd>
                </dl>
              )}
            </li>
          )}
          <li className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Script</h3>
              {frame.kind === "script" && <small>Top</small>}
            </div>
          </li>
        </ol>
      </WalkthroughPanel>
      <div className={styles.output}>
        <WalkthroughPanel
          title="Scope Chain"
          icon={LinkIcon}
          className={styles.scope}
        >
          {frame.kind === "add" && (
            <p className={styles.lookup}>
              <code>add()</code> <span aria-hidden="true">→</span>
              <span className="sr-only"> looks in </span>{" "}
              <code>makeMeter() · {frame.meter}</code>
            </p>
          )}
          {scopes.length ? (
            // biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden.
            <ul role="list" className={styles.cards}>
              {scopes.map(([name, total]) => {
                const factoryActive =
                  frame.kind === "factory" && frame.meter === name;
                const accessed = frame.kind === "add" && frame.meter === name;
                return (
                  <li
                    key={name}
                    className={styles.card}
                    data-accessed={accessed}
                  >
                    <div className={styles.cardHeader}>
                      <h3>makeMeter() · {name}</h3>
                      <small>
                        {factoryActive
                          ? "Factory active"
                          : accessed
                            ? "Retained · in use"
                            : "Retained"}
                      </small>
                    </div>
                    <dl className={styles.binding}>
                      <dt>total</dt>
                      <dd>{total}</dd>
                    </dl>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.lookup}>No captured bindings yet</p>
          )}
        </WalkthroughPanel>
        <WalkthroughConsole logs={logs} className={styles.console} />
      </div>
    </WalkthroughWorkbench>
  );
}
