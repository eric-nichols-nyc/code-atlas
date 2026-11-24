# Event loop visualizer

## Decision and outcome

Use a feature brief for the first slice. Publish one **Event Loop** module under
**JavaScript Learn → Async** at `/javascript/learn/event-loop`. The learner can
follow a browser script and explain why a ready timer waits for both the Promise
reaction and the microtask that reaction queues. The existing Learn route,
auth, content validation, and UI primitives cover the integration.

## Reference findings

- The site pairs editable, line-numbered JavaScript with a call stack, pending
  Web APIs, two queues, and console output. Easy and Complex generate examples
  from the selected feature checkboxes. The prediction panel shuffles recognized
  logs for drag reordering and grades exact order when playback ends. Controls
  offer reset, forward step, timed run/pause, and replay. The default example
  produced `Start → End → Promise → Timeout` in Chromium. [Reference visualizer](https://event-loop-visualizer-ruby.vercel.app/)
- The deployed bundle recognizes a small set of line patterns with regular
  expressions, then advances its own stack and queues. It treats
  `process.nextTick` as a regular microtask and `setImmediate` as a zero-delay
  timer. In a Chromium probe, edits took effect only after reset or replay. The
  reset trace printed a literal log inside `if (false)` and skipped a computed
  log. A separate timer tick also moved a callback into the task queue during
  manual playback without a step. [Deployed bundle](https://event-loop-visualizer-ruby.vercel.app/assets/index-Djw-9Gy2.js)

## First working slice

Use one original, read-only example. Show highlighted source beside the call
stack, pending timers, microtask queue, and timer task queue, with a short
explanation and cumulative console output below. Stack and queue lists identify
which item is next. Stack the panels on narrow screens and keep code scrolling
inside its panel. Use the shared Learn card and theme tokens.

```javascript
console.log("Read request");

setTimeout(() => {
  console.log("Timer callback");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise reaction");
  queueMicrotask(() => {
    console.log("Follow-up microtask");
  });
});

console.log("Script finished");
```

Show the timer moving from pending to ready, then the microtask checkpoint
draining the Promise reaction and the follow-up microtask before the timer
callback runs. The example uses one timer task source and chooses a point where
the timer is already ready when the script returns. The trace labels this as
illustrative timing. `0` does not guarantee an immediate callback, and playback
speed has no bearing on browser timing. [HTML event loop processing model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model), [HTML timer rules](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)

Start paused. Previous, Next, Restart, a labeled step slider, and Play/Pause all
control one frame index. Every panel, source highlight, explanation, and output
list comes from that frame. Manual navigation pauses playback. Playback stops
at the last frame and on unmount. Theme and layout changes preserve the frame.
A reload starts at the beginning. Use a single playback cadence and immediate
state updates, with no motion required to understand a transition.

## Implementation and acceptance

- Register the module and its trusted overview in `content/javascript/learn/`.
  Keep the canonical JavaScript and typed frames with the overview. Each frame
  carries a stable ID, source references, explanation, phase, ordered stack and
  queues, pending timers, and accumulated logs. Register a focused validator in
  the existing learning content check for required fields, frame IDs, and line
  bounds. Verify the semantic transitions in a fixture test.
- Keep rendering and playback in `features/learning`. Reuse `StepControls`,
  the shared `Slider`, and existing server-side source highlighting where it
  fits. Use React state for the frame and play state. The playback clock changes
  only the frame index. The authorized Learn page serves authored content and
  requires no new dependencies, API, database access, or execution service.
- Verify the final output is `Read request → Script finished → Promise reaction →`
  `Follow-up microtask → Timer callback`. Check that the ready timer remains
  queued through both microtasks and that source, lane contents, and logs match
  each checkpoint. Stepping back or scrubbing restores the exact earlier state.
- Verify keyboard controls and the slider, one polite step announcement, visible
  focus, labels that work without color, and no page overflow at 320px. Review the
  signed-in module in desktop and narrow layouts and shared themes. Check access,
  playback boundaries, pause, restart, and reload. Run content validation and
  relevant root checks before marking the slice complete.

## Output prediction

The walkthrough pairs with an exercise above its live output. Start with a
shuffled list of the five logs from the final frame. Drag a log row and drop it
before or after another row. Show the insertion point while dragging. With a
row focused, use Space to pick it up or drop it, the arrow keys to move it, and
Escape to restore its previous position. Keep focus on the moved log and
announce its new position.

Check the prediction to reveal the walkthrough's final output and a count of
matching positions. Keep the comparison visible as learners revise the order,
with an option to hide it or reset the exercise. Prediction state lasts for the
visit and remains independent of playback, restart, and scrubbing. Verify both
an incorrect and a correct order, identical output to the walkthrough, and
focus and announcements. Verify pointer drops before and after a row, the
insertion line, and cancellation.

## Example presets

Show Easy and Complex in the Input Script header. Easy opens by default and
uses the original timer example. Complex follows nested Promise reactions and
timers to show a second microtask checkpoint between timer callbacks. Each
preset supplies its own source, frames, and shuffled prediction. Selecting a
different preset pauses playback and resets the step, console, and prediction
together. Selecting the active preset leaves the current attempt in place.

## Desktop layout

Use a compact title and playback bar over three columns. Put Input Script on the
left and give Output Prediction and Actual Output the full width of the right
column. In the middle, place Call Stack beside Web APIs and Event Loop, with
Microtask Queue and Macrotask Queue below. Pair panel titles with icons and use
the Code Atlas themes for contrasting headers, dividers, and items. The Event
Loop ring sits above the current step and explanation. It turns during
playback, pauses with the walkthrough, and stays static under reduced motion. Verify
the layout, keyboard and drag behavior, and animation in the browser. Use the
available desktop height for the runtime panes and Actual Output. Mobile design
is deferred. The stacked fallback keeps the controls available.

## Theory sections

Below the visualizer, add visible sections for the event loop overview, its
processing steps, common mistakes, interview questions, and related concepts.
Use original examples and link to relevant MDN resources. The Theory link in
the toolbar jumps there and preserves the walkthrough state. Align all five
panels to the full width of the visualizer. Keep the desktop visualizer tall
enough to reach the bottom of the first viewport.
Inspiration for the section order came from [VisualizeJS](https://visualizejs.com/javascript/event-loop).

## Later decisions

Code editing and generated traces need a separate scope decision. Use OpenSpec
if that work introduces a supported
JavaScript subset or execution adapter across Learn and Playground. Define
runtime semantics, unsupported-input errors, isolation and resource budgets,
source-to-frame mapping, and compatibility with authored playback before
implementation. Treat Node scheduling as a separate runtime model.

## Implementation and verification — 2026-11-24

- Published the module in Async and Recommended. The 13 authored frames share
  Code Atlas's source renderer, syntax preparation, and step controls. Timed
  playback advances one frame every 1.6 seconds.
- Lint, typecheck, all 795 Vitest tests, content validation, and the production
  build with credentials unset passed. The credential-free Chromium smoke suite
  passed 70 checks, including the Event Loop route's setup boundary.
- Six targeted authenticated Chromium checks passed, including sign-in and
  the existing Two Pointers regressions. The Event Loop checks covered the queue
  transitions, output order, keyboard focus, playback boundaries, scrubbing,
  restart and reload, and all four shared themes at 1280px and 320px.
- Signed-in Chrome also verified the final console order on the running local
  preview. Review captures are in `outputs/event-loop-visualizer/desktop.png`
  and `outputs/event-loop-visualizer/mobile.png`.

Reference findings came from Chromium interaction and targeted inspection of
the deployed bundle. REA confirmed page load in capture
`ev_fe808829caaa777d86c530c781fd2ebb74485905eae722d86af8aef5ecc28138`.
Its full-bundle analysis timed out. The authored sample's console order was
checked by running the same script in Chromium.

## Output prediction verification — 2026-11-24

- Signed-in Chromium checked focus after moving a log, boundary buttons, the
  movement announcement, and both incorrect and correct predictions. The
  revealed order matched the final console frame. Restarting playback preserved
  the exercise, and resetting or reloading restored its starting order.
- Reviewed the comparison side by side at 1280px and stacked at 320px, including
  Light and Dark appearance and no horizontal page overflow. Signed-in Chrome
  also checked keyboard movement and comparison on the running local preview.
  Review captures are `prediction-desktop.png` and `prediction-mobile.png` in
  `outputs/event-loop-visualizer/`.
- Lint, typecheck, all 796 Vitest tests, the credential-free production build,
  and all 70 credential-free Chromium checks passed. The targeted authenticated
  Chromium run passed sign-in, both playback tests, and the prediction exercise.

## Desktop layout verification — 2026-11-24

- Verified the full-width module and three-column placement in signed-in Chrome
  at 1024px and 1440px and in Playwright at 1280px. Moved the background
  explanation below the workspace so the controls appear sooner.
- Five targeted authenticated browser checks passed for sign-in, layout,
  playback, prediction, and the Two Pointers preview. Lint, typecheck, the web
  production build, and 22 focused Learn tests passed. The desktop capture is
  `outputs/event-loop-visualizer/three-column-desktop.png`.

## Drag-and-drop verification — 2026-11-24

- Five targeted authenticated Chromium checks passed, including pointer drops
  before and after another row, the insertion line, and keyboard pickup, drop,
  cancellation, and focus. Playback and prediction comparison checks passed.
- Signed-in desktop Chrome also verified pointer cancellation and completed a
  drop on the local preview. The insertion line is visible in
  `outputs/event-loop-visualizer/drag-and-drop.png`.
- Lint, typecheck, and the web production build passed.

## Visual refresh verification — 2026-11-24

- Signed-in Chrome checked the desktop workspace at 1024×768, 1440×980, and
  1440×1200. The work area ends above the example-notes disclosure, with the
  runtime panes and Actual Output reaching the bottom of the workspace. The
  disclosure opens with the keyboard.
- Measured the panel title contrast in Light, Dark, and Brown in Chrome. All
  titles met 4.5:1. Verified that the ring rotates during playback and stays
  still when paused or when reduced motion is enabled.
- Seven targeted authenticated Chromium checks passed for layout, playback,
  drag-and-drop, keyboard prediction, and the existing Learn walkthroughs.
  Lint, typecheck, the web production build, and 13 focused component tests
  passed. The refreshed capture is `outputs/event-loop-visualizer/streamlined-desktop.png`.

## Preset verification — 2026-11-24

- Six targeted authenticated Chromium checks passed, including switching from
  Easy while it was playing, clearing its console and prediction comparison,
  checking the Complex output, and switching back. The layout check also
  verified that the ring is centered above the step text.
- Ran the Complex source itself in Chrome and matched all six output lines to
  the authored walkthrough. Lint, typecheck, content validation, the web
  production build, and four focused fixture tests passed. The preset capture
  is `outputs/event-loop-visualizer/presets-desktop.png`.

## Theory verification — 2026-11-24

- All five panels aligned with the visualizer at 1440px and 320px in signed-in
  Chrome, with no horizontal overflow. The interview example printed `script`,
  `promise`, then `timer` in Chrome. The capture is
  `outputs/event-loop-visualizer/theory-desktop.png`.
- Seven targeted authenticated Chromium checks passed, including the keyboard
  jump to Theory and preservation of the active walkthrough step. Lint,
  typecheck, and the web production build passed.
