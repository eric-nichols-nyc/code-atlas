"use client";

import { CodeXmlIcon, TerminalIcon } from "@workspace/ui/components/icons";
import { cn } from "@workspace/ui/lib/utils";
import { type ComponentProps, type ReactNode, useId } from "react";
import type { PreparedWalkthrough } from "../lib/code-walkthrough";
import styles from "./walkthrough-player.module.css";
import { WalkthroughPlayerHeader } from "./walkthrough-player-header";
import { WalkthroughSource } from "./walkthrough-source";

type PlayerHeaderProps = ComponentProps<typeof WalkthroughPlayerHeader>;

export function WalkthroughWorkbench({
  title,
  icon,
  playback,
  theoryId,
  codeLines,
  activeLines,
  explanation,
  sourceLabel,
  boardClassName,
  children,
}: Pick<PlayerHeaderProps, "title" | "icon" | "playback"> & {
  theoryId: string;
  codeLines: PreparedWalkthrough["codeLines"];
  activeLines: readonly number[];
  explanation: string;
  sourceLabel: string;
  boardClassName?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section className={styles.visualizer} aria-labelledby={titleId}>
      <WalkthroughPlayerHeader
        title={title}
        titleId={titleId}
        icon={icon}
        playback={playback}
      >
        <a className={styles.headerLink} href={`#${theoryId}`}>
          Theory
        </a>
      </WalkthroughPlayerHeader>
      <div className={styles.explanation} aria-live="polite" aria-atomic="true">
        <span>
          Step {playback.index + 1} of {playback.total}
        </span>
        <p>{explanation}</p>
      </div>
      <div className={cn(styles.board, boardClassName)}>
        <div className={styles.source}>
          <h2 className={styles.panelTitle}>
            <CodeXmlIcon aria-hidden="true" />
            Input Script
          </h2>
          <WalkthroughSource
            codeLines={codeLines}
            activeLines={activeLines}
            label={sourceLabel}
          />
        </div>
        {children}
      </div>
    </section>
  );
}

export function WalkthroughPanel({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon: PlayerHeaderProps["icon"];
  className?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section className={className} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.panelTitle}>
        <Icon aria-hidden="true" />
        {title}
      </h2>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

export function WalkthroughConsole({
  logs,
  className,
}: {
  logs: readonly string[];
  className?: string;
}) {
  return (
    <WalkthroughPanel
      title="Console Output"
      icon={TerminalIcon}
      className={className}
    >
      {logs.length ? (
        // biome-ignore lint/a11y/noRedundantRoles: Restore list semantics in Safari when markers are hidden.
        <ol role="list" className={styles.consoleLogs}>
          {logs.map((log, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Logs can repeat and have no local state.
            <li key={index}>{log}</li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>No output yet</p>
      )}
    </WalkthroughPanel>
  );
}
