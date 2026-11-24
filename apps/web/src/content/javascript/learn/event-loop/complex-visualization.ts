import type { EventLoopVisualizationDefinition } from "@/features/learning/lib/event-loop-visualization";

const start = "Start batch";
const end = "End script";
const firstMicrotask = "First microtask";
const firstTimer = "First timer";
const timerMicrotask = "Timer microtask";
const secondTimer = "Second timer";
const messages = [
  start,
  end,
  firstMicrotask,
  firstTimer,
  timerMicrotask,
  secondTimer,
];

const source = `console.log("${start}");

setTimeout(() => {
  console.log("${firstTimer}");
  Promise.resolve().then(() => {
    console.log("${timerMicrotask}");
  });
}, 0);

Promise.resolve().then(() => {
  console.log("${firstMicrotask}");
  setTimeout(() => {
    console.log("${secondTimer}");
  }, 0);
});

console.log("${end}");`;

const empty = { stack: [], pendingTimers: [], microtasks: [], timerTasks: [] };
const script = { ...empty, stack: ["Top-level script"] };
const firstReady = { ...empty, timerTasks: [firstTimer] };
const secondReady = { ...empty, timerTasks: [secondTimer] };
const duringFirstTimer = {
  ...empty,
  stack: [firstTimer],
  pendingTimers: [secondTimer],
};

export const complexEventLoopVisualization = {
  id: "nested-timers-and-microtasks",
  title: "Nested timers and microtasks",
  source,
  predictionOrder: [3, 0, 5, 2, 1, 4],
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
      id: "log-start",
      phase: "Script task",
      lines: [1],
      explanation: "The first message is logged synchronously.",
      output: messages.slice(0, 1),
    },
    {
      ...script,
      id: "register-first-timer",
      phase: "Script task",
      lines: [3],
      explanation:
        "The outer setTimeout registers the first timer. Its callback is still pending.",
      pendingTimers: [firstTimer],
      output: messages.slice(0, 1),
    },
    {
      ...script,
      id: "queue-first-microtask",
      phase: "Script task",
      lines: [10],
      explanation:
        "The fulfilled Promise queues its .then reaction as a microtask.",
      pendingTimers: [firstTimer],
      microtasks: [firstMicrotask],
      output: messages.slice(0, 1),
    },
    {
      ...script,
      id: "log-end",
      phase: "Script task",
      lines: [17],
      explanation: "The script logs its final synchronous message.",
      pendingTimers: [firstTimer],
      microtasks: [firstMicrotask],
      output: messages.slice(0, 2),
    },
    {
      ...script,
      id: "first-timer-ready",
      phase: "Script task",
      lines: [3],
      explanation:
        "In this walkthrough, the first timer becomes ready just before the script returns.",
      microtasks: [firstMicrotask],
      timerTasks: [firstTimer],
      output: messages.slice(0, 2),
    },
    {
      ...firstReady,
      id: "run-first-microtask",
      phase: "Microtask checkpoint",
      lines: [11],
      explanation:
        "The script returns. The first Promise reaction runs and logs while the ready timer waits.",
      stack: [firstMicrotask],
      output: messages.slice(0, 3),
    },
    {
      ...firstReady,
      id: "register-second-timer",
      phase: "Microtask checkpoint",
      lines: [12],
      explanation:
        "The Promise reaction calls setTimeout, registering a second timer.",
      stack: [firstMicrotask],
      pendingTimers: [secondTimer],
      output: messages.slice(0, 3),
    },
    {
      ...firstReady,
      id: "end-first-checkpoint",
      phase: "Microtask checkpoint",
      lines: [15],
      explanation:
        "The reaction returns and the microtask queue is empty. The first timer task can now run.",
      pendingTimers: [secondTimer],
      output: messages.slice(0, 3),
    },
    {
      ...duringFirstTimer,
      id: "run-first-timer",
      phase: "Timer task",
      lines: [4],
      explanation:
        "The browser takes the first timer task. Its callback logs a message.",
      output: messages.slice(0, 4),
    },
    {
      ...duringFirstTimer,
      id: "queue-timer-microtask",
      phase: "Timer task",
      lines: [5],
      explanation:
        "The first timer callback attaches a reaction to a fulfilled Promise, queuing another microtask.",
      microtasks: [timerMicrotask],
      output: messages.slice(0, 4),
    },
    {
      ...secondReady,
      id: "second-timer-ready",
      phase: "Timer task",
      lines: [12],
      explanation:
        "Here the second timer becomes ready while the first callback is still on the stack.",
      stack: [firstTimer],
      microtasks: [timerMicrotask],
      output: messages.slice(0, 4),
    },
    {
      ...secondReady,
      id: "begin-timer-checkpoint",
      phase: "Microtask checkpoint",
      lines: [5],
      explanation:
        "The first timer callback returns. The browser checks the microtask queue again before taking another timer task.",
      microtasks: [timerMicrotask],
      output: messages.slice(0, 4),
    },
    {
      ...secondReady,
      id: "run-timer-microtask",
      phase: "Microtask checkpoint",
      lines: [6],
      explanation:
        "The timer's Promise reaction logs its message while the second timer waits in the task queue.",
      stack: [timerMicrotask],
      output: messages.slice(0, 5),
    },
    {
      ...secondReady,
      id: "end-timer-checkpoint",
      phase: "Microtask checkpoint",
      lines: [7],
      explanation:
        "The Promise reaction returns, leaving the microtask queue empty.",
      output: messages.slice(0, 5),
    },
    {
      ...empty,
      id: "run-second-timer",
      phase: "Timer task",
      lines: [13],
      explanation: "The second timer callback runs and logs the last message.",
      stack: [secondTimer],
      output: messages,
    },
    {
      ...empty,
      id: "finish",
      phase: "Idle",
      lines: [14],
      explanation:
        "The second timer returns. The stack and queues are empty, and the console shows the full order.",
      output: messages,
    },
  ],
} as const satisfies EventLoopVisualizationDefinition;
