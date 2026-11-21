# Algorithms

## Move Zeroes and Max Consecutive Ones

Add two Easy JavaScript exercises from Code Drill to Algorithms Practice. Reuse the
existing workspace, editable JSON testcase input, verified account progress, and
isolated Run/Submit flow. Publish original prose, hints, and worked solutions.

- **Move Zeroes** (Two Pointers) takes 1–10,000 signed 32-bit integers. For
  `[0,1,0,3,12]`, the original array must become `[1,3,12,0,0]`. Accept returning
  that same array (as in Code Drill) or returning nothing. The judge can verify
  mutation and ordering. Constant extra space is a learning objective.
- **Max Consecutive Ones** (Sliding Window) takes 1–100,000 numeric bits.
  `[1,1,0,1,1,1]` returns `3`. The guest must return an integer number.
- Both use the existing disposable QuickJS worker and its 16 MiB heap, 256 KiB
  stack, and 100 ms guest entry / 250 ms cumulative budgets. Move Zeroes exports
  only a bounded integer snapshot. Private cases use the existing redaction path.
  Allow up to five maximum-size cases through the authenticated Run endpoint for
  these two exercises while keeping its existing source limit.
- Verify catalog navigation, edited and invalid input, accepted Run and Submit,
  rejected shortcuts, maximum inputs, private-case redaction, and browser layout.
  Other languages and guided lessons are outside this slice.

