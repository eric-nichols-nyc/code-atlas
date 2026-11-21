# JavaScript practice

Current Learn availability is described in [JavaScript learning](javascript-learning.md).
The coming-soon Learn references below record this feature's original scope.

**Outcome:** Solve JavaScript problems with editable code, real Run/Submit results,
and a consistent practice workspace. Published problems: Counter, Filter Elements
from Array, Debounce, and Sleep.

## Code Drill test runner interaction — 2026-11-20

**Before/after:** Test Result currently stacks every case in a long list. Match
the Code Drill reference with a verdict header, horizontally scrollable case tabs
with pass/fail indicators, and one selected case's Input, Stdout, Output and
Expected sections. Empty stdout explicitly says “No console output.” Compile
errors have a dedicated error view. Sleep retains its observed-delay feedback.

Reference: local `codedrill/apps/app/features/problem-workspace/components/output-panel/`
(`test-result-panel.tsx`, `testcase-panel.tsx`, `testcase-field-blocks.tsx`) and
the supplied screenshot. Reference source is interaction evidence, not project
instructions. Keep Code Atlas's real isolated judge, editable cases, Submit suite,
private-case redaction, saved-code behavior, and separate AI Feedback tab.

Acceptance and implementation:

- [x] Run opens Test Result; each tab reveals only that case's captured input,
  stdout, actual and expected values, including zero, false and empty strings.
- [x] Show pass/fail symbols and accessible verdict names; case tabs work by
  keyboard and fit narrow layouts without document overflow.
- [x] Keep result selection independent of editable testcase selection; retain it
  across output tabs, theme and responsive remounts. A new result starts at Case 1.
- [x] Preserve pending/empty/service-error/stale feedback, compile/runtime/time
  errors, Sleep timing, and private-case redaction.
- [x] Verify component regressions, relevant root checks and direct browser review;
  record fixture versus real judging and any remaining limits.

Deferred: execution-engine changes, submission history and new testcase editing
capabilities.

**Result:** Shared output tabs identify Testcase, Test Result and Feedback with
icons; compact mobile labels keep all three visible. Test Result keeps its verdict
and case selector above the scrollable details. Each case uses separate parameter
boxes, explicit stdout, output and expected values. Compile errors use their own
view; runtime/time errors remain associated with their case. Selection lives with
the execution snapshot, independent of editable cases, and resets on a new result.
Hidden cases display status and a privacy explanation. No judge, auth, account or
database behavior changed. The visual pattern is recorded in `ui-registry.md`.

**Verification:** Root lint, typecheck, credential-free production build and
`git diff --check` passed. The full suite passed **697 tests across 77 files**;
after compacting mobile tabs, **42 targeted tests across four files** passed.
Ten new component cases cover selection/remounts, captured input/stdout, falsy
outputs, compile/runtime/time errors, private values, timing and service states.
Production public smoke passed **68/68** checks on port 3188.

Dedicated-learner production browser review on port 3187 passed the new runner
journey: keyboard arrows/focus, input snapshots, independent selections, Submit
payloads, hidden-case views, all three themes and 320/390/768/1440px layouts.
Desktop/mobile screenshots were inspected; mobile output labels were tightened
after the first review. Existing tutor/evaluation journeys were also checked.
Authentication and note reads used the real development learner; execution,
saved-code reads and AI responses used fixtures. These browser checks do not
establish live judging, code persistence or model output. No notes were saved.
Local configuration/screenshots are ignored under `outputs/code-drill-test-runner/`;
the new browser regression is tracked in `tests/e2e-auth/test-runner.spec.ts`.
Existing local servers/builds were preserved. Packaged Electron was not exercised.

### Console array capture fix — 2026-11-20

The native console bridge replaced all arrays and objects with `[object]`. A
compiled-worker regression reproduced the reported `console.log('sort1=', sort1)`
failure before the fix. Console methods now inspect values inside the QuickJS guest,
using captured intrinsics and property descriptors; ordinary getters and `toJSON`
are not invoked. Arrays/objects show their contents, with explicit circular,
accessor, function and truncation markers. Inspection is bounded to four levels,
25 entries per collection and 100 visited objects. Existing argument, line, total
console, CPU, memory and private-case redaction limits remain in force.

