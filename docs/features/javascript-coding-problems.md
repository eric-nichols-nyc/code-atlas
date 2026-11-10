# JavaScript practice

**Outcome:** Solve JavaScript problems with editable code, real Run/Submit results,
and a consistent practice workspace. Published problems: Counter, Filter Elements
from Array, Debounce, and Sleep.

## Scope

- `/javascript` opens `/javascript/practice`. Recommended includes all four problems;
  populated categories are Closures, Arrays, and Async. Search and difficulty filters
  intersect with the selected category. Clearing filters preserves that category.
- The compact table shows a flag beside each title, difficulty, topic, and solved status.
  Easy/Medium/Hard use green/amber/red; category icons have distinct theme colors.
  On narrow screens, topic metadata groups with difficulty without page overflow.
- Dashboard sits beside Code Atlas with a grid icon. Learn/Practice have book/code
  icons, centered navigation, and text-only hover states. `/javascript/learn` remains
  an explicit coming-soon page. Legacy learning URLs redirect to Practice.
- Problem routes use Back to Practice and AI/Notes icon toggles instead of the global
  header. A continuous description contains examples, constraints, independent hint
  accordions, and Solution last. No visualization or Submissions view is included.
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

## References

Interaction references: [TraceCode practice](https://tracecode.app/practice) and
[focused workspace](https://tracecode.app/practice/binary-search). Problem contracts:
[Counter](https://leetcode.com/problems/counter/description/),
[Debounce](https://leetcode.com/problems/debounce/), and
[Filter Elements from Array](https://leetcode.com/problems/filter-elements-from-array/).
Code Atlas owns its authored explanations and implementation. Earlier formal artifacts
under `specs/002-javascript-coding-problems/` are historical context.
