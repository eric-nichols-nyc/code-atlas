# Design

## Context

See `proposal.md` for the outcome and `specs/react-sandbox/spec.md` for behavior. Current architectural seams:

- `features/problems/components/javascript-editor.tsx` mounts CodeMirror from the judged problem session. The session owns source, editor-state/theme refs and callbacks. The installed JavaScript language extension already supports TypeScript plus JSX; a second editor is unnecessary.
- `ProblemTutor` renders shared messages, Markdown, scroller, question field and stop/retry controls. Its session currently obtains source and numeric Run diagnostics from `ProblemSession`. The SSE client and authenticated `createTutorHandler` already bound input/history, enforce origins, limit concurrent requests and cancel provider streams.
- `packages/problems` defines function/numeric input/output contracts. The QuickJS Node-worker judge cannot render React DOM and must not receive an artificial React problem definition.
- Subject metadata already includes React JS, but Dashboard disables its entry. Existing PracticeCatalog also owns progress/flagging tied to published judged problems; rendering it unchanged would expose unsupported account controls.

### Prototype evidence

Local branch `codex/react-sandbox-spike` contains initial commit `39440bb`, Dashboard entry `89ece2b`, and manual Submit revision `17be7ff`. It contains the completed exploratory code and `docs/features/react-sandbox-prototype.md`. Worktree: `work/react-sandbox-spike`; command: `pnpm prototype:react`; signed-in URL: `http://localhost:3002/react/prototype`. It is deliberately separate from this planning branch.

The initial automatic-preview version verified 14 Chromium journeys, including the actual stale-closure fix, overlapping recompilations, logs, runtime/syntax errors and recovery, current editor snapshots on tutor Send/follow-up, parent-DOM denial, three themes, 320px layout, Tab exit, reset and auth/origin rejection. Tutor browser responses were mocked; the real provider was not called. Twenty-five focused tests, lint, typecheck, production build and bundle analysis passed. Production review confirmed not-found page content and a 404 tutor endpoint. Evidence is local under ignored `outputs/react-sandbox-exploration/`.

The manual Submit revision passed 12 signed-in Chromium journeys: no runtime before Submit; explicit snapshot rendering; unchanged preview during edits/reset; current unsent source for tutoring; chat retention; submitted-snapshot isolation during compilation; theme/tab preservation; Mod-Enter; counter fix, runtime/syntax errors and recovery after Submit; and 320px controls. Lint, typecheck, two React tutor boundary tests and production build passed. Browser tutor responses were mocked. Evidence: `outputs/react-sandbox-exploration/manual-submit-results.json`.

## Goals / Non-Goals

**Goals:** Reuse the existing editor/tutor through narrow adapters; run one trusted React scaffold with one learner-editable file; make failures/recovery reviewable; promote the experiment into a coherent development-only module without changing judged problem semantics.

**Non-Goals:** A second judge, unrestricted project IDE, complete React curriculum, account persistence or production rollout. The pilot does not establish packaged Electron compatibility or production resource containment.

## Decisions

### 1. Compose classic Sandpack with CodeMirror

Pin `@codesandbox/sandpack-react@2.20.0`, its resolved client, and guest React/React DOM 19.3.1. Use `react-ts`, not a Nodebox/Vite/Next template. Existing CodeMirror becomes a named configurable editor receiving the narrow source/state/theme/callback interface; the original JavaScript wrapper retains existing defaults. Enable `javascript({ typescript: true, jsx: true })` only for React.

Keep a stable provider file map and dependency setup across rerenders. `/App.tsx` is the only editable file. A trusted entry point, CSS and package metadata supply the rest. Lazy-load the sandbox in a client component with `next/dynamic` and `ssr: false`; no Sandpack import belongs in the global navigation or existing JavaScript workspace.

Alternatives: SandpackCodeEditor duplicates our editor styling/history/focus integration. A handwritten iframe transpiler requires a compiler, dependency resolver, diagnostics and reload protocol. WebContainers/Nodebox add runtime scope unnecessary for this sample. A raw `sandpack-client` adapter could reduce UI-library cost later, but the composed React package is the smaller integration effort for the pilot.

