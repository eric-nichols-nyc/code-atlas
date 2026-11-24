"use client";

import { Button } from "@workspace/ui/components/button";
import {
  CircleHelpIcon,
  GripVerticalIcon,
} from "@workspace/ui/components/icons";
import { type DragEvent, useLayoutEffect, useRef, useState } from "react";
import styles from "./event-loop-output-prediction.module.css";
import player from "./walkthrough-player.module.css";

type DropTarget = { log: number; edge: "before" | "after" };

function getDropEdge(event: DragEvent<HTMLButtonElement>) {
  const { top, height } = event.currentTarget.getBoundingClientRect();
  return event.clientY < top + height / 2 ? "before" : "after";
}

export function EventLoopOutputPrediction({
  id,
  initialOrder,
  output,
}: {
  id: string;
  initialOrder: readonly number[];
  output: readonly string[];
}) {
  const [order, setOrder] = useState(initialOrder);
  const [showComparison, setShowComparison] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [pickedUp, setPickedUp] = useState<{
    log: number;
    order: readonly number[];
  }>();
  const [draggedLog, setDraggedLog] = useState<number>();
  const [dropTarget, setDropTarget] = useState<DropTarget>();
  const dragSource = useRef<HTMLButtonElement | null>(null);
  const focusAfterMove = useRef<HTMLButtonElement>(null);
  const comparisonId = `${id}-comparison`;
  const matches = order.filter(
    (log, position) => output[log] === output[position],
  ).length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Restore focus after React commits the reordered rows.
  useLayoutEffect(() => {
    focusAfterMove.current?.focus();
    focusAfterMove.current = null;
  }, [order]);

  function move(log: number, target: number, button: HTMLButtonElement | null) {
    const position = order.indexOf(log);
    if (
      position === target ||
      position < 0 ||
      target < 0 ||
      target >= order.length
    )
      return;

    const nextOrder = [...order];
    nextOrder.splice(position, 1);
    nextOrder.splice(target, 0, log);
    focusAfterMove.current = button;
    setOrder(nextOrder);
    setAnnouncement(
      `${output[log]} moved to position ${target + 1} of ${order.length}.`,
    );
  }

  function endDrag() {
    setDraggedLog(undefined);
    setDropTarget(undefined);
    dragSource.current = null;
  }

  return (
    <section
      id={id}
      tabIndex={-1}
      className={styles.exercise}
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`} className={player.panelTitle}>
        <CircleHelpIcon aria-hidden="true" />
        Output Prediction
      </h2>
      <div className={styles.body}>
        <p id={`${id}-help`} className={styles.help}>
          Drag logs into order. Use Space to pick up or drop, ↑ or ↓ to move,
          and Esc to cancel.
        </p>
        <div className={styles.orders}>
          <div>
            <ol
              className={styles.list}
              aria-label="Your prediction"
              aria-describedby={`${id}-help`}
              // biome-ignore lint/a11y/noRedundantRoles: Safari can omit list semantics when CSS hides the markers.
              role="list"
            >
              {order.map((log, position) => (
                <li
                  key={log}
                  className={styles.draggableItem}
                  data-dragging={draggedLog === log}
                  data-drop-edge={
                    dropTarget?.log === log ? dropTarget.edge : undefined
                  }
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className={`${styles.row} ${styles.dragHandle} motion-reduce:transition-none`}
                    aria-label={`Reorder ${output[log]}`}
                    aria-pressed={pickedUp?.log === log}
                    aria-keyshortcuts="Enter Space ArrowUp ArrowDown Escape"
                    draggable
                    onClick={() => {
                      const isPickedUp = pickedUp?.log === log;
                      setPickedUp(isPickedUp ? undefined : { log, order });
                      setAnnouncement(
                        `${output[log]} ${isPickedUp ? "dropped at" : "picked up at"} position ${position + 1} of ${order.length}.`,
                      );
                    }}
                    onBlur={(event) => {
                      if (
                        pickedUp?.log === log &&
                        focusAfterMove.current !== event.currentTarget
                      )
                        setPickedUp(undefined);
                    }}
                    onKeyDown={(event) => {
                      if (pickedUp?.log !== log) return;
                      switch (event.key) {
                        case "ArrowUp":
                        case "ArrowDown":
                          event.preventDefault();
                          move(
                            log,
                            position + (event.key === "ArrowUp" ? -1 : 1),
                            event.currentTarget,
                          );
                          break;
                        case "Escape":
                          event.preventDefault();
                          if (order !== pickedUp.order) {
                            focusAfterMove.current = event.currentTarget;
                            setOrder(pickedUp.order);
                          }
                          setPickedUp(undefined);
                          setAnnouncement(
                            `${output[log]} returned to its starting position.`,
                          );
                          break;
                      }
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData(
                        "application/x-code-atlas-prediction",
                        String(log),
                      );
                      dragSource.current = event.currentTarget;
                      setPickedUp(undefined);
                      setDraggedLog(log);
                    }}
                    onDragOver={(event) => {
                      if (draggedLog === undefined || draggedLog === log)
                        return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      const edge = getDropEdge(event);
                      setDropTarget((current) =>
                        current?.log === log && current.edge === edge
                          ? current
                          : { log, edge },
                      );
                    }}
                    onDragLeave={(event) => {
                      if (
                        event.relatedTarget instanceof Node &&
                        event.currentTarget.contains(event.relatedTarget)
                      )
                        return;
                      setDropTarget((current) =>
                        current?.log === log ? undefined : current,
                      );
                    }}
                    onDrop={(event) => {
                      if (draggedLog === undefined || draggedLog === log)
                        return;
                      event.preventDefault();
                      const before =
                        position + Number(getDropEdge(event) === "after");
                      const target =
                        before - Number(order.indexOf(draggedLog) < before);
                      move(draggedLog, target, dragSource.current);
                      endDrag();
                    }}
                    onDragEnd={endDrag}
                  >
                    <GripVerticalIcon aria-hidden="true" />
                    <span>{output[log]}</span>
                  </Button>
                </li>
              ))}
            </ol>
            <div className={styles.actions}>
              <Button
                type="button"
                size="sm"
                aria-expanded={showComparison}
                aria-controls={comparisonId}
                onClick={() => {
                  setAnnouncement("");
                  setShowComparison(!showComparison);
                }}
              >
                {showComparison ? "Hide comparison" : "Check prediction"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setOrder(initialOrder);
                  setPickedUp(undefined);
                  setShowComparison(false);
                  setAnnouncement("Prediction order reset.");
                }}
              >
                Reset order
              </Button>
            </div>
            <p
              role="status"
              className={showComparison ? styles.feedback : "sr-only"}
            >
              {showComparison &&
                (matches === output.length
                  ? `All ${output.length} logs are in the correct order.`
                  : `${matches} of ${output.length} positions match.`)}
              <span className="sr-only">
                {announcement && ` ${announcement}`}
              </span>
            </p>
          </div>
          <div id={comparisonId} hidden={!showComparison}>
            <h3 id={`${id}-output`} className={styles.orderTitle}>
              Walkthrough output
            </h3>
            <ol
              className={styles.list}
              aria-labelledby={`${id}-output`}
              // biome-ignore lint/a11y/noRedundantRoles: Safari can omit list semantics when CSS hides the markers.
              role="list"
            >
              {showComparison &&
                output.map((log, position) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Final log positions are fixed and log messages can repeat.
                  <li key={position}>
                    <div className={styles.row}>{log}</div>
                  </li>
                ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
