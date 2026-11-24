# Closures visualizer

## Outcome and scope

Publish Closures under Scope in JavaScript Learn. One prepared example calls
`makeMeter` twice and uses the returned functions to update two independent
`total` bindings. The Call Stack shows the factory returning. Scope Chain
keeps the captured bindings visible and highlights the one the current call
accesses. Console Output follows the selected step.

Reuse the full-width player, source highlighting, and theory panels. Include
the definition, lexical lookup, common mistakes, interview questions, and
related lessons. Panel roles and topics are informed by
[VisualizeJS](https://visualizejs.com/javascript/closures).

The example follows selected bindings in authored snapshots. Editable code,
extra presets, and engine memory inspection are separate work.

## Acceptance checks

- Find Closures under Scope. Play, step, scrub, pause, and restart the example.
- See the factory frame leave the stack while its `total` binding survives.
- Distinguish the two environments and see output `12`, `35`, then `15`.
  Rewinding restores both values and the corresponding output.
- Jump to full-width Theory with the keyboard and preserve the current step.

## Implementation checklist

- Register and validate the example and lesson.
- Compose the source, call stack, scope chain, and console with shared playback.
- Verify the sample and the layout in a signed-in browser.

## Verification

- The signed-in Chromium journey checked retained bindings, playback,
  keyboard navigation, rewinding, and the `12`, `35`, `15` console trace.
  Running the example in Chromium produced the same output.
- Direct Chrome review confirmed full-width theory and no overflow at 1440px
  and 320px. The desktop capture is `outputs/closures-visualizer/desktop.png`.
- Lint, typecheck, content validation, and the web production build passed.
