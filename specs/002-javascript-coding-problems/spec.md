# Feature Specification: JavaScript Coding Problems

**Feature Branch**: Existing main branch, unchanged.
**Created**: 2026-11-09
**Status**: Ready for planning
**Input**: User corrected the first review: remove visualization and multiple-choice learning; provide an editable JavaScript problem with real Run and Submit, like CodeDrill/LeetCode. The latest Sleep screenshot establishes the first problem and asynchronous behavior.

## User Scenarios & Testing

### User Story 1 - Solve a JavaScript problem (Priority: P1)

A signed-in learner opens Sleep, reads its statement/examples/constraints, edits the starter function and runs visible test cases.

**Why this priority**: Writing and testing code is the requested core experience.
**Independent Test**: Empty starter fails; a proper delayed Promise passes; changing the source changes the next result.
**Acceptance Scenarios**:

1. Given the JavaScript catalog, Start learning opens the sole published Sleep problem, with description on the left, editable code in the center and Testcase/Test Result below.
2. Given edited code, Run executes it against the visible cases and displays per-case status, expected delay, observed delay, console output and useful errors.
3. Given an edited case value within the supported bounds, Run uses that value. Invalid inputs explain the error without executing.

### User Story 2 - Submit a real solution (Priority: P1)

A learner submits their current source against the complete authored suite and receives an actual verdict.

**Why this priority**: A placeholder Submit button is explicitly insufficient.
**Independent Test**: A solution tailored only to examples can pass Run but fails Submit; a general correct solution passes the full suite.
**Acceptance Scenarios**:

1. Submit checks a separate full suite, independently of edited visible inputs; Accepted appears only after every case passes.
2. Hidden inputs/expectations are not delivered to the browser, including failure responses.
3. Failed, rejected or non-terminating code produces a real failure and leaves the application usable. Infrastructure failure never becomes Accepted.
4. The current session lists actual submission attempts and clearly says they are not saved to the account.

### User Story 3 - Arrange and recover the workspace (Priority: P2)

The learner resizes the existing workspace, switches themes and moves between mobile/desktop without losing their source or results.

**Why this priority**: Preserve the useful existing shell while correcting the interaction model.
**Independent Test**: Write source, run a case, change viewport/theme/tabs and reopen tools; source, editor selection/undo and results survive within the page.
**Acceptance Scenarios**:

1. No visualization, stepper, read-only solution-as-editor or multiple-choice checkpoint appears.
2. Description/Solution/Session submissions and Testcase/Test Result tabs have accessible names and keyboard controls.
3. Left/right widths and center height remain adjustable where capacity permits. Mobile content and controls remain reachable without horizontal document overflow.
4. Reset code explicitly restores the starter and clears stale results, while Reset layout changes dimensions only.

### Edge Cases

Missing credentials/session, unknown/unpublished problem, bad inputs, oversized source, missing function, a synchronous non-Promise return, already-resolved or rejected Promise, never-settled Promise, thrown timer callbacks, infinite loops/microtasks, memory/timer/output floods, overlapping requests, stale results after editing, judge unavailable and storage failure.

## Requirements

### Functional Requirements

- **FR-001**: Publish exactly one complete JavaScript coding problem, Sleep; keep existing planned topics unavailable and remove Scope as a published lesson in this review.
- **FR-002**: Sleep asks for an asynchronous function that returns a Promise settling after the requested 1–1000 milliseconds, with minor timing deviation accepted. Provide original description, examples, constraints, hints, starter and explanatory solution.
- **FR-003**: Provide an editable JavaScript source with syntax highlighting, line numbers, indentation, undo and accessible focus exit. Code is single-file JavaScript; do not imply support for other languages or external modules.
- **FR-004**: Run uses current source and visible editable cases. Submit uses current source and the full suite. Show pending status, disable duplicate actions and identify results that belong to an earlier source revision.
- **FR-005**: Report Accepted, Wrong Answer, Compile Error, Runtime Error and Time Limit Exceeded where appropriate; expose bounded console output and useful sample diagnostics.
- **FR-006**: Hidden cases and private judging configuration MUST remain server-owned. A full-suite failure identifies a hidden case generically without returning its input, expectation, output or captured log.
- **FR-007**: Authenticate every protected page and execution request. Bound per-user execution rate and concurrent work; return useful errors without leaking internal stacks or credentials.
- **FR-008**: Learner code MUST execute in a bounded isolated runtime without application, filesystem, network, DOM, credential or native-process access. Enforce source/input/output limits, memory/stack/CPU budgets, timer quotas and an independent overall deadline; terminate and release resources on every path.
- **FR-009**: Remove the visualization and multiple-choice checkpoint from the production JavaScript experience. Reuse the existing global navigation, semantic theme, catalog, tools and resizable shell, with Testcase/Test Result in the lower center.
- **FR-010**: Preserve source, editor state, test inputs, active tabs and actual results through responsive changes, theme changes, tutor visibility and layout reset. Restore starter code only through Reset code.
- **FR-011**: Show actual submission attempts in the active page session with an explicit unsaved label; no database persistence, account progress or cross-device history is claimed.
- **FR-012**: Define useful loading, no-result, invalid input, unavailable problem, expired session and judge-unavailable states. A failed request must never fabricate a verdict or erase source.

### Key Entities

- **Problem**: Stable identity, subject/topic, statement identity, starter/entry function, examples, constraints and solution.
- **Visible case**: Learner-editable requested delay within bounds.
- **Private test suite**: Authored full-suite inputs retained behind the execution boundary.
- **Execution result**: Action, actual verdict, passed/total counts, bounded visible diagnostics and unique attempt ID.
- **Problem session**: Source/editor state, cases, tabs, pending request and actual submission history, separate from saved layout preferences.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A learner reaches Sleep from dashboard in two navigation actions; no visualization/checkpoint appears.
- **SC-002**: Correct async sleep passes visible and full suites; immediate resolution, missing return, thrown/rejected errors, a sample-only workaround and infinite code fail correctly.
- **SC-003**: The complete suite contains additional undisclosed cases, and none appears in browser lesson payloads, execution requests, failure responses or bundles.
- **SC-004**: Non-terminating or resource-exhausting code finishes with a failure within the configured outer deadline, without freezing the page or taking down subsequent valid requests.
- **SC-005**: Source, selected editor state, cases and results remain intact through desktop → mobile → desktop, both themes, panel changes and layout reset.
- **SC-006**: Primary controls are keyboard-completable and remain reachable at 320, 390, 768, 1024, 1280 and 1440px without horizontal document overflow.
- **SC-007**: Submit histories contain only real results and explicitly remain session-local; reload never implies saved account completion.

## Assumptions

- The latest screenshot selects Sleep as the first JavaScript-specific review problem, superseding the earlier Scope/Move Zeroes question.
- Keep Clerk and the existing web/API apps. This delivery requires a running API but no new external judge subscription or database key.
- Match the described interaction model with Code Atlas's existing styling; do not copy branding, ads, paid features or invented statistics.
- An explicit solution is learning content, not a protected answer secret. Hidden judging inputs remain private.
- Browser-first, online, JavaScript-only and single-file. Saved submissions/progress, connected tutor, deployment scaling, additional problems and Electron packaging remain later work.