Verification: **701 tests across 77 files passed**, including four new worker
regressions covering the exact sorted array, nested/circular/accessor values,
modified intrinsics and hostile proxy timeouts/recovery. Existing private-case
coverage now logs arrays/objects to check redaction. Root lint, typecheck,
credential-free production build and `git diff --check` passed. Browser review reran the reported solution without
editing its source: all three cases passed and Stdout displayed
`sort1= ["a","a","a","g","m","n","r"]`. This was a live Run using the existing
source/inputs, not a fixture. Proof is ignored at
`outputs/code-drill-test-runner/console-array-fixed.jpg`.

## Scope

- `/javascript` opens `/javascript/practice`. Recommended includes all four problems;
  populated categories are Closures, Arrays, and Async. Search and difficulty filters
  intersect with the selected category. Clearing filters preserves that category.
- The compact table shows a flag beside each title, difficulty, topic, and solved status.
  Easy/Medium/Hard use green/amber/red; category icons have distinct theme colors.
  On narrow screens, topic metadata groups with difficulty without page overflow.
- Subject headers show an arrow + Dashboard link, divider, and topic icon/name.
  Learn/Practice have book/code icons, centered desktop navigation, and text-only
  hover states. Mobile keeps Dashboard/topic visible above the section links.
  Current Learn availability is described in the linked learning brief.
- Problem routes use Back to Practice and an AI tutor toggle in place of the global
  header. The left pane has Problem, Solution, and Notes tabs. Problem opens first
  with the description, examples, constraints, and independent hint accordions.
  Solution shows the authored code and explanation without another reveal control.
  No visualization or Submissions view is included.
- The shared editor supports Reset code, theme, a disabled Share icon, Run, Submit,
  editable cases, and expected/actual results. Desktop panes resize horizontally and
  vertically; mobile uses a reading layout and tools drawer. Source, inputs, help,
  and results survive theme and responsive changes while the problem is mounted.

**Deferred:** Learn curriculum, individual submission history, connected tutoring,
editable saved notes, additional problems, administration, and Electron packaging.
Account-backed flags, completion and latest executed code are now covered by the
[database users feature](database-users.md). Unexecuted edits and latest results remain session-only.

## Problem contracts

| Problem                    | Category / difficulty | Editable Run cases                                     | Judging                                                                                              |
| -------------------------- | --------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Counter                    | Closures / Easy       | Initial integer and invocation count                   | Numeric sequence, boundaries, repeated calls, and independent closure instances                      |
| Filter Elements from Array | Arrays / Easy         | JSON integer array and supplied callback               | Original values/indices, truthiness, order, empty arrays; guest `Array.prototype.filter` is disabled |
| Debounce                   | Async / Medium        | Delay and JSON schedule of timestamped calls/arguments | Cancellation, latest arguments, separated bursts, and zero/boundary delays                           |
| Sleep                      | Async / Easy          | Requested milliseconds                                 | Promise settlement after the requested delay                                                         |

Each Submit selects ten server-owned cases. Hidden inputs, outputs, and logs are
redacted. Client-supplied Submit cases are ignored. Visible failures show honest
expected/actual data; malformed inputs are rejected before execution.

Debounce uses a deterministic guest clock, including `Date.now`. At the same
timestamp, scheduled calls execute in input order before timers due at that time.
This is a testing environment, with no visualization. The supplied Filter callbacks
cover values, indices, and truthiness; their source is visible beside the case inputs.

## Ownership and boundaries

- `packages/problems/src/problems/`: one public definition per problem, including
  starter source, samples, constraints, hints, and solution. Shared types and registry
  validation live beside those modules.
- `apps/web/src/content/javascript/practice/`: catalog metadata, trusted problem MDX,
  and explicit lazy statement loaders. The content validator checks registration and
  public case contracts. Learners cannot provide executable MDX.
