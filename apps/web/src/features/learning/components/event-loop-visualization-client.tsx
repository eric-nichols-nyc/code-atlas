"use client";

import { Button } from "@workspace/ui/components/button";
import {
  BoxIcon,
  CodeXmlIcon,
  LayersIcon,
  RefreshCwIcon,
  TerminalIcon,
  ZapIcon,
} from "@workspace/ui/components/icons";
import { useId } from "react";
import type { PreparedEventLoopPreset } from "../lib/event-loop-visualization";
import { EventLoopOutputPrediction } from "./event-loop-output-prediction";
import styles from "./event-loop-visualization.module.css";
import { useWalkthroughPlayback } from "./use-walkthrough-playback";
import player from "./walkthrough-player.module.css";
import { WalkthroughPlayerHeader } from "./walkthrough-player-header";
import { WalkthroughSource } from "./walkthrough-source";

type Lane = "stack" | "apis" | "microtasks" | "tasks" | "console";
const lanes: Record<
  Lane,
  { title: string; Icon: typeof LayersIcon; empty: string; firstLabel?: string }
> = {
  stack: {
    title: "Call Stack",
    Icon: LayersIcon,
    empty: "Stack empty",
    firstLabel: "Top",
  },
  apis: { title: "Web APIs", Icon: ZapIcon, empty: "No pending timers" },
  microtasks: {
    title: "Microtask Queue",
    Icon: ZapIcon,
    empty: "Queue empty",
    firstLabel: "Next",
  },
  tasks: {
    title: "Macrotask Queue",
    Icon: BoxIcon,
    empty: "Queue empty",
    firstLabel: "Next",
  },
  console: {
    title: "Actual Output",
    Icon: TerminalIcon,
    empty: "No output yet",
  },
};

function RuntimeLane({
  lane,
  items,
}: {
  lane: Lane;
  items: readonly string[];
}) {
  const { title, Icon, empty, firstLabel } = lanes[lane];
  return (
    <section className={styles.lane} data-lane={lane} aria-label={title}>
      <h2 className={player.panelTitle}>
        <Icon aria-hidden="true" />
        {title}
      </h2>
      <div className={styles.laneBody}>
        {items.length ? (
          // biome-ignore lint/a11y/noRedundantRoles: Safari can omit list semantics when CSS hides the markers.
          <ol role="list">
            {items.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Entries have no local state and repeated log text is valid.
              <li key={index}>
                <span>{item}</span>
                {index === 0 && firstLabel && <small>{firstLabel}</small>}
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>{empty}</p>
        )}
      </div>
    </section>
  );
}

export function EventLoopVisualizationClient({
  title,
  presets,
}: {
  title: string;
  presets: readonly [PreparedEventLoopPreset, ...PreparedEventLoopPreset[]];
}) {
  const id = useId();
  const playback = useWalkthroughPlayback(presets);
  const {
    example: preset,
    exampleIndex,
    index,
    playing,
    selectExample,
  } = playback;
  const { steps, codeLines, predictionOrder } = preset;
  const predictionId = `${presets[0].id}-prediction`;
  const finalOutput = steps.at(-1)?.output;
  const step = steps[index] ?? steps[0];
  const stepCount = `Step ${index + 1} of ${steps.length}`;

  return (
    <section
      className={`${player.visualizer} ${styles.visualizer}`}
      aria-labelledby={`${id}-title`}
    >
      <WalkthroughPlayerHeader
        title={title}
        titleId={`${id}-title`}
        icon={RefreshCwIcon}
        playback={playback}
      >
        <a className={player.headerLink} href="#event-loop-theory">
          Theory
        </a>
        {predictionOrder && (
          <a className={player.headerLink} href={`#${predictionId}`}>
            Predict the output
          </a>
        )}
      </WalkthroughPlayerHeader>
      <div className={`${player.board} ${styles.board}`}>
        <div className={player.source}>
          <div className={`${player.panelTitle} ${styles.sourceHeader}`}>
            <h2>
              <CodeXmlIcon aria-hidden="true" />
              Input Script
            </h2>
            <fieldset className={styles.presets}>
              <legend className="sr-only">Example preset</legend>
              {presets.map((option, optionIndex) => (
                <Button
                  key={option.id}
                  type="button"
                  size="xs"
                  className={styles.presetButton}
                  variant={exampleIndex === optionIndex ? "secondary" : "ghost"}
                  aria-pressed={exampleIndex === optionIndex}
                  onClick={() => selectExample(optionIndex)}
                >
                  {option.label}
                </Button>
              ))}
            </fieldset>
          </div>
          <WalkthroughSource
            key={preset.id}
            codeLines={codeLines}
            activeLines={step.lines}
            label="Event loop JavaScript source"
          />
        </div>
        <section className={styles.runtime} aria-label="Runtime">
          <RuntimeLane lane="stack" items={step.stack} />
          <RuntimeLane lane="apis" items={step.pendingTimers} />
          <section
            className={styles.loop}
            aria-labelledby={`${id}-loop`}
            data-phase={step.phase}
          >
            <h2 className={player.panelTitle} id={`${id}-loop`}>
              <RefreshCwIcon aria-hidden="true" />
              Event Loop
            </h2>
            <div className={styles.loopBody}>
              <div
                key={preset.id}
                className={styles.loopIndicator}
                data-loop-indicator
                data-playing={playing}
                aria-hidden="true"
              >
                <RefreshCwIcon />
              </div>
              <div
                className={styles.explanation}
                aria-live="polite"
                aria-atomic="true"
              >
                <p className={styles.phase}>
                  {stepCount} · {step.phase}
                </p>
                <p>{step.explanation}</p>
              </div>
            </div>
          </section>
          <RuntimeLane lane="microtasks" items={step.microtasks} />
          <RuntimeLane lane="tasks" items={step.timerTasks} />
        </section>
        <section className={styles.output} aria-label="Output and prediction">
          {predictionOrder && finalOutput && (
            <EventLoopOutputPrediction
              key={preset.id}
              id={predictionId}
              initialOrder={predictionOrder}
              output={finalOutput}
            />
          )}
          <RuntimeLane lane="console" items={step.output} />
        </section>
      </div>
    </section>
  );
}
