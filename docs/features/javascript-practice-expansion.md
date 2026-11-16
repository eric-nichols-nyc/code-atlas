# Five more JavaScript practice problems

Outcome: expand the JavaScript catalog from eight to thirteen complete problems,
using the existing editor, editable Run cases, private Submit suites and account
progress. Branch: `feature/javascript-practice-expansion`. No commit/push unless requested.

The user requested parallel research and implementation. Research/content and two
isolated-judge workstreams run concurrently; integration stays in this branch.
First integrated review: Map Array in the Arrays category, with one complete Run
and Submit path, followed by the other four problems in the same workspace.

Included:

- **Map Array** (Easy, Arrays): callback-driven value/index transformation without `.map`.
- **Reduce Array** (Easy, Arrays): left-to-right accumulation without built-in reduction.
- **Chunk Array** (Easy, Arrays): fixed-size groups, preserving order and input contents.
- **Function Composition** (Easy, Closures): right-to-left composition and empty identity.
- **Memoize** (Medium, Closures): argument-sensitive caching, falsy values and independent instances.
- Original authored definitions/MDX informed by primary JavaScript references;
  supplied callback selectors and bounded JSON/numeric inputs reuse existing controls.
- Stable IDs, Recommended/category placement, examples, constraints, hints and solutions.
- Real isolated QuickJS execution, hidden cases, bounded outputs and honest verdicts.

Isolation: retain the disposable Node worker, 16 MiB guest memory, 256 KiB stack,
100 ms timed entries, 250 ms cumulative CPU and 10 s watchdog. Capture harness
intrinsics before source. Parse input and inspect all learner arrays, functions,
proxies/getters inside timed guest execution; only bounded primitive copies escape.
Map/Reduce/Chunk arrays have at most 1000 integer elements. Composition has at most
10 supplied functions. Memoize has at most 100 calls of at most four integer args.

Acceptance:

- All thirteen problems appear in Recommended and the correct topic; search/filter work.
- Run uses current source and edited inputs; invalid data is rejected before execution.
- Submit chooses private cases regardless of client input; wrong/broken/endless solutions fail.
- Each reference solution passes empty, boundary, zero and order-sensitive cases.
- Existing identity, ownership, saved-code and accepted-only solved behavior is reused.
- Mobile has no document overflow and inputs survive layout changes.
- Repository checks/build and production smoke pass; authenticated live writes remain
  unverified unless a dedicated test identity is available. Preserve personal records.

Later: arbitrary learner-authored callbacks, non-numeric argument values, async memoization,
placeholder composition, broader language/runtime support and submission history.

Implementation:

- [x] Research primary sources and author all five public definitions/MDX.
- [x] Add isolated judges, private suites and typed contracts/input validation.
- [x] Wire catalog, editable case controls and worker dispatch without changing auth or persistence.
- [x] Verify reference solutions, wrong answers, hostile behavior and ownership boundaries.
- [x] Run repository checks/build and public production/browser review.
- [ ] Review the authenticated catalog/workspaces in a signed-in browser.

Verification (2026-11-11):

- `pnpm lint`, `pnpm typecheck`, `pnpm test`: passed, **314 tests across 30 files**.
  All five reference solutions pass real Run and full Submit suites (3 visible +
  8 private cases each). Tests cover empty/boundary arrays, zeros, callback index/
  invocation/accumulator order, chunk shape/aliasing, reusable composition and
  per-function caches with ordered keys, distinct arities and falsy results.
- Adversarial tests cover proxies/getters, mutated prototypes, malformed source,
  exceptions, endless execution, recovery and hidden diagnostic redaction.
  Real handler tests use verified-identity/persistence fixtures to check ownership,
  saving failed and accepted source/verdicts, and ignoring client-selected Submit cases.
  No personal account or real database progress was changed during review.
- All five component journeys reject invalid JSON before fetch, send edited inputs
  and current source to Run, and render scalar zero, nested arrays and cache reports.
- Credential-free `pnpm build`: passed, including all thirteen content definitions.
- Production smoke: **44 passed** via `pnpm test:e2e --config
  work/practice-expansion/playwright.config.ts`, using an ignored copy that changes
  only port references to 3100. The development server on 3000 was preserved.
- Configured development browser: the public preview lists all thirteen canonical
  links, with the five new names/difficulties/categories. At 390px its document
  width stays within the viewport. Map Array redirects a signed-out visitor to
  sign-in. Viewport restored and the temporary review tab closed.
  Screenshots: ignored `outputs/practice-expansion/`.

Authenticated workspace browser review, its responsive control layout and live
account Run/Submit persistence remain unverified: the browser is signed out and
no dedicated Neon automation identity is configured. A sign-in request was sent
while automated checks continued. No credentials, dependencies, schema or Auth
configuration changed. Work was uncommitted/unpushed at that initial review.

Delivery update (2026-11-13): this work is included with `feature/electron-desktop`
for the user-authorized pull request and merge. The combined suite passes 320 tests;
the packaged app's test-account sign-in is verified. Authenticated Run/Submit and
cross-session account persistence for these new problems remain unverified.

Research references and adaptation rationale: [research note](javascript-practice-research.md).

## Majority Element addition — 2026-11-16

Expand JavaScript Practice from thirteen to fourteen exercises with **Majority
Element** (Easy, Arrays), requested from [AlgoMaster](https://algomaster.io/practice/dsa/majority-element?list=am-300).
It returns the value occurring strictly more than half the time, with a majority
guaranteed. The canonical source allows 50,000 values; this workspace uses
1–1000 integers from -1e9 to 1e9 to retain the existing request and runner limits.
Keep the linear-time/constant-space follow-up while accepting other correct
algorithms. Reuse existing auth, account progress, editor and Run/Submit controls.

- [x] Register the Arrays/Recommended entry and trusted MDX route with starter code,
  three examples, constraints, hints, source attribution and Boyer–Moore solution.
- [x] Add a JSON-only `nums` field; reject empty, malformed, out-of-bounds and
  majority-free custom cases before execution.
- [x] Add a private isolated judge and eleven hidden cases, returning only numeric
  output and redacting private values, logs and runtime diagnostics.
- [x] Verify real Run/Submit, alternate correct approaches, wrong answers and
  hostile code; check catalog/search and edited-input component journeys.
- [x] Run repository checks/build and browser review; record results below.

Verification (2026-11-16):

- Root lint, typecheck, `git diff --check` and credential-free production build
  passed. Content validation registers fifteen total problems across JavaScript
  and Algorithms.
- `pnpm test --maxWorkers=2`: **607 tests across 67 files passed**. New checks
  cover numeric output including zero/negative values, strict-majority input
  validation, three correct algorithms, captured intrinsics, malformed/hostile
  source, wrong answers, full server-selected Submit suites and private redaction.
  Component checks cover Arrays/search and edited `nums`/current-source requests.
- `pnpm test:e2e --workers=2`: **67 public production checks passed**, including
  the published link and the new route's authentication setup boundary.
- `pnpm test:e2e:auth --grep 'authenticate the dedicated|Majority Element'`:
  **2 checks passed** using the existing dedicated development learner. The new
  journey finds the exercise through Arrays/search, rejects a majority-free
  custom case, passes Run (3/3) and Submit (14/14), and restores saved code after
  reload. No personal account progress was edited.
- Browser review confirmed the public published link. Authenticated screenshots
  at 1440px and 390px were inspected and show no document overflow; proof is in
  ignored `test-results/learning-Majority-Element-*/majority-element-*.png`.
  Packaged Electron was not tested for this content addition.
