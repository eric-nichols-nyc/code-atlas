# Generators & Iterators visualizer

## Outcome and scope

Publish Generators & Iterators in JavaScript Learn under Iteration. One
prepared example creates a generator, yields twice, receives an argument
through `next(5)`, returns a final value, and is called once after completion.
Learners can see which `next()` call is active, where execution resumes, which
locals survive a pause, and how `value` and `done` change.

Reuse the full-width player from Heap & Stack and Event Loop. Use Input Script,
Generator State, Call Flow, and Console Output panels with a shared explanation
strip. Add full-width theory, mistakes, interview questions, and related
concepts beneath the player. The panel roles and teaching topics come from
[VisualizeJS](https://visualizejs.com/javascript/generators).

The first slice uses one synchronous generator and authored snapshots. Custom
source, additional presets, delegation with `yield*`, and async generators
are later work.

## Acceptance checks

- Open the module from the Iteration category and navigate by stepping,
  playing, pausing, scrubbing, and restarting.
- See the body wait until the first `next()`, the argument enter at the
  suspended `yield`, the local value change from 10 to 15, and `done` stay false
  until `return`. A subsequent call produces `undefined` with `done: true`.
- Console results match the authored script in Chromium. Moving backward
  restores the state and removes later output.
- Use the keyboard to reach full-width Theory without changing the selected
  step. Keep the page within the viewport on desktop and at 320px.

## Implementation checklist

- Register and validate the authored example and lesson.
- Compose the shared player with dedicated generator state and call flow panels.
- Verify the lesson and existing visualizers in signed-in Chromium.

## Verification

- The signed-in Chromium suite passed 11 checks across Generators, Heap & Stack,
  and Event Loop, including sign-in. Chromium ran the authored generator and
  matched all four results to the walkthrough, including the final `undefined`.
- Direct Chrome review found no page errors or horizontal overflow at 1440px
  and 320px. All five theory sections matched the player width. The desktop
  screenshot is `outputs/generators-visualizer/desktop.png`.
- Lint, typecheck, content validation, 797 Vitest tests, and the web production
  build passed.
  All 72 credential-free Chromium smoke checks passed, including auth gating
  on the new lesson route.