- `features/catalog`: category/search/difficulty behavior, table, and browser records.
  `features/problems`: editor/session/input/result behavior. `features/learning`
  retains the shared adaptive layout and tools panel.
- `apps/api/src/execution/`: server-private suites and bounded judging adapters.
  QuickJS runs inside disposable Node Workers with memory, stack, CPU, timers,
  console, concurrency, and wall-time limits; no Node, filesystem, DOM, or network.
- Protected pages verify sessions. The same-origin web adapter verifies session,
  origin, and payload limits; Express verifies the forwarded Clerk token under `/v1`.
  Database credentials are unnecessary for these practice problems.

Flags, verified solved status, and latest Run/Submit source now persist to the learner’s
Neon account through authenticated APIs. See [database users](database-users.md) for
ownership, browser-import semantics, failure recovery, and current verification. Older
browser completion records remain separate unverified history until an accepted Submit.
The earlier checks below record the browser-local implementation before this migration.

## Acceptance and implementation

- [x] Publish all four canonical problem routes with matching definitions, MDX,
  catalog metadata, validated inputs, and private suites.
- [x] Correct implementations pass Run and Submit; unfinished/off-by-one code,
  broken timer cancellation, index/truthiness mistakes, and resource abuse fail.
- [x] Preserve hidden-case redaction, authentication boundaries, bounded execution,
  and recovery after timeout or invalid results.
- [x] Category, search, and difficulty filters intersect; counts reflect real content.
  Flags toggle without navigation and persist per learner; solved reflects accepted Submit.
- [x] Reuse shared Table, Select, badges, navigation, theme, and workspace components;
  preserve keyboard names/focus and narrow-screen access without horizontal overflow.
- [x] Remove unused preview/planned-content modules, five unused UI primitives,
  retired visualization/layout-reset code, test-only helpers, and two unused web dependencies.
  Keep active Select and Next.js convention files. Order Prisma generation tasks to
  avoid concurrent output writes during root checks.

## Verification — 2026-11-09

- Root lint, typecheck, content validation, and production build passed.
- **106 Vitest tests across 16 files passed**, covering real judging, resource limits,
  API/BFF policy, input parsing, catalog filters, flag ownership, and accepted-Submit state.
- A subsequent account-switch regression check passed with all nine workspace tests:
  changing learner identity remounts the session and discards the previous learner's draft/help state.
- **25 production Playwright smoke checks passed** on isolated ports 3100/4100,
  preserving the development servers. These cover credential-free public/setup boundaries.
- Compiled production judge modules accepted the authored solution for each of the four
  problems, ten cases each, verifying the compiled worker/adapter path.
- Signed-in browser review covered Counter, Debounce, and Filter Run/Submit; malformed
  JSON; live filtering; flag persistence after reload; solved indicators after accepted
  Submit; source/result preservation across resizing; both themes; and navigation icons.
  At 320px, the catalog and Debounce workspace had no document horizontal overflow.
  Temporary viewport/theme changes were restored. Proof: `outputs/javascript-practice/`.
- The web/UI import-graph audit found no remaining orphan modules. `git diff --check`
  passed. Authenticated Playwright remains deferred at the user's request; manual
  signed-in review does not count as authenticated automated coverage. Electron is unverified.

## Shared subject header polish — 2026-11-14

**Before/after:** The Code Atlas/Dashboard group did not identify the current
subject, and mobile hid Dashboard and the section links behind a disclosure.
JavaScript, React, and Algorithms now share the approved header: arrow + Dashboard,
divider, topic icon/name, centered desktop Learn/Practice, and theme/account on the
right. Below `lg`, section links occupy a visible second row, with the existing
account disclosure. The three topic symbols are a yellow JS tile, a React atom,
and an Algorithms branching diagram. Routes/auth remain app-owned; reusable
layout, technology icons, and semantic accent tokens live in `packages/ui`.

**Acceptance and implementation:**

