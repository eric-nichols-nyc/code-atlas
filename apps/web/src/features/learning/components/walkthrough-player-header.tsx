"use client";

import { Button } from "@workspace/ui/components/button";
import { PauseIcon, PlayIcon } from "@workspace/ui/components/icons";
import { Slider } from "@workspace/ui/components/slider";
import { type ReactNode, useId } from "react";
import { StepControls } from "./step-controls";
import type { useWalkthroughPlayback } from "./use-walkthrough-playback";
import styles from "./walkthrough-player.module.css";

export function WalkthroughPlayerHeader({
  title,
  titleId,
  icon: Icon,
  playback: { index, playing, total, seek, toggle },
  children,
}: {
  title: string;
  titleId: string;
  icon: typeof PlayIcon;
  playback: Pick<
    ReturnType<typeof useWalkthroughPlayback>,
    "index" | "playing" | "total" | "seek" | "toggle"
  >;
  children?: ReactNode;
}) {
  const stepLabelId = useId();
  const PlaybackIcon = playing ? PauseIcon : PlayIcon;

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>
          <Icon aria-hidden="true" />
        </span>
        <h1 id={titleId}>{title}</h1>
      </div>
      <div className={styles.toolbar}>
        {children}
        <div className={styles.scrubber}>
          <span id={stepLabelId}>Example step</span>
          <Slider
            aria-labelledby={stepLabelId}
            aria-valuetext={`Step ${index + 1} of ${total}`}
            min={1}
            max={total}
            value={[index + 1]}
            onValueChange={([value]) => seek((value ?? 1) - 1)}
          />
        </div>
        <div className={styles.buttons}>
          <StepControls index={index} total={total} onChange={seek} compact />
          <Button
            className={styles.play}
            size="sm"
            aria-disabled={index === total - 1}
            onClick={toggle}
          >
            <PlaybackIcon aria-hidden="true" data-icon="inline-start" />
            {playing ? "Pause" : "Play"}
          </Button>
        </div>
      </div>
    </header>
  );
}
