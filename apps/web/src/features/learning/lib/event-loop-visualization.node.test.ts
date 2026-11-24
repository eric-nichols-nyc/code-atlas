import { describe, expect, it } from "vitest";
import { complexEventLoopVisualization } from "../../../content/javascript/learn/event-loop/complex-visualization";
import { eventLoopVisualization } from "../../../content/javascript/learn/event-loop/visualization";
import { validateEventLoopVisualization } from "./event-loop-visualization";

const { source, steps } = eventLoopVisualization;

describe("authored event loop visualization", () => {
  it("keeps the second timer queued while the first timer's Promise reaction runs", () => {
    const { steps, source } = complexEventLoopVisualization;
    expect(
      validateEventLoopVisualization(complexEventLoopVisualization),
    ).toEqual([]);
    expect(steps[11]).toMatchObject({
      stack: ["First timer"],
      microtasks: ["Timer microtask"],
      timerTasks: ["Second timer"],
    });
    expect(steps[13]).toMatchObject({
      phase: "Microtask checkpoint",
      stack: ["Timer microtask"],
      timerTasks: ["Second timer"],
    });
    expect(steps[15]).toMatchObject({
      phase: "Timer task",
      stack: ["Second timer"],
      microtasks: [],
      timerTasks: [],
    });
    expect(steps.at(-1)?.output).toEqual([
      "Start batch",
      "End script",
      "First microtask",
      "First timer",
      "Timer microtask",
      "Second timer",
    ]);

    const lines = source.split("\n");
    for (const [index, step] of steps.entries()) {
      if (step.output.length > (steps[index - 1]?.output.length ?? 0)) {
        expect(step.lines.map((line) => lines[line - 1]).join("\n")).toContain(
          `console.log("${step.output.at(-1)}")`,
        );
      }
    }
  });

  it("requires a shuffled prediction containing each final log position once", () => {
    expect(
      validateEventLoopVisualization({
        ...eventLoopVisualization,
        predictionOrder: [4, 2, 0, 3, 3],
      }),
    ).toEqual([expect.stringContaining("include every final log once")]);
    expect(
      validateEventLoopVisualization({
        ...eventLoopVisualization,
        predictionOrder: [0, 1, 2, 3, 4],
      }),
    ).toEqual([expect.stringContaining("start in a different order")]);
  });

  it("maps the timer and microtasks to the queue transitions, source, and logs", () => {
    expect(validateEventLoopVisualization(eventLoopVisualization)).toEqual([]);
    const checkpoints = steps.map((step) => ({
      id: step.id,
      stack: step.stack,
      pending: step.pendingTimers,
      microtasks: step.microtasks,
      tasks: step.timerTasks,
    }));
    expect(checkpoints.slice(5, 12)).toEqual([
      {
        id: "timer-ready",
        stack: ["Top-level script"],
        pending: [],
        microtasks: ["Promise reaction"],
        tasks: ["Timer callback"],
      },
      {
        id: "begin-checkpoint",
        stack: [],
        pending: [],
        microtasks: ["Promise reaction"],
        tasks: ["Timer callback"],
      },
      {
        id: "run-reaction",
        stack: ["Promise reaction"],
        pending: [],
        microtasks: [],
        tasks: ["Timer callback"],
      },
      {
        id: "queue-follow-up",
        stack: ["Promise reaction"],
        pending: [],
        microtasks: ["Follow-up microtask"],
        tasks: ["Timer callback"],
      },
      {
        id: "run-follow-up",
        stack: ["Follow-up microtask"],
        pending: [],
        microtasks: [],
        tasks: ["Timer callback"],
      },
      {
        id: "end-checkpoint",
        stack: [],
        pending: [],
        microtasks: [],
        tasks: ["Timer callback"],
      },
      {
        id: "run-timer",
        stack: ["Timer callback"],
        pending: [],
        microtasks: [],
        tasks: [],
      },
    ]);
    expect(steps[2].pendingTimers).toEqual(["Timer callback"]);
    expect(steps[2].timerTasks).toEqual([]);
    const logs = [
      "Read request",
      "Script finished",
      "Promise reaction",
      "Follow-up microtask",
      "Timer callback",
    ];
    expect(steps.at(-1)?.output).toEqual(logs);

    const sourceLines = source.split("\n");
    for (const [index, step] of steps.entries()) {
      const previous = steps[index - 1]?.output ?? [];
      expect(step.output).toEqual(logs.slice(0, step.output.length));
      expect(step.output.length - previous.length).toBeGreaterThanOrEqual(0);
      expect(step.output.length - previous.length).toBeLessThanOrEqual(1);
      if (step.output.length > previous.length) {
        expect(
          step.lines.map((line) => sourceLines[line - 1]).join("\n"),
        ).toContain(`console.log("${step.output.at(-1)}")`);
      }
    }
  });

  it("reports invalid line references, duplicate steps, and malformed lane entries", () => {
    expect(
      validateEventLoopVisualization({
        ...eventLoopVisualization,
        steps: [steps[0], { ...steps[0], lines: [15] }],
      }),
    ).toEqual([
      expect.stringContaining("duplicate step id"),
      expect.stringContaining("lines must be distinct integers from 1 to 14"),
    ]);
    expect(
      validateEventLoopVisualization({
        ...eventLoopVisualization,
        steps: [{ ...steps[0], microtasks: [" "] }],
      }),
    ).toEqual([expect.stringContaining("invalid microtasks entries")]);
  });
});