- [x] One direct `/dashboard` link and the correct full topic name on each subject.
- [x] Preserve subject-specific section routes, active state and loading feedback;
  React Practice remains development-only and focused workspaces retain local Back.
- [x] Keep Dashboard/topic/sections/theme visible without horizontal overflow or
  truncated topic names from 320px through desktop widths.
- [x] Preserve account access, keyboard navigation and Escape focus restoration.
- [x] Record the shared header, icon and color conventions in `ui-registry.md`.
- [x] Complete final root checks and production smoke verification.

**Verification:** Dedicated-learner signed-in browser review passed for all three
subjects at 320, 390, 768, 1024 and 1440px. It checked topic identity, full labels,
no overflow/overlap, account disclosure, Escape focus and Dashboard destinations.
Light, Dark and Dark purple theme switching passed without browser runtime
errors. Screenshots are in ignored `outputs/*-header-*.png`.

Root lint, typecheck, `git diff --check`, and a credential-free production build
passed. `pnpm test --maxWorkers=2` passed all **570 tests across 66 files**; the
initial unrestricted run had one resource-sensitive judging timeout, resolved by
the lower-concurrency run. Production Playwright passed **66/66** credential-free
checks on port 3100 using ignored `outputs/ui-polish-smoke.config.ts`, preserving
the existing development server on 3000. Existing theme/auth smoke journeys now
use the configured base URL instead of a hardcoded port. The signed-in browser
review used the separate dedicated test identity and made no progress edits.
Packaged Electron remains outside this browser-only change's verification.

## Separate Solution tab — 2026-11-20

Move the authored solution from the last Problem accordion to its own left-pane
tab between Problem and Notes, for JavaScript and Algorithms. Keep the existing
green active-tab indicator, scrollable pane, and shared responsive workspace.
Hints stay in Problem. Reading a solution does not replace or execute learner code.

- [x] Show only the authored code and explanation in Solution; remove the old
  Solution accordion from Problem.
- [x] Preserve code, inputs, expanded hints, results, and unsaved notes when
  switching tabs, changing themes, or resizing.
- [x] Verify keyboard tab navigation and 320px containment in the browser, and
  run lint, typecheck, focused workspace/notes tests, and a production build.

**Verification:** Root lint, typecheck, production build, and 34 focused
workspace/notes/evaluation tests passed. Direct signed-in browser review covered
Most Frequent Character and Sleep, arrow-key navigation, Light/Dark themes, and
320px containment. Code, open hints and an unsaved note survived tab switches
and responsive changes. Result retention is covered by the mocked workspace
test. The local production app was rebuilt and restarted; packaged Electron and
authenticated end-to-end automation were not rerun for this change.

## Workspace state audit — 2026-11-20

**Outcome:** Identify unnecessary workspace updates and recommend the first focused
optimization. This section records the baseline before the hook refactor below;
the initial audit changed documentation only. Branch: `codex/state-management-audit`, based on
`0f883dd086bff7a3227aed1fa98024ac5dcdaafb`.

The scope is the shared JavaScript/Algorithms problem workspace, including the
editor bridge, cases/results, evaluation, tutor, notes, and responsive layout.
Catalog synchronization is a separate future audit. The React sandbox shares
`CodeEditor` and `TutorSession`; preserve those interfaces during later changes.

### Current ownership

| State                                                    | Current owner                                                                 | Lifetime / update trigger                                                                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Source and saved-code status                             | `problems/state/problem-session.tsx`                                          | Per learner/problem; source changes on each editor document update; saved source restores from account and saves on Run/Submit |
| CodeMirror state, callbacks and theme compartment        | Refs in `problem-session.tsx`, consumed by `components/javascript-editor.tsx` | Survive editor remounts within the session                                                                                     |
| Case drafts, selected case, expanded hints, output tab   | `problem-session.tsx`                                                         | Per visit; panel interactions                                                                                                  |
| Execution result, pending action and errors              | `problem-session.tsx`                                                         | Explicit Run/Submit; immutable source/input snapshot                                                                           |
| AI evaluation                                            | `state/code-evaluation.ts`, called inside the problem session                 | Explicit Evaluate/Stop/sample preview; visit-only report                                                                       |
| Tutor draft, turns and active stream                     | Separate `state/problem-tutor.tsx` context                                    | Draft edits and streamed deltas; visit-only chat                                                                               |
| Note draft and saved baseline                            | Separate `state/problem-notes.tsx` context                                    | Lazy initial read; edits; explicit Save                                                                                        |
| Responsive capacity, panel preferences, tutor visibility | `learning/hooks/use-workspace-layout.ts` and `LearningWorkspace`              | Resize / layout interactions; browser-backed panel preferences                                                                 |

