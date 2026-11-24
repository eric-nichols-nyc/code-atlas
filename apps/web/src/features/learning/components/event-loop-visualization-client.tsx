"use client";

import { Button } from "@workspace/ui/components/button";
import {
  BoxIcon,
  CodeXmlIcon,
  LayersIcon,
  PauseIcon,
  PlayIcon,
  RefreshCwIcon,
  TerminalIcon,
  ZapIcon,
} from "@workspace/ui/components/icons";
import { Slider } from "@workspace/ui/components/slider";
import { useEffect, useId, useState } from "react";
import type { PreparedEventLoopPreset } from "../lib/event-loop-visualization";
import { EventLoopOutputPrediction } from "./event-loop-output-prediction";
import styles from "./event-loop-visualization.module.css";
import { StepControls } from "./step-controls";
import { WalkthroughSource } from "./walkthrough-source";

const playbackDelay = 1600;

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
      <h2 className={styles.panelTitle}>
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
  const [{ presetIndex, index, playing }, setPlayback] = useState({
    presetIndex: 0,
    index: 0,
    playing: false,
  });
  const preset = presets[presetIndex] ?? presets[0];
  const { steps, codeLines, predictionOrder } = preset;
  const predictionId = `${presets[0].id}-prediction`;
  const finalOutput = steps.at(-1)?.output;
  const lastIndex = steps.length - 1;
  const step = steps[index] ?? steps[0];
  const stepCount = `Step ${index + 1} of ${steps.length}`;
  const PlaybackIcon = playing ? PauseIcon : PlayIcon;

  useEffect(() => {
    if (!playing) return;
    const timeout = window.setTimeout(() => {
      setPlayback((current) => {
        if (
          !current.playing ||
          current.presetIndex !== presetIndex ||
          current.index !== index
        )
          return current;
        const next = current.index + 1;
        return { ...current, index: next, playing: next < lastIndex };
      });
    }, playbackDelay);
    return () => window.clearTimeout(timeout);
  }, [index, lastIndex, playing, presetIndex]);

  function seek(index: number) {
    setPlayback((current) => ({ ...current, index, playing: false }));
  }

  return (
    <section className={styles.visualizer} aria-labelledby={`${id}-title`}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <RefreshCwIcon aria-hidden="true" />
          </span>
          <h1 id={`${id}-title`}>{title}</h1>
        </div>
        <div className={styles.toolbar}>
          <a className={styles.headerLink} href="#event-loop-theory">
            Theory
          </a>
          {predictionOrder && (
            <a className={styles.headerLink} href={`#${predictionId}`}>
              Predict the output
            </a>
          )}
          <div className={styles.scrubber}>
            <span id={`${id}-step-label`}>Example step</span>
            <Slider
              aria-labelledby={`${id}-step-label`}
              aria-valuetext={stepCount}
              min={1}
              max={steps.length}
              value={[index + 1]}
              onValueChange={([value]) => seek((value ?? 1) - 1)}
            />
          </div>
          <div className={styles.buttons}>
            <StepControls
              index={index}
              total={steps.length}
              onChange={seek}
              compact
            />
            <Button
              className={styles.play}
              size="sm"
              aria-disabled={index === lastIndex}
              onClick={() =>
                setPlayback((current) =>
                  current.index === lastIndex
                    ? current
                    : { ...current, playing: !current.playing },
                )
              }
            >
              <PlaybackIcon aria-hidden="true" data-icon="inline-start" />
              {playing ? "Pause" : "Play"}
            </Button>
          </div>
        </div>
      </header>
      <div className={styles.board}>
        <div className={styles.source}>
          <div className={`${styles.panelTitle} ${styles.sourceHeader}`}>
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
                  variant={presetIndex === optionIndex ? "secondary" : "ghost"}
                  aria-pressed={presetIndex === optionIndex}
                  onClick={() =>
                    setPlayback((current) =>
                      current.presetIndex === optionIndex
                        ? current
                        : {
                            presetIndex: optionIndex,
                            index: 0,
                            playing: false,
                          },
                    )
                  }
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
            <h2 className={styles.panelTitle} id={`${id}-loop`}>
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
