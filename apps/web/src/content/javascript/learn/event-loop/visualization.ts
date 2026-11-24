import type { EventLoopVisualizationDefinition } from "@/features/learning/lib/event-loop-visualization";

const readRequest = "Read request";
const scriptFinished = "Script finished";
const reaction = "Promise reaction";
const followUp = "Follow-up microtask";
const timer = "Timer callback";
const messages = [readRequest, scriptFinished, reaction, followUp, timer];
const source = `console.log("${readRequest}");

setTimeout(() => {
  console.log("${timer}");
}, 0);

Promise.resolve().then(() => {
  console.log("${reaction}");
  queueMicrotask(() => {
    console.log("${followUp}");
  });
});

console.log("${scriptFinished}");`;

const empty = { stack: [], pendingTimers: [], microtasks: [], timerTasks: [] };
const script = { ...empty, stack: ["Top-level script"] };
const ready = { ...empty, timerTasks: [timer] };

export const eventLoopVisualization = {
  id: "browser-timer-and-microtasks",
  title: "Event Loop Visualizer",
  source,
  predictionOrder: [4, 2, 0, 3, 1],
  steps: [
    {
      ...script,
      id: "start-script",
      phase: "Script task",
      lines: [1],
      explanation: "The browser begins evaluating the top-level script.",
      output: [],
    },
    {
      ...script,
      id: "first-log",
      phase: "Script task",
      lines: [1],
      explanation: "The first console.log runs synchronously.",
      output: messages.slice(0, 1),
    },
    {
      ...script,
      id: "register-timer",
      phase: "Script task",
      lines: [3],
      explanation:
        "setTimeout registers a timer in the browser. The script continues while the timer is pending.",
      pendingTimers: [timer],
      output: messages.slice(0, 1),
    },
    {
      ...script,
      id: "queue-reaction",
      phase: "Script task",
      lines: [7],
      explanation:
        "The Promise is already fulfilled, so .then queues its reaction as a microtask. The script is still running.",
      pendingTimers: [timer],
      microtasks: [reaction],
      output: messages.slice(0, 1),
    },
    {
      ...script,
      id: "last-script-log",
      phase: "Script task",
      lines: [14],
      explanation: "The script logs its final message before yielding control.",
      pendingTimers: [timer],
      microtasks: [reaction],
      output: messages.slice(0, 2),
    },
    {
      ...script,
      id: "timer-ready",
      phase: "Script task",
      lines: [3],
      explanation:
        "In this example the timer becomes ready just before the script returns. The browser queues its callback as a timer task.",
      microtasks: [reaction],
      timerTasks: [timer],
      output: messages.slice(0, 2),
    },
    {
      ...ready,
      id: "begin-checkpoint",
      phase: "Microtask checkpoint",
      lines: [7],
      explanation:
        "The script returns and the call stack empties. The browser drains queued microtasks before taking the next timer task.",
      microtasks: [reaction],
      output: messages.slice(0, 2),
    },
    {
      ...ready,
      id: "run-reaction",
      phase: "Microtask checkpoint",
      lines: [8],
      explanation:
        "The Promise reaction leaves the microtask queue, runs on the stack, and logs its message. The timer task is still ready.",
      stack: [reaction],
      output: messages.slice(0, 3),
    },
    {
      ...ready,
      id: "queue-follow-up",
      phase: "Microtask checkpoint",
      lines: [9],
      explanation:
        "The reaction calls queueMicrotask. The new callback joins the queue during the same checkpoint.",
      stack: [reaction],
      microtasks: [followUp],
      output: messages.slice(0, 3),
    },
    {
      ...ready,
      id: "run-follow-up",
      phase: "Microtask checkpoint",
      lines: [10],
      explanation:
        "After the reaction returns, the follow-up microtask runs and logs its message. The timer task keeps waiting.",
      stack: [followUp],
      output: messages.slice(0, 4),
    },
    {
      ...ready,
      id: "end-checkpoint",
      phase: "Microtask checkpoint",
      lines: [10],
      explanation:
        "The follow-up returns. With the microtask queue empty, the checkpoint can end.",
      output: messages.slice(0, 4),
    },
    {
      ...empty,
      id: "run-timer",
      phase: "Timer task",
      lines: [4],
      explanation:
        "The browser takes the ready timer task. Its callback runs on the stack and logs the final message.",
      stack: [timer],
      output: messages,
    },
    {
      ...empty,
      id: "finish",
      phase: "Idle",
      lines: [4],
      explanation:
        "The timer callback returns. The stack and queues are empty, and the console shows the full order.",
      output: messages,
    },
  ],
} as const satisfies EventLoopVisualizationDefinition;
