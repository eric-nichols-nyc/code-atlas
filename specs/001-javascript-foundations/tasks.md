# Tasks: JavaScript Foundations — one-lesson review

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md.
**Scope**: exactly one published Scope and shadowing lesson. Existing admin-app removal/API changes are preserved. Tests are required by the specification and constitution.

## Format

Each task has a sequential ID and exact owned paths. Story tasks carry [US1]–[US4]. [P] means disjoint files can proceed after their stated prerequisites; it does not remove dependencies or require delegation. Paths below are repository-relative.

## Phase 1: Setup

- [x] T001 Add the pinned MDX, Shiki, server-only, and tsx dependencies from plan.md in `apps/web/package.json` and update `pnpm-lock.yaml` without changing the Next/React baseline.
- [x] T002 Add/adapt current shared resizable, tabs, sheet, radio-group, select, and alert primitives in `packages/ui/src/components/` with react-resizable-panels 4.21.0 in `packages/ui/package.json`; preserve existing semantic tokens and Radix import conventions.
- [x] T003 Compose MDX with bundle analysis in `apps/web/next.config.ts`, add `apps/web/src/mdx-components.tsx`, and define `content:check`/pre-build validation in `apps/web/package.json`.
- [x] T004 Separate Node content/guard tests from DOM/TSX tests in `vitest.config.ts` and verify ignored credentials/auth-state/build outputs in `.gitignore`.

## Phase 2: Foundational

- [x] T005 Define pure catalog, lesson, source-token, exercise, snapshot, and layout contracts in `apps/web/src/features/learning/lib/types.ts`; honor data-model.md's `published`/`planned`, 1-based source lines, 0-based playback indices, distinct uninitialized bindings, and version-1 finite layout fields.
- [x] T006 Write validator tests before implementing pure cross-reference/content checks in `apps/web/src/features/learning/lib/validate-content.node.test.ts` and `validate-content.ts`; wire `apps/web/scripts/validate-learning-content.ts` to reject duplicate IDs/slugs/orders, wrong publication sets, missing references, invalid answer options, and out-of-range/incomplete snapshots.
- [x] T007 Establish server-only route loading interfaces and unpublished test fixtures in `apps/web/src/features/learning/server/` and `apps/web/src/features/learning/__fixtures__/`; no fixture is reachable from a production registry or route.

## Phase 3: US1 — Learn a complete foundation (P1, MVP)

**Goal**: A direct protected Scope lesson is complete and readable without optional tools.
**Independent proof**: Guard/loader tests plus the direct route show objective, primer, explanation, highlighted source and valid catalog return. No previous/next links point to planned lessons.

- [x] T008 [US1] Write configured/unconfigured/rejected-session, selected-only loader, unpublished/unknown slug, and highlighting fidelity tests in `apps/web/src/features/learning/server/lesson.node.test.ts` before corresponding implementation.
- [x] T009 [P] [US1] Author the seven-entry catalog with only Scope published in `apps/web/src/content/javascript/catalog.ts`; Start learning resolves to the first published entry, not the first planned ordinal.
- [x] T010 [P] [US1] Author complete primer/prose/takeaways and exact example/activity data in `apps/web/src/content/javascript/scope-and-shadowing/lesson.mdx`, `definition.ts`, `example.ts`, `exercise.ts`, and `scenario.ts`; only this lesson is published, with one checkpoint and six complete scope states.
- [x] T011 [US1] Implement explicit protected lookup, literal MDX registry, and server-only Shiki tokenization in `apps/web/src/features/learning/server/registry.ts`, `lesson.ts`, and `highlight.ts`; preserve exact whitespace, expose only serializable tokens, and authorize before body loading.
- [x] T012 [US1] Implement shared readable lesson/prose/code/takeaway presentation and accessible source copy in `apps/web/src/features/learning/components/`; pass server prose as children, never an importer or highlighter object.
- [x] T013 [US1] Add protected direct lesson route, generic metadata, loading, error, and not-found states in `apps/web/src/app/learn/javascript/[lessonSlug]/`; prove a non-published second-lesson fixture reuses the shell without exposing another route.

## Phase 4: US2 — Discover the subject (P1)

**Goal**: Dashboard → subject landing → sole available lesson is a real journey.
**Independent proof**: Catalog test fixtures verify query/topic intersection, stable order, counts, empty/no-match states and valid destinations.