### Findings and recommendations

1. **High priority: narrow workspace subscriptions.** `ProblemSession` publishes
   one newly constructed object containing all workspace state and commands.
   `DescriptionPanel`, `SolutionPanel`, `CodePanel`, `ResultPanel`, the editor,
   input controls, and `ProblemTutorSession` consume that object. In a fixture
   with the real panel components, 20 source edits produced 20 additional commits
   each for the description, code controls, results, and open tutor. A separate
   Solution-view fixture produced 20 commits for the unchanged authored solution.
   Ten selected-case changes also updated description, code controls and tutor
   ten times each. Split subscriptions by what panels actually need: stable
   problem content, hints, inputs, editor draft/status, execution and evaluation.
   Keep session lifetime keyed by learner/problem. Stabilize commands and slice
   values, and use memoized child components where a parent must still update.
   Memoizing the existing whole context will not isolate actual source changes.

2. **High priority: cache derived input parsing.** The session maps
   `parseInputDraft` over every case on every render, including source edits,
   hint toggles and selected-case changes. With Counter's two unchanged cases,
   20 code edits caused 40 parses, and ten hint toggles caused 20 parses. Cache
   parsed inputs by problem definition and case drafts; retain validation on
   actual input changes. Separate testcase controls from result freshness so
   code edits do not refresh unchanged fields. Results and evaluation still need
   to reflect whether their captured source differs from the current source.

3. **Medium priority: isolate tutor composition and completed answers.** The
   tutor context already keeps draft/stream updates out of other workspace
   consumers. Inside `ProblemTutor`, however, each draft edit and delta rebuilds
   the conversation. With one completed answer, 20 draft edits rendered that
   unchanged Markdown answer 20 times. Streaming 20 deltas for a follow-up also
   rendered the previous answer 20 times, plus 20 renders of the growing answer.
   Extract a memoized turn/answer and separate the composer subscription.
   Pass stable turn data and the derived source-changed flag; keep the active
   reply and relevant stale-source indicators responsive. Defer batching deltas
   or virtualizing history until browser profiling shows they are needed.

**Patterns to retain:** Twenty note edits produced zero description, code-control,
result, or tutor commits. Twenty tutor draft edits produced zero commits in the
other measured panels. Source edits made zero network requests in the guest
fixture. Keep the existing synchronous source ref for immediate Run/Evaluate/Send,
request cancellation and late-response guards, lazy note loading, explicit save
semantics, and retained CodeMirror state across panel remounts. The refs protect
different lifetimes and races; removing them merely to reduce state variables
would change behavior.

**Package decision:** Start with React contexts/props, stable callbacks and
targeted memoization. These findings do not establish a need for another state
package. Zustand is a candidate if selective workspace subscriptions become
harder to maintain with React alone; a store would need the same learner/problem
lifetime. TanStack Query addresses API-backed data caching and synchronization;
evaluate it separately for catalog progress. It does not address the source-to-
panel subscriptions measured here.

### Custom hook opportunities

Custom hooks already exist: `useWorkspaceLayout`, `usePracticeRecords`,
`useCodeEvaluation`, and the internal `useProblemState`, `useTutorState` and
`useNotesState`. The `useProblemSession`, `useProblemTutor` and `useProblemNotes`
hooks expose the associated contexts. Most live under feature `state/` folders.

