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

## AI tutor

Open **AI tutor** near the Playground heading and ask about the current script, including drafts you have yet to run. The tutor uses the Practice chat and provider for streaming hints, follow-ups, Stop, and Retry. Send includes the current code and a bounded error from the latest Run when the error matches that draft. Chat and unsent questions last for the workspace visit and survive panel and viewport changes.

- Dock the tutor on wide screens and use a right drawer on smaller screens. Keep the editor and console state across both layouts and return focus to the trigger on dismissal.
- Verify the current draft is captured at Send and Retry, matching errors follow the latest script, and changing or running code alone starts no tutor request.
- Route tutoring through the existing authenticated AI handler and server configuration. Test input rejection and provider failures independently of QuickJS execution.

See the [tutor design](../../openspec/changes/archive/2026-11-24-add-playground-ai-tutor/design.md) for the context and layout decisions.

## Verification

### AI tutor, 2026-11-22

- Lint, typecheck, the web production build, strict OpenSpec validation, and all 793 Vitest tests passed. The tutor server tests exercised validation, authentication, origin checks, and streaming with a fixture provider.
- All 69 credential-free browser smoke checks and all 10 targeted signed-in checks passed. The signed-in checks used fixture tutor responses to verify source snapshots, matching and stale errors, failure recovery, panel and viewport changes, and the Practice chat and Run regressions.
- The configured provider returned a grounded hint in a signed-in browser for a test script before any Run. Reviewed the desktop dock with the live reply and the 320px drawer with a fixture reply.

### Initial Playground, 2026-11-21

- Root lint, typecheck, credential-free production build, and all 790 Vitest tests passed.
- All 69 credential-free Playwright smoke checks passed. Playground shows the authentication setup page and the Run endpoint returns 503 in that configuration.
- Signed-in Playwright passed authentication setup and four Playground checks with a dedicated development learner. The browser used real QuickJS runs and verified output, the keyboard shortcut, syntax error recovery, edits during a run, visit-only state, both themes, desktop height and console scrolling, 320px layout, and authentication and origin checks.
- The production route trace includes the compiled script worker, guest, console harness, and QuickJS dependencies including WebAssembly. Desktop and 320px captures were reviewed from `outputs/javascript-playground/`.
