# Debounce & Throttle visualizer

## Outcome and scope

Publish Debounce & Throttle under Async in JavaScript Learn. Feed the same
four input events into a trailing debounce and a leading-only throttle. Each
uses a 300 ms interval. Switch examples to compare the source and trace which
calls run, which are skipped, and what the wrapper keeps between events.

Reuse the full-width walkthrough player. Show the event timeline, the active
timer or throttle window, the retained wrapper state, and the console output.
Put theory, common mistakes, interview questions, and related concepts below.
The panel roles come from
[VisualizeJS](https://visualizejs.com/javascript/debounce-throttle).

The clock and inputs are authored. The timeline shows nominal times, while
real timer callbacks may run later. Editable bursts, leading debounce,
trailing throttle, and cancel or flush controls are separate work.

## Acceptance checks

- Find the module under Async. Play, pause, step, scrub, and restart.
- Switch modes at any point, including during playback. Source, timeline,
  timer, closure state, and output reset together at the first step.
- For the same inputs, debounce emits `cats` after the final quiet period.
  Leading throttle emits `c` and `cats`, with two intervening inputs skipped.
- Verify both authored scripts against their console traces in Chromium.
- Reach Theory by keyboard at desktop and narrow widths without losing the
  selected step or producing horizontal page overflow.

## Implementation checklist

- Register the two prepared traces and reuse the same input schedule.
- Render the timeline, wrapper state, and theory in the shared player.
- Verify example switching, timing, both browser traces, and layout.

## Verification

- Signed-in Chromium passed 14 checks across the five visualizers, including
  both timing modes, switching during playback, rewinding, and the Theory jump.
  With a controlled Chromium clock, the authored scripts logged `cats` at
  780 ms for debounce and `c`, `cats` at 0 and 480 ms for throttle.
- Direct signed-in Chrome confirmed all five theory panels match the player
  width at 1440px and 320px, with no horizontal overflow or page errors.
  Both desktop captures are in `outputs/debounce-throttle-visualizer/`.
- Lint, typecheck, content validation, all 797 Vitest tests, and the web
  production build passed. All 74 credential-free smoke checks passed,
  including both new lesson routes' auth boundaries.
