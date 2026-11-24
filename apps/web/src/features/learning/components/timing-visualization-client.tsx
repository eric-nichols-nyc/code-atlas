"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Clock3Icon,
  LinkIcon,
  ListOrderedIcon,
  TimerIcon,
} from "@workspace/ui/components/icons";
import type { PreparedTimingVisualization } from "../lib/timing-visualization";
import styles from "./timing-visualization.module.css";
import { useWalkthroughPlayback } from "./use-walkthrough-playback";
import {
  WalkthroughConsole,
  WalkthroughPanel,
  WalkthroughWorkbench,
} from "./walkthrough-workbench";

const eventLabels = {
  input: "Input",
  skipped: "Skipped input",
  callback: "Callback",
  window: "Window",
};

export function TimingVisualizationClient({
  examples,
}: {
  examples: readonly [PreparedTimingVisualization, PreparedTimingVisualization];
}) {
  const playback = useWalkthroughPlayback(examples);
  const { example, exampleIndex, index, selectExample } = playback;
  const step = example.steps[index] ?? example.steps[0];
  const events = example.steps
    .slice(0, index + 1)
    .flatMap(({ id, time, events }, stepIndex) =>
      (events ?? []).map((event) => ({
        ...event,
        id: `${id}-${event.kind}`,
        time,
        current: stepIndex === index,
      })),
    );
  const logs = events
    .filter(({ kind }) => kind === "callback")
    .map(({ detail }) => detail);
  const isDebounce = example.label === "Debounce";
  const hasTimer = step.deadline !== undefined;

  return (
    <WalkthroughWorkbench
      title={example.title}
      icon={TimerIcon}
      playback={playback}
      theoryId="timing-theory"
      codeLines={example.codeLines}
      activeLines={step.lines}
      explanation={step.explanation}
      sourceLabel={`${example.label} JavaScript source`}
      boardClassName={styles.board}
      sourceControls={
        <fieldset className={styles.presets}>
          <legend className="sr-only">Example preset</legend>
          {examples.map((option, optionIndex) => (
            <Button
              key={option.id}
              type="button"
              size="xs"
              variant={exampleIndex === optionIndex ? "secondary" : "ghost"}
              aria-pressed={exampleIndex === optionIndex}
              onClick={() => selectExample(optionIndex)}
            >
              {option.label}
            </Button>
          ))}
        </fieldset>
      }
    >
      <WalkthroughPanel
        title="Timeline"
        icon={ListOrderedIcon}
        className={styles.timeline}
      >
        <div className={styles.clock}>
          <span>Elapsed time</span>
          <strong>{step.time} ms</strong>
        </div>
        {events.length ? (
          // biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden.
          <ol role="list" className={styles.events}>
            {events.map((event) => (
              <li key={event.id} data-current={event.current}>
                <span className={styles.time}>{event.time} ms</span>
                <span className={styles.event} data-kind={event.kind}>
                  {eventLabels[event.kind]}
                </span>
                <span className={styles.detail}>{event.detail}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>No input events yet</p>
        )}
      </WalkthroughPanel>
      <div className={styles.output}>
        <WalkthroughPanel
          title="Timer"
          icon={Clock3Icon}
          className={styles.timer}
        >
          {step.deadline === undefined ? (
            <p className={styles.empty}>
              {isDebounce ? "No pending timer" : "Window open"}
            </p>
          ) : (
            <dl className={styles.state}>
              <div>
                <dt>{isDebounce ? "Callback due" : "Window reopens"}</dt>
                <dd>{step.deadline} ms</dd>
              </div>
              <div>
                <dt>Time remaining</dt>
                <dd>{step.deadline - step.time} ms</dd>
              </div>
            </dl>
          )}
        </WalkthroughPanel>
        <WalkthroughPanel
          title="Closure State"
          icon={LinkIcon}
          className={styles.closure}
        >
          <dl className={styles.state}>
            <div>
              <dt>
                <code>{isDebounce ? "pending" : "blocked"}</code>
              </dt>
              <dd>
                {isDebounce
                  ? hasTimer
                    ? "Timer scheduled"
                    : "undefined"
                  : String(hasTimer)}
              </dd>
            </div>
            {step.pending !== undefined && (
              <div>
                <dt>Latest value</dt>
                <dd>{JSON.stringify(step.pending)}</dd>
              </div>
            )}
          </dl>
        </WalkthroughPanel>
        <WalkthroughConsole logs={logs} className={styles.console} />
      </div>
    </WalkthroughWorkbench>
  );
}
