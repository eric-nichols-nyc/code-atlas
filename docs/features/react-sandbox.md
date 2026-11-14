# React practice development pilot

## Outcome and scope

Provide Dashboard → React Practice → **Stale Closure Counter** as one authenticated development-only module. The reviewed workspace keeps our CodeMirror TSX editor and AI tutor, with the preview and Console / errors beneath the editor. **Submit** or Mod-Enter captures the current code into a fresh output runtime. Typing and Reset code change only the draft; a notice identifies output from an earlier draft. The tutor independently reads current unsent editor text when a question is sent.

Included: one editable `/App.tsx`, trusted scaffold/CSS and fixed React dependencies, live component behavior after Submit, bounded console history, runtime/syntax error recovery, connection timeout/retry, three themes and narrow layout. Editor history and chat survive submissions and layout changes. Submit compiles/renders; it does not judge or save progress. TSX is transpiled without semantic TypeScript checking. Drafts and chat last for the visit.

Deferred: production rollout, React Learn, judging, account drafts/progress/flags, multiple editable files, dependency editing, semantic diagnostics, offline operation and packaged Electron verification. No schema migration or React entry in the QuickJS judge is needed.

## Acceptance and implementation

- [x] Development-only catalog/workspace/API each enforce their own learner boundary; production hides navigation, shows unavailable page content and returns API 404.
- [x] One authored counter starts at 0 and sticks at 1; submitting a functional update advances it past 1. Every Submit uses a fresh snapshot; edits during compilation cannot change that snapshot.
- [x] No runtime before Submit. Preview remains on submitted code while editing/resetting. Console remains connected across tabs, caps logs at 100 and shows recoverable errors.
- [x] A blocked runtime times out within 30s, preserves source/question, and retries using Submit. Loading, unavailable and changed-code states are visible.
- [x] Tutor uses trusted context and exact current draft on Send/follow-up/retry, with bounded history and existing auth/origin/input/stream protections. It receives no preview DOM or console capture and rejects fabricated judge feedback.
- [x] Shared UI, three themes, editor undo/focus exit and 320px stacking work without document overflow. Catalog exposes no account flag/completion controls.
- [x] Root checks, production gates, route bundle graph and signed-in React plus JavaScript/Algorithms journeys pass; record evidence below.

Review with `pnpm dev` at **http://localhost:3000/react/practice**, or choose Explore React JS on Dashboard.

Routes: `/react/practice`, `/react/practice/stale-closure-counter`, `/api/react/exercises/[exerciseId]/tutor`. Authored content lives under `content/react/practice`, client behavior under `features/react-sandbox`, and privileged prompt preparation under its `server/` folder. Existing JavaScript/Algorithms editor and tutor wrappers retain their defaults.

## Execution boundary and budgets

The hosted Sandpack runtime receives only scaffold and learner source, in a separate-origin iframe (`https://2-19-8-sandpack.codesandbox.io`). Grant scripts and its own origin only; deny camera, microphone, geolocation and clipboard permissions. Provider credentials, account sessions and private judge data stay in the host/server. Hosted files and guest network access require connectivity.

Budgets: one editable file, one visible output runtime, 100 retained log entries, 30s connection attempt, manual compilation of immutable snapshots and the existing tutor source/question/history/body/prompt/timeout/concurrency limits (including 32 KiB UTF-8 source). **Guest CPU, memory, stack, execution wall time and arbitrary network egress have no enforceable budget.** Origin separation does not meet constitution VI's hard resource-isolation contract. The user-approved experimental scope remains development-only; production enablement and any revised execution policy require separate work. Do not run unbounded guest stress in the user's active browser.

## Verification

Verified on 2026-11-14:

- `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm build` and `pnpm analyze` pass. All **552 Vitest tests (64 files)** pass with two workers, including the existing editor/tutor wrappers, new React auth/origin/input/production boundaries and trusted prompts.
- `pnpm test:e2e:react` passes **8 checks** (dedicated server-auth setup plus seven signed-in browser journeys). It covers catalog/Back navigation without account writes, no execution before Submit, immutable snapshots during edits/compilation, repeat/reset/keyboard behavior, counter fix, console cap, parent-DOM denial, runtime/syntax recovery, three themes/undo/320px overflow, a real 30s blocked-bundler timeout and retry, tutor stop/retry/follow-up using unsubmitted code, anonymous/guest/unknown-resource denial, and representative JavaScript/Algorithms source/tutor journeys. Tutor responses were deterministic browser mocks; no real provider call was made.
- `pnpm test:e2e --workers=2` passes **62 credential-free production smoke checks**, including pilot page/API exclusion. A separate signed-in production browser review passes **5 access/bundle checks**: Dashboard offers no pilot link, React pages/API deny execution, and Dashboard/JavaScript/Algorithms request no Sandpack chunks. Existing judged Run/Submit logic is covered by Vitest; the representative signed-in browser regression does not mutate account progress.
- Bundle analysis attributes **83,777 parsed bytes / 23,240 gzip bytes** to Sandpack React itself, with further runtime/support chunks and hosted traffic. The workspace appears in its own lazy-load entry. Unrelated route references carry no workspace chunks; production network inspection confirms none of the emitted Sandpack chunks load on Dashboard or existing practice workspaces. Module gzip estimates are not a total page transfer budget.
- Browser evidence: ignored `outputs/react-module/catalog.png`, `workspace-desktop.png`, `workspace-mobile.png`, `production-results.json`, `bundle-modules.json` and `bundle-routes.json`. Desktop and 320px captures were inspected directly. Production review completed with port 3000 free before starting each test server; development mode was restored afterward.

The initial shared UI sign-in setup hit a development hydration race, so the pilot suite uses the same server sign-in endpoint with a dedicated development identity and its own ignored auth state. A narrow header overflow found during review was fixed and the suite rerun successfully. Production containment, semantic TypeScript checking, real tutor-provider responses and packaged Electron behavior remain outside these verified claims. The prior prototype brief is retained as historical evidence.
