# Database users and practice progress

**Outcome:** Link authenticated Clerk learners to Neon records and restore their flags,
verified solved status, and latest executed source across browser sessions/devices.
**First review:** flag Sleep, reload, reopen saved code after Run, then Submit an accepted
solution and see its account-backed solved indicator. Existing UI/layout stays consistent.

## Scope and ownership

- Reuse Prisma 7/Neon in `packages/db`. `User` has a unique Clerk ID and timestamps;
  `PracticeProgress` has a unique user/problem pair, flag, verified solved timestamp,
  latest code/code timestamp, and a separate unverified legacy-completion field.
- Clerk remains identity authority. Lazily create/load User from the server-verified
  Clerk ID; never accept an owner or a solved verdict from the browser.
- API `/v1/practice-progress` owns account reads/flag writes/legacy import. Execution
  routes save code for Run/Submit and set solved only after a server-judged accepted
  Submit. Web uses authenticated same-origin adapters; Prisma stays out of clients.
- Last code means the latest Run/Submit request (including wrong/error verdicts), not
  autosaved keystrokes or submission history. Restore once, only before edits/execution;
  a slow read must never replace current typing. Flag writes cannot overwrite code.
- Import browser flags idempotently without overwriting existing account flags. Keep
  original local records. Browser-only solved entries become unverified legacy history,
  never verified solved status. Re-submitting Accepted verifies completion.
- Database failures leave judging usable and show an explicit unsaved/error status;
  keep current source and browser backup. Retry reads/flags/import without claiming
  successful account persistence. Same-problem code writes use request timestamps to
  prevent slower earlier runs from overwriting newer runs. No credentials at build time.

**Later:** individual submission history, autosave while typing, notes, analytics,
profile/deletion webhooks, and Electron. Latest Run/Submit code is included.
Content and hidden suites stay in files.

## Acceptance and checklist

- [x] Preserve existing work; create `feature/database-users` and an isolated Neon branch.
- [x] Add reviewed migration/models, generate client, and configure ignored local env files.
- [x] Implement owned APIs, import, latest-source persistence, and accepted-Submit recording.
- [x] Restore account state/code with loading, failure/retry, and legacy-history semantics.
- [x] Verify reload persistence, wrong-answer source saving, and monotonic solved status.
- [x] Verify another learner cannot read/write these records or forge solved status.
- [x] Run relevant tests, lint, typecheck, credential-free build, and signed-in browser review.

## Verification

- Migration `20261110031808_database_users` applied to Neon branch `feature/database-users`
  (`br-empty-thunder-bd7csebv`); generated Prisma Client. Local ignored environments point there.
  The original production branch still has no application tables.
- Root lint/typecheck, **124 tests in 20 files**, and a credential-free production build passed.
  Root test scripts now build both shared database and problem packages on fresh checkouts.
- **26 credential-free production Playwright checks passed** on isolated ports 3100/4100;
  development ports 3000/4000 remained running. No authenticated automation was run.
- Live Neon/Prisma checks passed for separate owners, idempotent import, wrong/error source,
  out-of-order/concurrent first writes, and monotonic solved state; temporary test users were removed.
- Signed-in manual Sleep review passed: flag/reload, Wrong Answer with saved source, code restore
  after reload/reopening, Accepted Submit 10/10, and account solved indicator. Independent SQL
  confirmed all three persisted fields. Catalog/workspace had no page overflow at 320px; viewport
  was restored. Proof: `outputs/database-users/sleep-saved.png` and `sleep-mobile.png`.
- Separate physical-device and second real Clerk-account journeys remain unverified; owner
  isolation is covered by API/database tests. Authenticated automation remains user-deferred.

The implementation preserves the earlier practice changes; an ignored local baseline backup
is in `work/database-users-baseline/`. The migration was applied only to the isolated Neon
feature branch; publishing the code does not migrate production.
