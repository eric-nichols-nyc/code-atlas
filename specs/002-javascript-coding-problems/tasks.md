# Tasks: JavaScript Coding Problems

Scope: one complete Sleep review problem; visualization/checkpoint removed. Preserve unrelated workspace changes. No commit/push/deployment.

## Phase 1: Setup and contracts

- [x] T001 Add `packages/problems/` public contracts/content and build wiring; install pinned API QuickJS and web CodeMirror packages in package manifests/lockfile.
- [x] T002 Write actual runner and execution/auth contract tests before implementation in `apps/api/src/execution/*.test.ts`; include async success, invalid Promise, rejection, CPU/memory/timer/output limits, private redaction and failure recovery.

## Phase 2: US1/US2 — Real Run and Submit

- [x] T003 [US1] Implement bounded QuickJS Promise/timer execution and cleanup in `apps/api/src/execution/runner-worker.ts` with a static trusted Worker and no host I/O/module/credential access.
- [x] T004 [US2] Implement worker supervision, queue/cancellation, private Sleep suite and safe results in `apps/api/src/execution/`; Submit never accepts browser-supplied hidden cases.
- [x] T005 [US2] Mount authenticated `/v1/problems/:problemId/run|submit` routes with validation/rate limits in `apps/api/src/app.ts`; verify no work before session success.
- [x] T006 [US1] Add session-verified same-origin web BFF in `apps/web/src/app/api/problems/[problemId]/[action]/route.ts`, bounded request/response/error contracts and API configuration.
- [x] T007 [US1] Replace the published content with Sleep statement/starter/examples/constraints/solution and catalog metadata in `apps/web/src/content/javascript/` and `packages/problems/src/`; keep old Scope unavailable.

## Phase 3: US1/US3 — Coding workspace

- [x] T008 [US3] Add problem-keyed session ownership and source/editor-state retention in `apps/web/src/features/problems/state/`; preserve results/cases through layout/theme changes and identify stale results.
- [x] T009 [US1] Add lazy local CodeMirror JavaScript editor with theme, accessible focus exit and current-source Run/Submit/reset actions in `apps/web/src/features/problems/components/`.
- [x] T010 [US1] Add Description/Solution/session Submissions and Testcase/Test Result panes with bounded actual diagnostics in `apps/web/src/features/problems/components/`; no fake Saved/Accepted state.
- [x] T011 [US3] Adapt existing `features/learning/` split shell for lower results, curriculum and tool drawers; remove obsolete production visualizer/checkpoint and old Scope presentation.
- [x] T012 [US1] Compose protected `/learn/javascript/sleep` and unavailable old routes, with safe loading/error/setup states; no authorized body/definition load before session protection.
- [x] T013 [US3] Update unit/component/catalog tests and opt-in browser journeys for new source/results behavior; extend production smoke without bypassing auth.

## Phase 4: Validation and review

- [x] T014 Configure the API with the existing development Clerk instance in ignored environment files without exposing keys; validate actual Run/Submit in the signed-in browser.
- [ ] T015 Run content check, lint, typecheck, meaningful tests and production build/smoke; preserve existing API work and record results in `quickstart.md`.
- [ ] T016 Review real editor/result layout, sample/custom cases, Accepted/failure, source retention and no overflow at target sizes; save actual screenshots under `outputs/002-javascript-coding-problems/` and report unavailable zoom/media/auth automation honestly.
- [ ] T017 Update `README.md` and `ui-registry.md`; inspect bundle for private cases/QuickJS, run convergence, and save feature review artifacts.

## Dependencies and strategy

T001→T002→T003/T004→T005→T006. Public content and session UI follow shared contracts; full integration follows safe server execution. No empty or placeholder Run/Submit delivery. Tests establish semantic/error/resource behavior rather than restating the implementation. Research agents were used only for the plan's execution/editor API investigation; implementation remains sequential.

## Requirement coverage

FR-001 T007/T012; FR-002 T003/T007/T010; FR-003 T008/T009; FR-004 T004/T006/T008/T009/T010; FR-005 T002/T003/T004/T010; FR-006 T002/T004/T005/T017; FR-007 T002/T005/T006/T014; FR-008 T002/T003/T004; FR-009 T007/T010/T011/T012; FR-010 T008/T009/T011/T013/T016; FR-011 T008/T010/T013; FR-012 T004/T006/T010/T012/T013.
SC-001 T007/T011/T012/T016; SC-002 T002/T003/T004/T014; SC-003 T002/T004/T017; SC-004 T002/T003/T004; SC-005 T008/T009/T011/T013/T016; SC-006 T009/T010/T011/T016; SC-007 T008/T010/T013.

## Handoff to the lightweight workflow

The user requested the project-local feature-workflow after the working Sleep review. The current record is docs/features/javascript-coding-problems.md. T014 completed through the existing development Clerk instance and actual signed-in Run/Submit. T015 has passing content/lint/typecheck/tests/build; production smoke not rerun during the dev session. T016 has real six-width/theme/source/result/history proof; unavailable zoom/media/auth automation are recorded honestly. T017 documentation is updated; bundle review results are in the short brief. These remaining formal checkboxes are preserved instead of claiming every planned verification ran.