### 2. Own the draft above the output panels

Keep the editable source, editor refs and tutor session above the output runtime. Submit captures the editor-state ref synchronously into an immutable snapshot with a new revision; Mod-Enter calls the same action. Mount a fresh Sandpack output provider keyed by that revision. Do not mount a guest runtime before the first submission. Typing changes only the draft; Reset code also changes only the draft. Show a changed-since-submission notice when draft and snapshot differ.

The tutor reads the editor-state ref independently of the submitted preview, so questions always receive the latest draft even if it has never been rendered. Keep editor history and chat outside the keyed runtime; keep preview and console mounted when switching their tabs within a submission. Fresh output runtimes clear logs and mounted effects on every Submit, making repeated counter runs predictable.

The initial automatic-preview experiment found overlapping initialization during development effect replay, edits skipped while compiling and effects preserved across Fast Refresh. Manual snapshots remove the need for automatic file-update flushing and `// @refresh reset`; retain only cancellable deferred runtime startup after effect replay. Test that a draft edit during compilation cannot replace the submitted snapshot. Do not disable application StrictMode.

[Upstream PR 1297](https://github.com/codesandbox/sandpack/pull/1297) is still open and describes similar initialization/remount/update races. It is evidence for caution, not an installed fix. Do not vendor an unreviewed library fork for this pilot.

### 3. Keep a source-only tutor adapter

Introduce a narrow tutor workspace input: exercise id, current source reader, validation, optional visible feedback and endpoint. Retain the existing numeric problem wrapper so JavaScript/Algorithms still validate their public Run diagnostics. React supplies no judge feedback.

The new development-only route `/api/react/exercises/[exerciseId]/tutor` uses the shared authenticated streaming handler with a feature-owned prompt resolver under `features/react-sandbox/server`. The server selects the authored exercise by id and validates the same bounded source/question/history envelope. Client-provided model, role/instructions, problem metadata and judge feedback are rejected. The prompt includes current `/App.tsx`, public requirements and recent completed exchanges; no private solution or preview/console output is added. The tutor instructions explicitly avoid claims of seeing rendered output or an accepted verdict. Existing provider credentials, rate limits, streaming, timeout, cancellation and sanitized failures remain server-owned.

Avoid a fake numeric problem or duplicating the tutor/provider route. A generic project/file context system is unnecessary until multiple editable files exist.

### 4. Promote only a development module

Use development-only `/react/practice` and `/react/practice/stale-closure-counter`, with a development-only Dashboard link and React-local return navigation. Each protected route independently verifies the learner. Unknown exercise ids are not found. Keep production guards on both page and API entry points; hiding a Dashboard link alone is insufficient.

Place authored metadata and prose in `content/react/practice/stale-closure-counter`, client UI/state in `features/react-sandbox`, and server-only prompt preparation in its `server/` folder. Reuse shared Card/Table/Badge/Button/DifficultyBadge and learning-panel patterns for a small one-entry catalog. Do not mount PracticeCatalog's progress hook or add React ids to `publicProblems` to make flags/solved controls appear to work. A read-only catalog mode can be extracted later when there is another consumer.

### 5. Make the browser boundary explicit

Use a custom iframe via Sandpack's client hook at the versioned hosted origin, currently `https://2-19-8-sandpack.codesandbox.io`. Grant `allow-scripts allow-same-origin` only; deny camera, microphone, geolocation and clipboard permissions and use a no-referrer policy. Never host the bundler on the application's origin. Keep account tokens, provider credentials and private judge data out of sandbox files/messages. Each existing mutation API must continue rejecting guest-origin requests.

This is an exploratory browser guest, with a real mismatch against constitution VI: CPU, memory, stack, execution wall time and arbitrary guest network egress are **not enforceably bounded**. Browser origin separation prevents parent DOM access; it does not provide these resource budgets. The proposed module therefore remains development-only, as requested for a minimal experiment. Public deployment and any constitution/runtime policy revision belong to a separate decision/change. No production gate is removed by applying this proposal.

Document actual budgets: one editable file, 100 retained logs, manual submitted snapshots, 30s connection timeout, one visible preview per workspace, 32 KiB UTF-8 tutor source and the existing tutor request/history/prompt/timeout/concurrency caps. These are host/context budgets, not guest execution limits. An infinite loop can hang the preview; do not test it in the user's active browser. A separate worker/supervised runtime or explicitly revised browser-preview policy would be needed for a public execution contract.

### 6. Preserve existing UI and honest status

Reuse semantic theme tokens, learning-panel headers and the tutor's existing shared UI. Desktop columns mirror the reference; the center stacks the 380px editor and 300px preview. Below 1100px panels stack, with a 340px editor at narrow widths and a bounded 640px tutor. Use flow heights and internal horizontal editor scrolling; avoid a global fixed viewport layout in this pilot.

Show an initial Submit prompt, then loading/connection timeout with Submit retry, and syntax/runtime error text alongside the console. Keep source/chat during failures. Limit logs to 100 and start a fresh console on each submission; diagnostic text is untrusted display data, not executable Markdown/HTML. The current hosted bundler sometimes wraps a JSX SyntaxError in an internal read-only-property TypeError; the useful file/tag message remains visible, but production-quality error presentation is not proven.

Explicit copy describes visit-only drafts/chat, hosted sandbox file transfer and TSX transpilation without semantic type checking. The browser experiment rendered `const value: number = "text"`; do not show a type-check badge or infer correctness from a successful preview. Submit only compiles and renders; it does not judge or save progress. No accepted/saved-progress controls are introduced.

## Risks / Trade-offs

- Hosted runtime/CDN outage → 30s bounded connection attempt, visible unavailable state and retry without losing source; editing and tutor composition remain usable. Offline support is excluded.
- Older lifecycle/runtime behavior → pinned dependency and local adapter regressions, stable provider inputs, no remount when switching tabs, fresh runtime only on Submit, draft-only reset; reassess upstream fixes before upgrades.
- Added browser payload → route-specific dynamic loading. The Webpack report attributed approximately 83.8 KB parsed / 23.2 KB gzip to Sandpack React itself, plus additional runtime/support chunks and remote runtime traffic. Module gzip estimates are not additive page-transfer totals. Review the final route graph before adoption.
- Browser containment limits → development-only execution gate; no production safety/judging claims and no secrets in guest context.
- Shared adapters regress existing problems → retain default wrappers and run existing editor/tutor/HTTP tests plus representative JavaScript and Algorithms browser journeys.
- Tutor hallucinated observations → trusted source-only prompt, no fake judge data, visible on-send context disclosure; provider answers remain guidance.

## Migration Plan

Apply the pilot on a feature branch. Port or selectively cherry-pick `39440bb` after reviewing it against this spec; it is a spike, not a wholesale production patch. Replace prototype-only paths with the development module routes, move authored content, retain manual Submit snapshots, add accurate TS/visit-only copy and loading/retry behavior, and verify cold/blocked runtime journeys. Update the feature brief and UI registry with actual results. No database or account-data migration is needed.

Build and verify production denies execution before merging the pilot. Rollback removes the development entry/routes and specialized dependency while retaining backward-compatible editor/tutor defaults, or reverts the isolated feature commit(s). Existing JavaScript and Algorithms routes remain the regression baseline.

Primary references: [Sandpack hooks](https://sandpack.codesandbox.io/docs/advanced-usage/hooks), [components and console](https://sandpack.codesandbox.io/docs/advanced-usage/components), [bundler hosting](https://sandpack.codesandbox.io/docs/guides/hosting-the-bundler), [templates/Nodebox distinction](https://sandpack.codesandbox.io/docs/resources/faq), and [React 19 support release](https://github.com/codesandbox/sandpack/releases/tag/v2.20.0).
