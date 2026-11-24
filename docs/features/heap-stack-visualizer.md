# Heap & Stack visualizer

## Outcome and scope

Publish Heap & Stack in JavaScript Learn. In one prepared example, a nested
function receives a number and an object reference, changes both, then
returns. The caller keeps its original number and sees the changed object.
The last reference disappears when the caller returns.

Use the full-width learning layout with Input Script, Call Stack, Heap, and
Console Output. Keep the stack top and object identities visible. Reuse the
Event Loop player controls, playback behavior, source renderer, and panel
styles. Give the memory visualization its own snapshot and rendering code.
Place full-width explanations, common mistakes, and interview questions below
the player, informed by [VisualizeJS](https://visualizejs.com/javascript/heap-stack).

The walkthrough shows authored snapshots of one tracked object. Storage
placement, the contents of an engine's heap, and garbage collection timing
are implementation details. Separate presets, output prediction, and learner
code execution are deferred.

## Acceptance checks

- Find the published module under Memory in JavaScript Learn.
- Play, pause, step, scrub, or restart. Source highlights, explanation, stack,
  heap, and output follow the same snapshot. Manual navigation pauses playback.
- See the inner frame push and pop, two bindings reach the same object, the
  number stay unchanged in the caller, and the heap object become eligible for
  collection after its last visible reference disappears.
- Reach Theory with the keyboard, keep the current step, and read the player
  and theory at narrow widths without horizontal page scrolling.
- Verify Event Loop still switches presets and plays, and that its prediction
  exercise still works after sharing the controls.

## Implementation checklist

- Share the workbench header and playback state.
- Register the lesson and render the prepared memory frames and theory.
- Check the teaching states, auth boundary, responsive layout, and playback.

## Verification

- Nine Chromium checks passed, including sign-in, six Event Loop regressions,
  and two Heap & Stack journeys. They covered playback, presets, pointer and
  keyboard prediction, and the Theory links.
- Ran the authored script in Chromium and matched its console output to the
  visualizer. Signed-in Chrome also confirmed the theory panels align with the
  player at 1440px and 320px with no horizontal overflow. The desktop capture is
  `outputs/heap-stack-visualizer/desktop.png`.
- Lint, typecheck, content validation, all 797 Vitest tests, and the web
  production build passed. The credential-free Chromium smoke suite passed
  all 71 checks, including the new route's auth boundary.
