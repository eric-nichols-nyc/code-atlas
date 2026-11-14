# Algorithms

**Outcome:** Enter Algorithms from Dashboard, read the copied Two Pointers lesson,
then solve Valid Anagram with real Run/Submit and the existing account tools.

**Included:** Algorithms Learn/Practice routes, subject-aware shared catalogs and
navigation, one copied lesson, one Easy JavaScript problem, editable string cases,
private judging, flags, solved status, saved executed code, notes, and tutor context.
The lesson copy includes its existing walkthrough and pointer visualization from
`content/javascript/learn/two-pointers`; it keeps the preview label and no bottom
outline section. Content is owned independently by Algorithms after copying.

**Later:** More lessons/problems, other languages, lesson completion, new lesson
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
