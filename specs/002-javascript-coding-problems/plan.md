# Implementation Plan: JavaScript Coding Problems

**Feature**: 002-javascript-coding-problems | **Date**: 2026-11-09 | **Git branch**: main, unchanged.

## Summary

Replace the published Scope visualization/checkpoint review with one real asynchronous Sleep coding problem. Preserve Code Atlas navigation/theme and adaptive split workspace. Publish Sleep only, with editable code, visible/custom Run cases, server-private Submit cases and actual session submission results.

## Technical Context

Baseline remains Node24, pnpm11, Next16.4.5, React19.3.1, Express5, Clerk, Biome/Vitest/Playwright. Add quickjs-emscripten 0.32.0 to API. Add native CodeMirror6 to web: state6.7.6, view6.43.15, commands6.11.1, language6.13.1, lang-javascript6.2.5, autocomplete6.20.4 and @lezer/highlight1.2.5. No CDN or external execution provider. Keep trusted local MDX for statement prose. Shared pure problem DTOs/public authored data belong in a small @workspace/problems package used by web/API; private cases remain in API only.

## Constitution Check

PASS. I: explicit replacement spec. II: shared pure contracts, feature UI and API-owned execution. III: page, BFF and /v1 independently authenticate. IV: real runner failure/resource tests plus UI/journey checks. V: no database claim; session attempts and local layout are separate. VI: a separate execution plan now defines the boundary and budgets; no learner eval in application JS or Electron. VII: shared controls/theme/splitters, explicit labels, focus exit and responsive session retention.

## Project Structure

- packages/problems/src/: public Sleep definition, execution DTOs and validation; built ESM package shared by both apps.
- apps/web/src/content/javascript/sleep/problem.mdx: trusted description, server-imported after Clerk authorization.
- apps/web/src/features/problems/: problem description/editor/results, session state and same-origin client requests.
- apps/web/src/features/learning/: retained generic adaptive shell, safe layout and unavailable tools; lower slot renamed output/results. Remove obsolete visualization/checkpoint/Scope renderer production files and associated superseded tests.
- apps/web/src/app/learn/javascript/[lessonSlug]/: protected problem composition. /sleep available, old /scope-and-shadowing unavailable.
- apps/web/src/app/api/problems/[problemId]/[action]/route.ts: authenticated same-origin BFF forwarding Clerk token to API; no secret in response/client.
- apps/api/src/execution/: validation/rate/concurrency control, private suite, worker supervisor and trusted QuickJS Worker module.

## Phase 0 — Research decisions

See research.md. CodeDrill source establishes Monaco editor, case/result UI and browser new Function evaluation; Submit only logs placeholder messages. Reuse interaction concepts, not that evaluator or a false judging claim. Use modular local CodeMirror for this single-file JS task. QuickJS WASM provides guest isolation; a disposable Worker provides lifecycle/termination. No fs/network/process/module host bridges. No external API key needed. Existing Clerk development config can be reused in ignored API environment files.

## Phase 1 — Design and contracts

### Problem and execution ownership

Shared package owns public samples/starter/solution plus DTOs. Web owns MDX and session UI. API owns the full suite and judgment. Source is bounded at32KiB; visible case inputs are 1–1000ms, maximum5. Private suite spans multiple positive delays including1 and1000ms; sample-specific solutions must fail hidden tests. Hidden results expose only aggregate status/counts and a generic failing-case label.

### Execution boundary and limits

A static trusted Worker receives only source, action and selected server-owned cases; Worker env is empty and no service clients/credentials are passed. QuickJS runtime heap16MiB, stack256KiB. Per-entry interruption deadline100ms and accumulated guest CPU budget250ms per case; idle timer waiting excluded. Independent per-case wall budget requestedMillis+400ms and parent job watchdog10s. Cap timer registrations128, outstanding timers32, console entries40 and text8KiB, source32KiB. Worker native resourceLimits additionally bound Node heap/stack but are not represented as a WASM cap. Dispose guest handles/timers/runtime and terminate worker on every outcome/abort.

Only bounded setTimeout/clearTimeout and primitive console diagnostics are bridged. No imports, require, process, fetch, DOM or filesystem. Promise detection uses QuickJS getPromiseState, rejecting non-Promises/already-fulfilled positive delays. Host monotonic time validates elapsed delay with lower tolerance3ms and upper allowance250ms. Pump bounded job batches and yield; endless microtasks are limited. Missing/throwing/rejected/never-settled cases have explicit failures. No Node eval/new Function/vm execution of learner code.

### API, backpressure and auth

/v1/problems/:problemId/run and /submit are behind existing Clerk boundary. Require known IDs/actions and validated code/cases. Per-user20 requests/minute, at most2 active/queued requests per user; global2 workers plus8 queue slots. Aborted responses cancel queued/running work. No raw exceptions/hidden diagnostics returned. BFF checks session and same-origin request, forwards a Bearer token to configured API_URL (default http://127.0.0.1:4000), and has an independent deadline.

### UI/session and migration

ProblemSession keyed to stable problem ID owns source/EditorState reference, sample edits, tabs, pending action, result snapshots and last20 actual submission attempts. It stays above responsive branches. CodeMirror is lazy loaded, uses semantic syntax roles and preserves selection/history through theme/layout changes. Default Tab exits editor; Mod-Enter runs. Reset code changes source explicitly; Reset layout only proportions. Lower center Testcase/Test Result replaces visualization. Left Description/Solution/Submissions replaces Lesson/Takeaways/checkpoint. Tutor remains unavailable.

Catalog has Sleep as sole published entry; existing Scope and other metadata planned. Old plan001 remains historical and marked superseded. No additional problem, saved account progress, connected AI, production deployment or Electron packaging is claimed.

### Verification

Write actual worker and authenticated endpoint contracts before integration. Test correct timing and immediate/missing/rejected/never-settled/infinite/memory/timer/console/module attempts, cleanup, backpressure, hidden-data redaction, stale revisions and UI state continuity. Use existing credential-free production smoke and manual signed-in browser proof. Keep authenticated automation deferred per user unless a dedicated identity is later supplied. Actual zoom/media checks remain honest prerequisites. Run root content validation/lint/typecheck/tests/build and inspect bundle: no private cases/QuickJS server runtime in browser; editor code is expected.
