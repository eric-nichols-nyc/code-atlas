"use client";

import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  RotateCcwIcon,
} from "@workspace/ui/components/icons";
import styles from "./code-walkthrough.module.css";

export function StepControls({
  index,
  total,
  onChange,
  compact = false,
}: {
  index: number;
  total: number;
  onChange: (index: number) => void;
  compact?: boolean;
}) {
  const size = compact ? "icon-sm" : "sm";
  return (
    <div className={styles.controls}>
      <Button
        variant={compact ? "ghost" : "outline"}
        size={size}
        aria-label="Previous"
        title={compact ? "Previous" : undefined}
        disabled={index === 0}
        onClick={() => onChange(Math.max(0, index - 1))}
      >
        <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
        {!compact && "Previous"}
      </Button>
      <Button
        variant={compact ? "ghost" : "default"}
        size={size}
        aria-label="Next"
        title={compact ? "Next" : undefined}
        disabled={index === total - 1}
        onClick={() => onChange(Math.min(total - 1, index + 1))}
      >
        {!compact && "Next"}
        <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
      </Button>
      <Button
        className={styles.restart}
        variant="ghost"
        size={size}
        aria-label="Restart"
        title={compact ? "Restart" : undefined}
        disabled={index === 0}
        onClick={() => onChange(0)}
      >
        <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
        {!compact && "Restart"}
      </Button>
    </div>
  );
}
