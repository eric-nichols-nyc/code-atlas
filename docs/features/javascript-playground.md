# JavaScript Playground

## Outcome and scope

Open **Playground** from JavaScript Practice or Learn and run the starter script to see the original and doubled arrays. The workspace contains one editable file and a console. A draft and its output last for the current visit. Saved snippets, packages, and browser previews are deferred.

## Acceptance

- **Run** and the editor shortcut capture current JavaScript and display its console output, errors, or time limit. Editing while a run is pending preserves the captured source and marks its output as earlier output when it arrives.
- The editor and console sit side by side on desktop and stack at narrow widths. The theme follows Code Atlas. A script failure or unavailable runner leaves the draft available to edit and retry.
- The page and API verify Neon Auth independently. The worker receives only the source. The guest has no host capabilities or private test data, and Playground does not write practice progress.

## Implementation checklist

- Share the bounded QuickJS guest and process worker capacity with Practice. Compile the standalone worker through the existing build.
- Add the source-only Run endpoint and a lazy shared CodeMirror editor under the JavaScript subject shell.
- Verify the compiled worker, authenticated route, and actual browser journey.

See the [OpenSpec design](../../openspec/changes/archive/2026-11-21-add-javascript-playground/design.md) for execution budgets and [spec](../../openspec/specs/javascript-playground/spec.md) for acceptance scenarios.

Promise rejection diagnostics cover the script's final Promise.

## Verification

Verified on 2026-11-21.

- Root lint, typecheck, credential-free production build, and all 790 Vitest tests passed.
- All 69 credential-free Playwright smoke checks passed. Playground shows the authentication setup page and the Run endpoint returns 503 in that configuration.
- Signed-in Playwright passed authentication setup and four Playground checks with a dedicated development learner. The browser used real QuickJS runs and verified output, the keyboard shortcut, syntax error recovery, edits during a run, visit-only state, both themes, desktop height and console scrolling, 320px layout, and authentication and origin checks.
- The production route trace includes the compiled script worker, guest, console harness, and QuickJS dependencies including WebAssembly. Desktop and 320px captures were reviewed from `outputs/javascript-playground/`.
