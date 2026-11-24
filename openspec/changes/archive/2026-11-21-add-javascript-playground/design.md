# Design

## Context

See [proposal.md](proposal.md). The JavaScript subject shell owns navigation, and the existing CodeMirror adapter accepts a consumer-owned editor session. Practice uses a QuickJS guest with private case selection, verdicts, and progress writes around it.

## Goals / Non-Goals

Share the editor, sandbox, and execution limits with Practice. Support a single classic JavaScript script with console output and bounded async work. Saved drafts, module/package loading, browser APIs, and progress tracking are out of scope.

## Decisions

### Workspace

Add a JavaScript-only navigation entry and a verified page. Compose the shared theme, Button, panel pattern, and lazily loaded CodeMirror editor. Follow the approved layout with the page heading and visit-length notice, a `script.js` header with Run, and a Console header with execution status. Use a wider editor and a side-by-side console on desktop. Stack the console below the editor on narrow screens.

Capture the live editor source at Run, keep one in-flight request, and compare finished output to the draft. Abort the client request on unmount. Use text for console output and errors.

### Execution

Keep `POST /api/javascript/playground/run` in the App Router. Share the existing session, origin, bounded JSON, and no-store response helpers. Give the Playground its own source-only request and log/status response. Keep the feature out of the problem catalog and progress service.

Extract the existing QuickJS guest setup, console bridge, and worker launcher for use by a dedicated standalone script worker. That entry receives source only. Practice keeps its judge adapters and private test handling. Run script code in global mode, drain Promise jobs and supported timers, and dispose guest handles and timers at the end of each run. Include the new endpoint in worker and WASM build tracing.

An alternative is sending scripts through the current problem handler. That would couple the scratchpad to function entry points, grading, and progress storage. A hosted browser preview would add browser capabilities and a different isolation policy.

## Risks / Trade-offs

- Freeform execution shares the process worker capacity with Practice. Reuse the two-worker and eight-queue limits, and cap Playground at ten requests per verified learner each minute with one pending request per learner.
- Apply the existing 32 KiB source limit, 16 MiB QuickJS memory, 256 KiB guest stack, 100 ms CPU per guest entry and 250 ms aggregate CPU, 4,096 Promise jobs, 128 timer registrations, 32 live timers, five seconds per timer, and bounded console output. Use a six-second worker watchdog and a 20-second request deadline that includes queueing. The console captures up to 40 entries and 8,192 characters plus a truncation notice.
- A Promise produced by the script can report rejection or lack of progress. Promise callbacks and timers are supported within limits. The scratchpad is a single-run console and does not provide browser developer tools or a persistent event loop.
- Exercise the compiled worker, authentication boundary, production route tracing, and responsive browser journey. Existing judge tests guard the behavior of extracted code.

## Migration Plan

Deploy using the existing worker build and web release. No data migration is required.