- [x] T014 [US2] Write filtering/count/availability tests in `apps/web/src/features/learning/lib/catalog.node.test.ts` before implementing its helpers in `catalog.ts`.
- [x] T015 [US2] Implement the flat catalog, title/topic alignment, available/planned counts, labeled search/topic controls, no-match clearing, and Coming soon rows in `apps/web/src/features/catalog/components/javascript-landing.tsx`.
- [x] T016 [US2] Add guarded subject landing and recovery states in `apps/web/src/app/learn/javascript/`; update `apps/web/src/features/dashboard/components/dashboard-content.tsx` to navigate to the real landing rather than the old preview dialog.
- [x] T017 [US2] Update dashboard expectations and new access/setup smoke cases in `apps/web/src/features/dashboard/dashboard.test.ts` and `tests/e2e/workspace.spec.ts`; preserve the current web/API-only test servers.

## Phase 5: US3 — Predict, observe, practice (P1)

**Goal**: One checkpoint and the prepared scope walkthrough provide complete formative feedback.
**Independent proof**: Correct/incorrect/retry, each frame's semantic state, exact backward/reset, source association, empty output and bounds work without layout resizing.

- [x] T018 [US3] Write exercise/playback/semantic-reference tests in `apps/web/src/features/learning/lib/activities.node.test.ts` and `apps/web/src/features/javascript/scope-shadowing/scope.node.test.ts` before activity implementation; verify final outputs Inside then Outside and distinguish uninitialized from undefined.
- [x] T019 [US3] Implement the lesson-keyed controlled session in `apps/web/src/features/learning/state/lesson-session.tsx`; answer, feedback, active tabs, playback and temporary scroll records outlive responsive layout branches, while a new lesson gets its own state.
- [x] T020 [US3] Implement the single checkpoint in `apps/web/src/features/learning/components/checkpoint.tsx` with selection, explicit submission, feedback announcement, and retry; do not duplicate it in a central Practice tab or imply saved completion.
- [x] T021 [US3] Implement bounded playback/output and the scope-specific view in `apps/web/src/features/learning/components/visualization-panel.tsx` and `apps/web/src/features/javascript/scope-shadowing/components/`; generic learning modules receive subject-owned slots instead of importing JavaScript renderers.
- [x] T022 [US3] Integrate the controlled activities through `apps/web/src/features/javascript/scope-shadowing/components/lesson-experience.tsx` and add DOM interaction/failure-isolation tests in `apps/web/src/features/learning/components/activities.test.tsx`; omit inactive capabilities and keep prose if the visualizer fails.

## Phase 6: US4 — Arrange the workspace (P2)

**Goal**: Real splitters, safe saved dimensions, optional tutor, and readable mobile flow preserve the active lesson.
**Independent proof**: With an answer and intermediate frame selected, drag/key-resize, show/hide, reset, reload and change 1440 → 390 → 1440; learning state survives and widths stay readable.

- [x] T023 [US4] Write pure preference/capacity tests in `apps/web/src/features/learning/lib/layout.node.test.ts` before `layout.ts`; reject wrong versions/non-finite/corrupt records and clamp 280/480/256px side/center minimums plus 240/260px code/visualization minimums.
- [x] T024 [US4] Implement guarded local storage and measured viewport readiness in `apps/web/src/features/learning/hooks/use-workspace-layout.ts`; stable readable SSR, safe read/parse/write fallback, completed-interaction persistence, and explicit reset to 340px/288px/54% defaults.
- [x] T025 [US4] Implement stable-ID main/nested splitters in `apps/web/src/features/learning/components/resizable-workspace.tsx`; capture/reconcile pixel side widths after optional panel registration and preserve the center height share.
- [x] T026 [US4] Implement responsive flow, curriculum/tutor drawers, Lesson/Takeaways tabs and persistent toolbar triggers in `apps/web/src/features/learning/components/learning-workspace.tsx`; no fixed header-height subtraction or duplicate global navigation.
- [x] T027 [US4] Add unavailable tutor/notes and local activity errors in `apps/web/src/features/learning/components/tutor-panel.tsx` and `activity-boundary.tsx`; no enabled send/save/Run/Submit controls, and tutor starts closed after reload.
- [x] T028 [US4] Add DOM retention, drawer focus, mode-switch, reset and storage-failure tests in `apps/web/src/features/learning/components/workspace.test.tsx`; preserve answer and frame rather than merely asserting CSS classes.
- [x] T029 [US4] Add authenticated browser pointer/keyboard splitter, collapse/restore, local storage, theme/reduced-motion, 200% zoom and viewport continuity journeys in `tests/e2e-auth/learning.spec.ts`; test the 2px lesson-width rounding tolerance and local-only code scrolling.

## Phase 7: Polish and cross-cutting validation