The main extraction opportunity is the broad `useProblemState` hook:

| Proposed hook                         | Responsibility                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `useProblemInputs(problem)`           | Case drafts, stable IDs, selected case, add/update actions and memoized parsed inputs                                                |
| `useProblemDraft(problem, learnerId)` | Source, synchronous snapshot reader, restoration, browser backup integration and account save status; preserve late-read protections |
| `useProblemExecution(...)`            | Explicit Run/Submit, cancellation, validated result snapshots and completion outcomes                                                |

Start with inputs, whose dependencies are narrow. Extract draft/execution logic
after that boundary is verified; retain execution/evaluation mutual exclusion
and cross-feature outcomes in a small session coordinator. Keep the pure parser
in `lib/` and these feature-specific hooks beside their owning state.

Hook extraction improves ownership and testability. It does not itself isolate
renders: hooks execute in the component that calls them. Instantiate owning state
once per keyed session and publish narrow, stable context values to consumers.
Calling a new state-owning hook separately in every panel would create independent
state. Keep extraction and subscription changes distinct when comparing results.

### Recommended first implementation slice

- [ ] Isolate stable problem content/hints and case controls from editor updates,
  cache parsed inputs, and keep execution/evaluation coordination in the session.
- [ ] Repeat the same fixture: source edits cause no commits in Solution or
  unchanged testcase controls, and no input parses. Hint/case selection changes
  leave unrelated panels unchanged. Source-dependent status/freshness stays live.
- [ ] Preserve immediate snapshots, restore races, account/problem isolation,
  execution/evaluation exclusion, notes/chat retention and editor history across
  theme, tabs and responsive remounts. Keep tutor Markdown work for a separate slice.
- [ ] Profile the real browser with representative code, inputs and chat history;
  compare render duration and typing responsiveness. Run root lint, typecheck,
  relevant tests, build and browser checks before declaring that slice complete.

### Audit evidence and limits

- `pnpm test apps/web/src/features/problems/state apps/web/src/features/problems/components --maxWorkers=2`:
  **48 existing tests passed across nine files**, including source snapshots,
  delayed restore, account changes, notes save races, tutor cancellation and evaluation.
- A local ignored probe in `outputs/workspace-state-audit/` used React Profiler
  around actual panels, a spy forwarding to real input parsing, and a wrapper
  forwarding to real Markdown rendering. It exercised independent updates with
  `act`, after warmup, without Strict Mode. Counter had two cases. The description
  and Solution fixtures were separate; tutor was mounted/open; a note-context
  consumer represented notes. Dynamic editor loading and tutor transport were
  mocked. The editor engine, notes editor and responsive layout were not mounted.
- `pnpm exec vitest run --config outputs/workspace-state-audit/vitest.config.ts --maxWorkers=1`:
  **3/3 audit probes passed**. Raw counts are in the local ignored
  `outputs/workspace-state-audit/baseline.json`; these local fixtures are not part
  of the tracked change.
- These are development/jsdom commit and parsing counts, not production timing
  measurements. Nested UI effects can add commits (ten hint toggles produced
  30 description-subtree commits). No latency improvement is claimed. Signed-in
  browser profiling, live persistence and packaged Electron were not exercised.

## Workspace hook refactor — 2026-11-20

**Outcome:** Make the shared workspace state easier to follow by giving case
editing, source restoration/save status, and Run/Submit execution their own hooks.
The session remains the coordinator for evaluation exclusion, output tabs and
account outcomes. Keep the panel-facing draft/result contracts; replace mutable
case IDs and the raw case setter with an `addCase` action owned by the inputs
hook. Cache input parsing by problem and drafts.

**Scope:** Feature-owned hooks in `features/problems/state/`; no new dependencies,
server changes, visual redesign, or persistence policy changes. Context subscription
isolation and tutor Markdown memoization remain separate future work. The audit
above records the implementation before this refactor.

- [x] Extract `useProblemInputs`, `useProblemDraft` and `useProblemExecution`;
  keep action-time source snapshots, backup recovery and late-response guards.
