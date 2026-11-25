import type { TimingVisualizationDefinition } from "../../../../features/learning/lib/timing-visualization";

const wait = 300;
const inputs = [
  { time: 0, value: "c" },
  { time: 100, value: "ca" },
  { time: 220, value: "cat" },
  { time: 480, value: "cats" },
] as const;
const [first, second, third, last] = inputs;
const schedule = inputs
  .map(
    ({ time, value }) =>
      `setTimeout(() => handle(${JSON.stringify(value)}), ${time});`,
  )
  .join("\n");

function debounceInput(index: 0 | 1 | 2 | 3, explanation: string) {
  const { time, value } = inputs[index];
  return {
    id: `input-${time}`,
    lines: [4, 5, index + 13],
    time,
    deadline: time + wait,
    pending: value,
    events: [{ kind: "input", detail: value }] as const,
    explanation,
  };
}

export const timingExamples: readonly [
  TimingVisualizationDefinition,
  TimingVisualizationDefinition,
] = [
  {
    id: "trailing-debounce",
    title: "Debounce & Throttle",
    label: "Debounce",
    source: `function debounce(handler, wait) {
  let pending;
  return (value) => {
    clearTimeout(pending);
    pending = setTimeout(() => {
      pending = undefined;
      handler(value);
    }, wait);
  };
}

const handle = debounce((value) => console.log(value), ${wait});
${schedule}`,
    steps: [
      {
        id: "setup",
        time: 0,
        lines: [12],
        explanation:
          "The debounce wrapper starts with no pending timer. Each input must be followed by 300 ms of quiet.",
      },
      debounceInput(0, 'The "c" input starts a timer due at 300 ms.'),
      debounceInput(
        1,
        'The "ca" input cancels the old timer. The new callback keeps "ca" and is due at 400 ms.',
      ),
      debounceInput(
        2,
        'The "cat" input arrives before the deadline and moves it to 520 ms.',
      ),
      debounceInput(
        3,
        'The "cats" input arrives at 480 ms and moves the deadline to 780 ms.',
      ),
      {
        id: "fire",
        time: last.time + wait,
        lines: [6, 7, 12],
        events: [{ kind: "callback", detail: last.value }],
        explanation:
          'After 300 ms of quiet, the callback logs "cats" and clears the pending timer.',
      },
    ],
  },
  {
    id: "leading-throttle",
    title: "Debounce & Throttle",
    label: "Throttle",
    source: `function throttle(handler, wait) {
  let blocked = false;
  return (value) => {
    if (blocked) return;
    blocked = true;
    setTimeout(() => { blocked = false; }, wait);
    handler(value);
  };
}

const handle = throttle((value) => console.log(value), ${wait});
${schedule}`,
    steps: [
      {
        id: "setup",
        time: 0,
        lines: [11],
        explanation:
          "The leading-only throttle starts open. A call that runs blocks the wrapper for 300 ms.",
      },
      {
        id: "accept-first",
        time: first.time,
        deadline: first.time + wait,
        lines: [5, 6, 7, 12],
        events: [
          { kind: "input", detail: first.value },
          { kind: "callback", detail: first.value },
        ],
        explanation:
          'The first input runs immediately and logs "c". The throttle blocks new calls until 300 ms.',
      },
      {
        id: "skip-second",
        time: second.time,
        deadline: first.time + wait,
        lines: [4, 13],
        events: [{ kind: "skipped", detail: second.value }],
        explanation:
          'The "ca" input is skipped because the window is still active. The deadline stays at 300 ms.',
      },
      {
        id: "skip-third",
        time: third.time,
        deadline: first.time + wait,
        lines: [4, 14],
        events: [{ kind: "skipped", detail: third.value }],
        explanation:
          'The "cat" input is also skipped. This leading-only version does not queue a trailing call.',
      },
      {
        id: "reopen",
        time: first.time + wait,
        lines: [6],
        events: [{ kind: "window", detail: "Open for the next input" }],
        explanation:
          "The timer opens the throttle again. Neither skipped input runs.",
      },
      {
        id: "accept-last",
        time: last.time,
        deadline: last.time + wait,
        lines: [5, 6, 7, 15],
        events: [
          { kind: "input", detail: last.value },
          { kind: "callback", detail: last.value },
        ],
        explanation:
          'The "cats" input arrives after the window opens, so it runs immediately at 480 ms.',
      },
      {
        id: "finish",
        time: last.time + wait,
        lines: [6],
        events: [{ kind: "window", detail: "Open for the next input" }],
        explanation:
          "The last window ends. The only handler calls were at 0 ms and 480 ms.",
      },
    ],
  },
];