- [x] T030 Add the opt-in development-instance Clerk test harness and dedicated-user prerequisite in `playwright.auth.config.ts`, `tests/e2e-auth/auth.setup.ts`, and `package.json`; use ignored `.clerk/` state, reject production keys, and add no production bypass or test route.
- [x] T031 Run content check, lint, typecheck, Vitest, production build and existing production smoke tests; record results in `specs/001-javascript-foundations/quickstart.md` and keep unrelated API/admin-removal changes intact.
- [ ] T032 Review the actual signed-in landing and Scope lesson at all six widths, 200% zoom, both themes and reduced motion; save actual browser screenshots under `outputs/` and record authenticated automation results or a missing test-identity prerequisite honestly in `specs/001-javascript-foundations/quickstart.md`.
- [x] T033 Run the web bundle analyzer and verify no Shiki/MDX loader/filesystem/editor runtime is included in browser bundles; record evidence in `specs/001-javascript-foundations/quickstart.md`.
- [x] T034 Update implemented learning patterns, startup/content-authoring instructions and one-lesson status in `ui-registry.md` and `README.md`; remove only superseded JavaScript preview code that is no longer used.
- [ ] T035 Run Spec Kit convergence against `specs/001-javascript-foundations/spec.md`, `plan.md` and `tasks.md`; append and finish any remaining work without publishing another lesson, then refresh review copies in `outputs/001-javascript-foundations/`.

## Dependencies and execution order

Setup T001–004 → foundation T005–007 → US1 T008–013. After foundation, catalog helper/UI work can be developed independently; route/dashboard integration waits for the relevant US1 loader/route. US3 follows authored data and the basic view. US4 extends the completed controlled session; it must not own that session. T029 can be written before the harness, but execution waits for T030. Final checks depend on all intended story work. No database, AI, editor, or additional production lesson is a dependency.

## Parallel opportunities

- US1: T009 catalog metadata and T010 lesson authoring use separate files once contracts exist; T008 tests can be prepared against the agreed loader interface.
- US2: pure query tests/helpers and catalog presentation use independent files after foundation; dashboard integration is sequential.
- US3: the scope-specific renderer and checkpoint presentation can be prepared independently after the controlled state contract; integration follows both.
- US4: pure preference tests and unavailable-tutor view can be prepared independently; resizing and drawer/session integration are sequential.

## Implementation strategy

First make the direct Scope lesson readable and protected. Then connect the landing, complete the checkpoint and walkthrough, and add the real resizable shell. Validate each story before proceeding. The MVP is US1, but the user-review delivery includes all four stories for this one lesson. Tests precede their implementation tasks. Checkbox completion records implementation work, not spec-quality review. Do not commit or push without an explicit request.

## Requirement coverage

FR-001 T013/T016; FR-002 T009/T010; FR-003 T009/T015; FR-004 T014/T015; FR-005 T015/T016; FR-006 T011/T013/T026; FR-007 T007/T008/T013/T016/T017; FR-008 T025/T026; FR-009 T023/T025/T029; FR-010 T025/T027/T029; FR-011 T023/T024/T028; FR-012 T019/T025/T028/T029; FR-013 T026/T028/T029; FR-014 T018/T020/T022; FR-015 T010/T018/T021; FR-016 T018/T021/T029; FR-017 T012/T021/T022; FR-018 T027; FR-019 T015/T026/T032; FR-020 T020/T026/T028/T029; FR-021 T005/T006/T009/T010/T011; FR-022 T013/T015/T022/T027; FR-023 T007/T013/T019/T028; FR-024 T012/T020/T026/T027.

SC-001 T010/T013/T018/T020/T032; SC-002 T016/T032; SC-003 T014/T015; SC-004 T018/T021; SC-005 T023/T025/T028/T029; SC-006 T026/T029/T032; SC-007 T020/T026/T028/T029/T032; SC-008 T023/T024/T028/T029.

## Phase 8: Convergence

- [x] T036 Share a typed published-body identity list between `apps/web/src/content/javascript/body-ids.ts`, `catalog.ts`, and `features/learning/server/registry.ts` so metadata validation and actual MDX importer coverage cannot drift, per FR-021 and plan: explicit body registration (partial, MEDIUM).
- [x] T037 Move binding/scope contracts and snapshot validation to `apps/web/src/features/javascript/scope-shadowing/lib/`, pass registered state validation into the pure content checker, and keep generic playback dependent only on the output/step interface; verify subject rendering and generic fixture reuse, per FR-023 and plan: module ownership (partial, MEDIUM).

## Phase 9: Convergence

- [ ] T038 Complete actual 200% browser-zoom and reduced-motion-emulation checks for the signed-in landing/lesson in a browser with those controls; record results in `specs/001-javascript-foundations/quickstart.md` and close the remaining verification portions of T032/T035. The current in-app browser proved equivalent viewport capacity but does not expose those controls. Keep authenticated Playwright deferred until the user supplies a dedicated test identity; do not borrow a personal session or add an auth bypass, per SC-006/SC-007 and T032 (partial, MEDIUM).