- [x] Preserve case editing/addition, validation, Run/Submit results, accepted-Submit
  completion, evaluation exclusion, saved-code restoration and per-account lifetime.
- [x] Verify parsing is unaffected by unrelated source/hint/selection updates.
- [x] Run relevant behavior tests, lint, typecheck, full tests, production build
  and browser checks. Record actual outcomes and remaining limitations here.

**Result:** `problem-session.tsx` is now a 130-line coordinator, reduced from
267 lines. Read `state/problem-inputs.ts` for case editing and cached parsing,
`state/problem-draft.ts` for source/restoration/save status, and
`state/problem-execution.ts` for request validation, browser backup before a
request, cancellation and captured results. The session applies completed/failed
execution outcomes to draft save status and verified Submit completion. Editor
refs remain at the session lifetime. Removed the unused reset-generation ref;
the results panel now calls `addCase` instead of mutating case IDs/drafts itself.

**Verification:**

- Root lint, typecheck and `git diff --check` passed. `pnpm test --maxWorkers=2`
  passed **680 tests across 75 files**. The focused workspace run passed **53 tests
  across ten files**, including five new composition regressions covering independent
  cases and the five-case cap, cached parsing, immediate source snapshots, concurrent
  action exclusion, in-flight edits, delayed restore after Reset/invalid Run, and
  cancellation without recording a late accepted Submit.
- A credential-free root production build passed using
  `CODE_ATLAS_DIST_DIR=.next-preview/workspace-hooks`, preserving the existing
  production server/build on port 3000. Content validation passed for all subjects
  and 17 registered problems.
- Dedicated-learner production Playwright on port 3100 passed sign-in setup,
  **seven existing tutor/evaluation journeys** and **two additional JavaScript/
  Algorithms workspace fixture journeys**. The additional journeys covered restored
  code, five editable cases, action-time payloads, later typing remaining unsaved,
  Submit payloads excluding visible inputs, Reset, Solution/Notes tabs, themes,
  1440px/320px layout changes and unsaved note retention, with no page errors.
  The custom resize assertion waits for geometry to settle; an initial immediate
  assertion observed the transitional layout. The affected journeys passed after
  correcting that local fixture, with no application change.
- Screenshots of Counter desktop/mobile and Valid Anagram mobile were inspected.
  Local fixtures/configs/screenshots are ignored under `outputs/workspace-state-audit/`.
  Authentication and note reads used the dedicated development learner. The extra
  workspace journeys used fixtures for execution and saved-code reads; UI tutor/
  evaluation replies were also fixtures. These checks
  do not establish live judging/persistence or real model output. No notes were saved.
- All **three local audit probes passed**. Twenty source edits now produce **zero
  input parses**, down from 40; ten hint toggles and ten selected-case changes also
  produce zero parses, down from 20 each. This phase's raw counts are in local ignored
  `outputs/workspace-state-audit/hooks-baseline.json`; the original counts remain in
  `baseline.json`. Panel commit counts and completed-answer Markdown rendering are
  unchanged. No production typing-latency gain is claimed; fine-grained subscriptions,
  tutor rendering and packaged Electron verification remain outside this change.

## Workspace render isolation — 2026-11-20

**Outcome:** Typing updates the editor and source-dependent status while leaving
authored content, unchanged testcase controls and unrelated tutor content alone.
Replace the aggregate session subscription with focused React context readers.
Publish stable values and actions, and derive result/evaluation/tutor freshness
instead of sending current source through every panel. Keep the existing hooks,
learner/problem lifetime and all request/persistence protections.

**Scope:** No new state package, server changes or visual redesign. Tutor draft/
stream rendering and production latency optimization remain separate work.

- [x] Typing leaves description, Solution and unchanged testcase controls alone;
  hint/case selection changes do not update the editor or unrelated content.
- [x] Results, evaluation and tutor notices become stale on edits and fresh again
  when source/inputs match their snapshots, without recurring unrelated updates.
