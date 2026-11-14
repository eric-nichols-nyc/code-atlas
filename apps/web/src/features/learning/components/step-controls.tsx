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
}: {
  index: number;
  total: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className={styles.controls}>
      <Button
        variant="outline"
        size="sm"
        disabled={index === 0}
        onClick={() => onChange(Math.max(0, index - 1))}
      >
        <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
        Previous
      </Button>
      <Button
        size="sm"
        disabled={index === total - 1}
        onClick={() => onChange(Math.min(total - 1, index + 1))}
      >
        Next
        <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
      </Button>
      <Button
        className={styles.restart}
        variant="ghost"
        size="sm"
        disabled={index === 0}
        onClick={() => onChange(0)}
      >
        <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
        Restart
      </Button>
    </div>
  );
}
