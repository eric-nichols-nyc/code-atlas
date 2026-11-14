# React sandbox integration prototype

## Outcome and review

Test whether Sandpack can run a React TypeScript exercise while retaining Code Atlas's CodeMirror editor, shared panels, themes, and existing streaming AI tutor. The first example is **Stale Closure Counter**, based on the supplied layout reference: description left, editor above preview/console in the center, tutor right. Below 1100px the panels stack; the tutor has a bounded scroll area.

This is an isolated, development-only spike on `codex/react-sandbox-spike`. From this worktree run `pnpm prototype:react`, then sign in at **http://localhost:3002/react/prototype**. Port 3000 remains available for the main app. The prototype page and tutor endpoint are unavailable in a production build.

## Scope and acceptance

- One editable `/App.tsx`, React/React DOM pinned to the app's 19.3.1, and trusted hidden scaffold/CSS. Retain CodeMirror history, syntax highlighting, focus behavior, and themes. No file manager or dependency editing.
- Live React preview under the editor; Console / errors tab, bounded 100-message log, reset and restart. Runtime/syntax errors must recover after a valid edit.
- Reuse `ProblemTutor`, its messages, SSE transport, history, stop/retry, and authenticated server handler. Send current editor text only on a question; follow-up questions read fresh source. Source-only React prompts reject fabricated judge feedback.
- Preserve source through theme/tab/width changes and contain horizontal code scrolling at 320px.
- Later work: public React catalog, Learn content, saved drafts/progress, judging, semantic TypeScript diagnostics, multiple files, offline operation and packaged Electron verification.

## Implementation checklist

- [x] Keep CodeMirror and expose a narrow editor session adapter with TSX syntax.
- [x] Use `SandpackProvider` / `react-ts`, custom preview iframe, and `SandpackConsole`.
- [x] Adapt the tutor session and trusted prompt preparation without registering React in the numeric judge.
- [x] Review desktop/mobile and error/recovery journeys; run shared boundary regressions and build analysis.

## Findings and verification

**Sandpack is a practical fit for this small browser exercise, with adapter work.** Verified 14 signed-in Chromium journeys: stuck counter reproduces; a functional state update advances to 3+; logs arrive without unmounting the preview; runtime and syntax errors recover; overlapping edits retain the latest source; three themes and 320px width preserve source; Tab leaves CodeMirror; reset works; tutor requests contain exact latest TSX and history; anonymous API returns 401 and foreign origin returns 403. Tutor responses in these browser checks were deterministic mocks; the real provider was not called. The added server tests verify trusted prompt construction and the shared auth boundary with a fake provider.

Checks passed: `pnpm lint`, `pnpm typecheck`, 25 focused Vitest tests, `pnpm build`, and `pnpm analyze`. Browser evidence and the reusable probe are under the main worktree's ignored `outputs/react-sandbox-exploration/`. The Webpack report at `.next/analyze/client.html` attributes about 83.8 KB parsed / 23.2 KB gzip to Sandpack React itself; runtime/support chunks and the hosted bundler add further cost. These are module estimates, not a total page transfer budget. The sandbox loads through a route-specific dynamic import.

Two lifecycle details matter: overlapping initialization under development effect replay can strand updates, so startup is deferred until replay settles; a completion listener flushes edits skipped while compiling. [An open upstream fix](https://github.com/codesandbox/sandpack/pull/1297) covers similar lifecycle races. The counter also needs `// @refresh reset` so editing the interval callback remounts the sample instead of preserving its old effect. Provider inputs stay stable across theme changes to avoid resetting the draft.

The `react-ts` template transpiles TSX but **does not perform semantic type checking**: `const value: number = "text"` rendered successfully. Console output is for learners; this spike does not automatically send console text to the tutor. The prompt explicitly says it cannot see the preview or console and has no accepted verdict.

## Execution boundary and unresolved production policy

The iframe runs at `https://2-19-8-sandpack.codesandbox.io`, separate from Code Atlas. It permits scripts and its own origin; forms, popups, downloads and parent navigation are not granted. Camera, microphone, geolocation and clipboard access are denied. A browser test confirmed reading the parent DOM raises `SecurityError`. Only authored scaffold and learner source enter Sandpack; app sessions/provider credentials stay in the host/server.

Budgets in this spike: one editable file; 32 KiB UTF-8 tutor source cap; 100 retained console messages; 350ms compile debounce; 30s bundler connection timeout; one preview per workspace; existing tutor request/history/timeout/concurrency limits. **There is no enforced guest CPU, memory, stack, execution wall-time or network budget.** The browser and hosted bundler govern those resources. A bad infinite loop can hang the preview, and remote imports/network calls remain possible. Cross-origin isolation alone does not meet constitution principle VI's execution contract. No unbounded-code stress was run in the user's browser.

Production enablement therefore requires an explicit execution-policy decision and documented resource/egress controls (or a different runtime); this prototype is evidence, not proof of production containment. It also depends on CodeSandbox/CDN connectivity. Self-hosting needs a separate origin and still does not itself supply hard resource limits.

Primary integration references: [custom editor/client hooks](https://sandpack.codesandbox.io/docs/advanced-usage/hooks), [composable preview and console](https://sandpack.codesandbox.io/docs/advanced-usage/components), [bundler hosting/origin](https://sandpack.codesandbox.io/docs/guides/hosting-the-bundler), and [classic versus Nodebox templates](https://sandpack.codesandbox.io/docs/resources/faq). The classic `react-ts` template is sufficient here; Vite/Next/Nodebox is unnecessary for this experiment.