- [x] Preserve synchronous source capture, Run/Submit/Evaluate exclusion,
  cancellation, restoration, saved status and drafts across remounts.
- [x] Compare panel commits with the baseline; run root checks and production
  browser journeys, recording fixture and live-service limits separately.

**Implementation:** `state/problem-context.tsx` owns typed context readers and
stable publication of content, cases, editor, controls, results, evaluation,
hints and output tabs. There is no aggregate session reader in application code.
The 121-line session coordinator owns actions and lifetime; specialized hooks
still own their behavior. Stable callbacks keep editor commands current even
when input changes no longer rerender the editor. The results panel memoizes
testcase controls and Feedback against unrelated parent updates. Result/input
comparison runs only when those snapshots change; source-dependent readers get
derived freshness flags. Tutor notices compare with matching captured sources
through a separate context, keeping source edits out of conversation Markdown.

**Measured comparison:** The same warmed Counter fixture, with two cases and
the tutor mounted, applied 20 independent source edits without Strict Mode.
Each content view was measured separately. Counts are additional React Profiler
commits, not production timings.

| Subtree                  | Before isolation | After isolation                      |
| ------------------------ | ---------------- | ------------------------------------ |
| Description              | 20               | 0                                    |
| Solution                 | 20               | 0                                    |
| Empty results            | 20               | 0                                    |
| Open tutor without turns | 20               | 0                                    |
| Code controls            | 20               | 1, to enable Reset on the first edit |

Dedicated regression fixtures also show zero commits in unchanged case fields
and zero unrelated panel commits after controls have reached their unsaved state.
With an existing result, completed evaluation or tutor answer, 20 edits cause one
freshness update; returning to captured code clears the warning with one update.
Completed tutor Markdown renders zero times during those edits and reversions.
Multiple tutor source snapshots and in-flight evaluation notices are covered.
Ten hint toggles no longer update code controls, results or tutor; ten selected-case
changes leave authored content, controls, tutor and editor alone. Input parsing
remains zero for these unrelated updates. Tutor composer edits and stream deltas
still update the conversation; that separate optimization remains deferred.

**Verification:** Root lint, typecheck and `git diff --check` passed. The full
`pnpm test --maxWorkers=2` run passed **687 tests across 76 files**, including
**seven new render/freshness regressions**. The problem-feature run passed 448
tests before the final in-flight regression was added. All three local audit
probes passed; original, hook-only and current raw counts are in ignored
`outputs/workspace-state-audit/{baseline,hooks-baseline,results}.json`.

A credential-free root production build and content validation passed using
`.next-preview/workspace-hooks`. Dedicated-learner production Playwright on port
3100 passed **10 checks**: sign-in, seven existing tutor/evaluation journeys and
two additional workspace journeys. The two workspace journeys were then extended
to verify Undo after responsive remounts and passed again with sign-in setup.
They exercised real CodeMirror Mod-Enter after case changes, restoring snapshot
source to clear staleness, case addition/selection, Run/Submit UI, Reset, unsaved
notes, tabs, themes, 1440px/320px containment and draft/history retention. There
were no page errors. Desktop and mobile screenshots were inspected. The existing
server on port 3000 remained running throughout.

Browser execution/saved-code reads in the additional journeys and UI AI replies
used fixtures. Sign-in and note reads used the dedicated development learner;
no notes were saved. These checks do not establish live judging/persistence or
real model output. Production typing latency and packaged Electron remain
unmeasured. The browser fixture/config and screenshots remain local ignored
artifacts under `outputs/workspace-state-audit/`.

## References

Interaction references: [TraceCode practice](https://tracecode.app/practice) and
[focused workspace](https://tracecode.app/practice/binary-search). Problem contracts:
[Counter](https://leetcode.com/problems/counter/description/),
[Debounce](https://leetcode.com/problems/debounce/), and
[Filter Elements from Array](https://leetcode.com/problems/filter-elements-from-array/).
Code Atlas owns its authored explanations and implementation. Earlier formal artifacts
under `specs/002-javascript-coding-problems/` are historical context.