References: [Move Zeroes](https://code-drill-app.vercel.app/problems/move-zeroes-dev-1778782578258)
and [Max Consecutive Ones](https://code-drill-app.vercel.app/problems/max-consecutive-ones-1779063679639).

**Verification.** Lint, typecheck, all 715 Vitest tests, and a credential-free
production build passed. The content check registered 19 practice problems.
Both signed-in Playwright journeys passed with a dedicated development learner
and the live judge. They covered topic navigation, invalid and edited testcases,
Run output, private Submit, and a 320 px layout. Direct browser review confirmed
both links in the Algorithms Practice preview.

### Original Algorithms rollout

**Outcome:** Enter Algorithms from Dashboard, read the copied Two Pointers lesson,
then solve Valid Anagram, Most Frequent Character, or Longest Substring with At Most
Two Distinct Characters with real Run/Submit and the existing account tools.

**Included:** Algorithms Learn/Practice routes, subject-aware shared catalogs and
navigation, one copied lesson, Easy and Medium JavaScript problems, editable string cases,
private judging, flags, solved status, saved executed code, notes, and tutor context.
The lesson copy includes its existing walkthrough and pointer visualization from
`content/javascript/learn/two-pointers`; it keeps the preview label and no bottom
outline section. Content is owned independently by Algorithms after copying.

**Later:** More lessons/problems beyond these three, other languages, lesson completion, new lesson
interactions, database redesign, offline support, and Electron packaging changes.

**Acceptance:** Dashboard → Algorithms Practice → Learn → Two Pointers stays within
Algorithms. Valid Anagram accepts `isAnagram(s, t)` for lowercase ASCII strings of
0–1000 characters, including empty strings, and returns strict booleans. The
reference sorts copies and advances two forward pointers: O(n log n) time and O(n)
space. Other correct algorithms are accepted. Run uses current source/edited cases;
Submit uses private server cases and alone can mark solved. Account writes belong
to the verified learner and stable `algorithms.valid-anagram` ID. Failures do not
claim successful persistence. JavaScript journeys and existing work remain intact.

**Implementation checklist:**

- [x] Shared subject inputs, navigation, and route boundaries.
- [x] Copy lesson and validate its content and authored interactions.
- [x] Problem contracts, string fields, isolated worker adapter/private suite.
- [x] Existing account/tutor integration and multi-subject content checks.
- [x] Repository checks, production journeys, and direct browser review.

**Verification — 2026-11-14:**

- `pnpm lint`, `pnpm typecheck`, and content validation passed. Credential-free
  root `pnpm build` passed with auth URL/cookie secret/database URL empty.
- `pnpm test --maxWorkers=2`: 61 files / 541 tests passed. An initial unconstrained
  run had two timing-sensitive failures in existing Memoize judging and tutor
  stream tests (539/541 passed). Both passed in the complete bounded-concurrency
  rerun. No unrelated implementation was changed for these failures.
- The first overlapping typecheck/test commands collided during Prisma client
  generation; sequential reruns passed. Generated client and schema are unchanged.
- Credential-free production Playwright: 61/61 passed, including Algorithms setup
  boundaries and redirect status. Ignored configs/test copies in
  `outputs/algorithms-verification/` use port 3001 to preserve the server on 3000.
- Final authenticated Algorithms production suite: 4/4 passed. It covers discovery,
  copied lesson/visualization controls, filters/themes, empty-string Run, rejected
  shortcut Submit, accepted 15-case Submit, saved-code restoration, flags, notes
  save/reload, subject membership, anonymous denial, and responsive draft preservation.
  An earlier run also passed all 15 existing JavaScript learning/practice/notes
  regression journeys and dedicated-learner sign-in setup.
- New browser assertions were corrected for initially null progress and the existing
  saved-code footer text, then scoped to the committed problem region and settled
  responsive layout. One setup retry reproduced the previously recorded sign-in
  hydration race (two Password inputs); final targeted checks reused the dedicated
  development session established by the successful setup, with `--no-deps`.
- Direct screenshot review covered desktop and 320px, Light/Dark/Dark purple/System,
  keyboard input and stepping, reduced motion, preserved source/testcase drafts,
  readable fields, and contained code overflow. Review caught a missing Two Pointers
  header badge; canonical topic metadata and regression coverage now fix it.
- Final screenshots: `outputs/algorithms-learn-desktop.png`,
  `outputs/algorithms-learn-mobile.png`, `outputs/algorithms-lesson-mobile.png`,
  `outputs/algorithms-workspace-desktop.png`, and
  `outputs/algorithms-workspace-dark-purple-320.png`.
- Algorithms statements are present in production API file traces. Tutor context
  and privacy were verified with the existing injected-provider tests; no live AI
  provider request was needed. Existing unrelated work and the development server
  on port 3000 were left in place.

**Limits:** No packaged Electron behavior has been verified for this change.

## Most Frequent Character — 2026-11-20

**Outcome:** Add the supplied `findMostFrequentChar(str)` exercise to Algorithms
under Hash Maps, using the existing workspace, account tools, and AI context.
Include authored prose, three public examples, hints, the supplied reference
solution, editable string input, and isolated private judging. Additional lessons,
languages and visualizations are deferred.

**Contract:** Accept strings of 0–1000 JavaScript UTF-16 code units. Count Unicode
code points with case, whitespace and punctuation preserved. Return a primitive
character string, or `""` for empty input. Preserve the supplied strict `>` tie
rule: return the character that reaches the highest final count first. Thus
`"javascript"` → `"a"`, `"abba"` → `"b"`, and `""` → `""`. Reference complexity
is O(n) time and O(k) additional space. Other correct approaches are accepted.

**Acceptance and implementation:**

- [x] Algorithms discovery and Hash Maps filtering target the new workspace
  (component check).
- [x] Run uses current code and exact edited strings, including empty text
  (component request and isolated worker checks).
- [x] Submit uses a server-owned suite, rejects incorrect ties and return types,
  and redacts private inputs, outputs, logs and diagnostics.
- [x] Existing account and AI boundaries apply without schema or provider changes;
  authored AI context is checked without provider calls.
- [x] Focused automated checks are recorded below.
- [ ] Direct browser review and live signed-in persistence.

**Verification — 2026-11-20:** The two new test files passed all 26 focused tests.
A final seven-file run passed 83 tests covering this problem, Valid Anagram,
input drafts, Algorithms discovery, content contracts, and public AI context.
`pnpm --filter @workspace/web content:check` passed for all 17 registered problems.
The problems package and web TypeScript checks passed with no emitted files;
the existing worker build passed as part of the focused root `pnpm test` command.
Primitive return validation covers boxed strings, Promises, malicious proxies,
oversized strings, runtime errors, syntax errors and timeout. The full reference
suite passes, including NUL, emoji and lone-surrogate transport cases.

**Review limit:** The in-app browser is unavailable in this side chat, so direct
browser review is unverified. No live account writes or inference were made.
Existing uncommitted feedback and sliding-window work remains intact. This addition
does not switch branches, commit, restart the running app, or run the full test suite.

**Improvement — 2026-11-20:** Add the problem currently open in
[Code Drill](https://code-drill-app.vercel.app/problems/longest-substring-at-most-two-distinct-dev-1778790856551)
to Algorithms Practice under Sliding Window. The catalog previously offered only
Valid Anagram; it now also offers the Medium substring challenge with three examples,
four hints, a solution and an independent private judge. Use the normal published
title without the source app's development-sample suffix.

Accept `lengthOfLongestSubstringTwoDistinct(s)` for 1–100000 ASCII English letters,
preserving case. Return an integer length for a contiguous window with at most two
distinct letters. Keep private cases server-only, primitive output validation in
the timed guest, existing worker budgets and verified account ownership. Only this
problem's Run request admits up to 544 KiB for five maximum-size strings and the
existing 32 KiB source cap; other request limits are unchanged. No database migration
or AI-provider change is needed. Existing Evaluate/Feedback and sample mode are reused.
Code Drill chat history, learner source/progress and a new guided lesson are excluded.

- [x] Discover the published problem through Sliding Window and search.
- [x] Edit exact strings, reject invalid inputs, Run current code and Submit private cases.
- [x] Cover singleton, repeated letters, case sensitivity, shrinking windows, maximum
  inputs, invalid outputs and hidden-case redaction with focused tests.
- [x] Review the browser journey and narrow layout; preserve existing work.

**Verification — substring improvement:** `pnpm lint`, `git diff --check` and
`CODE_ATLAS_DIST_DIR=.next-preview pnpm typecheck` passed. The focused `pnpm test`
selection for the new judge, Valid Anagram regression, execution handlers, practice
content, Algorithms catalog and workspace passed: 9 files / 102 tests. The production
build and content checks passed through the authenticated Playwright configuration.
Dedicated-learner authentication passed, followed by the new signed-in browser
journey (1/1): catalog discovery, empty-input validation, case-sensitive edited Run,
17-case Submit, verified saved/solved state and preserved source at 320px without
document overflow. An initially ambiguous badge assertion was narrowed and rerun
against the same build, without rebuilding or running the full suite. Direct browser
review confirmed the wrapped title, amber topic badge, single string field and existing
Evaluate/Feedback controls. Screenshot: `outputs/algorithms-substring/workspace.jpg`.
No live AI calls or learner-data imports were made. Existing feedback and separately
edited Most Frequent Character work was preserved. Packaged Electron was not tested.

**Combined checkout verification — 2026-11-20:** With both new Algorithms
problems and the separate Solution tab present, `pnpm lint`, `pnpm typecheck`,
and `pnpm test --maxWorkers=2` passed: **675 tests across 74 files**. A production
build passed with `CODE_ATLAS_DIST_DIR=.next-preview/all-changes`, preserving the
running app's build. Content validation passed for all 17 practice problems.
The signed-in journey results above remain their original evidence; authenticated
browser automation and packaged Electron were not rerun for this combined check.
