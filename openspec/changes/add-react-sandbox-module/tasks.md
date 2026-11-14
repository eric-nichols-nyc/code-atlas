# Tasks

These tasks promote the reviewed spike into the development-only module. Commit `39440bb` is exploratory evidence; its completion does not mark the module tasks below complete. Public production enablement is outside this change.

## 1. Establish the pilot boundary

- [ ] 1.1 Create/update `docs/features/react-sandbox.md` from the prototype findings with included/deferred scope, actual resource budgets and constitution VI mismatch; verify it explicitly excludes production rollout, judging and persistence.
- [ ] 1.2 Add the pinned Sandpack dependency and reviewed build-script policy from the spike; verify `pnpm install --frozen-lockfile` succeeds without enabling an unnecessary dependency postinstall.
- [ ] 1.3 Add development-only React page/API entry guards and independent learner authentication, using feature-owned server modules; verify anonymous requests are denied and a production build exposes not-found content/API 404 before provider work.

## 2. Deliver one exercise with the existing editor

- [ ] 2.1 Author trusted Stale Closure Counter metadata, requirements, scaffold/CSS and starter under `content/react/practice`; verify a submitted starter sticks at 1 and each later submission starts fresh mounted state.
- [ ] 2.2 Port the narrow CodeMirror session/TSX adapter while retaining the original JavaScript wrapper; verify existing saved-code/editor tests and `pnpm typecheck` pass.
- [ ] 2.3 Compose the route-specific client sandbox with stable provider inputs, one editable `/App.tsx`, pinned guest dependencies and the narrowed separate-origin iframe; verify no guest runtime before Submit, rendering after Submit and parent-DOM denial in Chromium; inspect frame attributes.
- [ ] 2.4 Separate draft/editor/chat state from immutable output snapshots; Submit and Mod-Enter capture current code into a fresh output runtime with cancellable deferred startup. Verify edits/reset do not execute, edits during compilation stay out of the snapshot, repeated Submit restarts state, and a submitted counter fix advances to 3+ without reloading the page.
- [ ] 2.5 Add preview/console tabs, 100-message cap, error summaries and 30s connection failure/retry behavior; verify logs continue while the preview tab is hidden, submitted invalid TSX/runtime errors recover on corrected resubmission, and a blocked bundler leaves source/question drafts usable through Submit retry.
- [ ] 2.6 Reuse shared panels and controls in the desktop/stacked layout, with bounded tutor height and accurate visit-only/hosted-preview/transpilation copy plus initial Submit and changed-since-submission notices; verify three themes, 320px no-overflow, source/history preservation, keyboard focus exit and error visibility in the browser, then update `ui-registry.md`.

## 3. Connect the existing tutor

- [ ] 3.1 Port the narrow tutor workspace adapter and source-only validation while preserving the judged-problem wrapper; verify the existing tutor state, UI and contract tests still pass with numeric Run feedback.
- [ ] 3.2 Add the trusted React prompt resolver and development-only `/api/react/exercises/[exerciseId]/tutor` Route Handler using the shared authenticated streaming boundary; verify authored context/current TSX, unknown ids, missing auth, foreign origin, input limits and rejection of fabricated judge/authority fields with a fake provider.
- [ ] 3.3 Wire current editor-ref snapshots into the reused tutor UI; verify no requests on typing, exact unsubmitted draft source immediately on Send even when a different snapshot is rendered, new source/history on follow-up and retry, streaming cancellation and changed-code notices with deterministic browser responses.
- [ ] 3.4 Document the tutor's source-only context and the absence of automatic preview/console capture; verify the prompt and visible disclosure agree and no sandbox/provider credentials appear in client files or request context.

## 4. Make the development module discoverable

- [ ] 4.1 Add the development-only `/react/practice` entry and sample workspace route using shared catalog primitives without progress/flag controls; verify Dashboard → React Practice → exercise → Back stays in React and produces no React progress writes.
- [ ] 4.2 Keep React Learn unavailable and production Dashboard/subject navigation unchanged; verify built production routes and navigation cannot start the pilot, while existing JavaScript/Algorithms links still work.

## 5. Review the integrated slice

- [ ] 5.1 Run root `pnpm lint`, `pnpm typecheck`, relevant editor/tutor/boundary tests and `pnpm build`; verify all pass and record exact results plus remaining limits in the feature brief.
- [ ] 5.2 Run `pnpm analyze` and inspect the React workspace's lazy chunks plus unrelated routes; verify specialized runtime code stays route-specific and record module/page cost distinctions.
- [ ] 5.3 Review the signed-in React journey and representative JavaScript/Algorithms journeys, including the output/tutor/error/responsive scenarios; record actual browser evidence separately from mocked provider tests and mark untested packaged Electron behavior explicitly.

## Workflow follow-up

- Review this development pilot before expanding exercises or proposing production execution-policy changes.
- Archive only after the applied pilot and its verification meet the project workflow; no production enablement is implied by archive.
