# Neon Auth migration

Outcome: replace Clerk with Neon Managed Better Auth in the existing Next.js app.
Branch: `feature/neon-auth`, including the preserved Curry and Flatten Nested
Array work carried from `codex/javascript-curry`. The user authorized committing,
pushing and merging the completed work on 2026-11-11.

First review: create a Code Atlas account through Neon Auth, sign out, sign back in, reload Dashboard,
then Run and Submit Sleep with account-backed progress.

User decision (2026-11-11): **start fresh and remove the old development app user
and progress**. This supersedes the earlier request to retain old records. Do not
link identities by email or automatically import Clerk browser backups.

Included:

- Managed Better Auth on isolated Neon branch `feature/neon-auth`
  (`br-polished-scene-bdmyupra`) of the existing `codeAtlas` project.
- Official `@neon/auth` Next.js SDK, same-origin auth Route Handler and SDK proxy.
- Shared-component email/password sign-up, sign-in, Google sign-in, sign-out,
  session restoration, verification and password reset by email code.
- Server-verified sessions on every protected page/API, existing origin and input
  validation, isolated judging and request-time Prisma access.
- Unique `User.neonUserId`, a column/index rename migration, and unchanged
  user/problem ownership. Browser keys use `neon:<userId>` to separate old backups.
- Ignored local auth/database configuration for the same isolated branch, empty
  tracked examples, updated README, development guide, UI registry and conventions.

Later: account linking, production email/OAuth/verification policy and trusted
origins, profile/deletion synchronization, advanced plugins and deployment cutover.

Acceptance:

- Public landing/health and credential-free builds remain usable.
- Signed-out or forged callers cannot read/change account data or execute code.
- Different verified Neon identities own separate progress; only an accepted
  server-judged Submit marks solved. Every Run/Submit still saves latest source.
- Sign-in/sign-up finish at Dashboard; sign-out returns home. Failures give feedback.
- Parent database branches and the hosted Clerk service/account remain untouched.

Implementation and verification (2026-11-11):

- [x] Provision Auth, configure ignored environment files and apply the migration.
  Before migration, removed the single legacy app User on the new development
  branch with user approval; its five PracticeProgress rows were cascade-deleted.
  Confirmed zero users/progress and the renamed `neonUserId` column. No destructive
  cleanup is encoded in the migration, and no parent branch was modified.
- [x] Replace Clerk imports, provider/widgets, dependencies, environment settings,
  theme variables and optional test harness. Application progress uses verified
  Neon identity. Historical feature/spec documents and the original migration
  retain their historical provider references.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`: passed, **224 tests / 27 files**.
  Tests cover lazy SDK setup, missing/error sessions, SDK auth routing, form errors,
  email-code recovery/verification, sign-out, server ownership/origins, saved source
  and accepted-only solved status. Existing real-worker judges still pass.
- [x] Credential-free `pnpm build`: passed, including all eight problem definitions.
- [x] Production Playwright smoke: **39 passed** on isolated port 3100. The ignored
  copy changes only port references; the development app on 3000 stayed running.
- [x] Restarted `pnpm dev` on port 3000 to discard any old Prisma connection.
  Confirmed web and Prisma environment files target the same new development branch.
- [x] Configured live anonymous checks: `/api/auth/get-session` returns `200 null`;
  `/api/me` and `/api/practice-progress` return `401` even with a forged identity
  header; anonymous Submit returns `401`; Dashboard redirects to sign-in.
- [x] Browser review: sign-in, sign-up and recovery routes render shared themed
  controls. Sign-up has no document overflow at 390px; the viewport was restored.
  Screenshots: ignored `outputs/neon-auth/sign-up-{desktop,mobile}.jpg`.

Live authenticated verification remains outstanding: no dedicated Neon test
identity is configured. No account was created and no email or password reset was
sent during review. Once a new account exists, verify sign-in/reload/sign-out and
Sleep flag + Run/Submit persistence. Optional `pnpm test:e2e:auth` requires dedicated
`NEON_TEST_USER_EMAIL` and `NEON_TEST_USER_PASSWORD` on an isolated development branch.
This limitation is separate from the passing unit/integration and public smoke tests.

Reference: [Neon Next.js quick start](https://neon.com/docs/auth/quick-start/nextjs-api-only).

Auth screen refinement (2026-11-11): sign-in and sign-up omit GlobalNav, including
their nested routes. The user chose “Account not found or password is incorrect”
for Neon's shared invalid-credentials response. Handle both returned Better Auth
errors and the AuthApiError thrown by the live Neon SDK; network failures retain
the unavailable message. No account-existence query or authentication change was
introduced. A live synthetic sign-in with an unknown address displays the chosen
message; desktop browser review confirms neither auth page has global navigation.
Screenshots: `outputs/neon-auth/sign-in-error.jpg` and `sign-up-standalone.jpg`.

Email-verification configuration check (2026-11-11): the active Neon development
branch already has required verification and automatic verification emails disabled
for sign-up/sign-in. This is a hosted Auth setting; no source-file change was needed.
