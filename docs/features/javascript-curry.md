# JavaScript Curry practice

Outcome: add one complete Medium **Curry** problem at `/javascript/practice/curry`,
in Recommended and Closures. First review: select a callback, edit argument groups,
Run the current source, then Submit against the complete server-owned suite.

Contract: `curry(fn)` returns a function that collects positional arguments across
calls. Until it has at least `fn.length` arguments, return another function without
invoking `fn`. At that point invoke `fn` exactly once, forwarding all collected
arguments in order, and return its result. Empty calls preserve partial state;
zero-arity callbacks execute on the first call. Partial functions are reusable.

Included: trusted MDX, examples, constraints, hints and solution; supplied numeric
callbacks with fixed arities 0–4; editable JSON argument groups; numeric results,
including zero; isolated judging; existing account flags, solved status and latest
Run/Submit source persistence. Later: placeholders, `this` binding, default/rest
parameter inference, async callbacks, and learner-authored callback code.

Isolation: reuse QuickJS inside the disposable Node worker, with the existing
100 ms entry / 250 ms cumulative CPU budget, 16 MiB guest memory, 256 KiB stack
and 10 s worker watchdog. Capture judge intrinsics before learner code. All calls
to learner functions and inspection of their results stay in the timed guest.
Inputs allow 1–10 groups, at most 12 integer arguments total, each from -1000 to
1000. The final group must first reach the selected callback's arity. Hidden cases
also check independent closures and reusable partials; their diagnostics stay private.

Acceptance:

- Curry appears in Recommended and Closures; search and Medium filtering work.
- Run evaluates the selected callback and edited groups; malformed or incomplete
  sequences produce validation feedback before execution.
- Submit uses the full suite regardless of client cases. Wrong grouping, early or
  repeated calls, argument reordering, shared state, and endless execution fail.
- Numeric zero renders as `0` for both expected and actual output.
- Existing APIs save latest executed code; only an accepted Submit marks solved.
- No personal account data is changed to stage review. Credential-free builds work.

Implementation:

- [x] Add public definition, catalog entry, statement and editable inputs.
- [x] Add bounded curry adapter, private suite and meaningful regression tests.
- [x] Run lint, type checks, tests, credential-free build and browser review.

Verification (2026-11-11):

- `pnpm lint`, `pnpm typecheck`, `pnpm test`: passed; 180 tests across 22 files.
  The new real-worker cases cover mixed/empty groups, zero arity and numeric zero,
  extra arguments, reusable partials, separate callbacks, malformed inputs,
  exceptions, infinite proxy calls, prototype pollution, recovery and redaction.
  A UI regression verifies that both expected and actual zero are rendered.
- The real Next execution-handler test uses verified-identity and persistence
  fixtures, runs edited cases, accepts all 11 Submit cases, ignores forged client
  cases/ownership, and passes the actual verdict and source to saving. A failed
  Submit passes its failed verdict to saving too. No live account was written.
- Credential-free `pnpm build`: passed, including the seven-problem content check.
- `pnpm test:e2e --config work/curry.playwright.config.ts`: 34 production smoke
  tests passed on isolated port 3100; development port 3000 stayed available.
  The ignored test copy changes only the port from the root suite.
- Signed-in development browser: Recommended and Closures list Curry; Medium
  filtering isolates it within Closures. The starter editor, callback selector,
  zero-arity help and editable JSON groups render correctly. Invalid JSON shows
  local validation without executing or saving. At 390px there is no document
  overflow; the selected callback and groups survive responsive changes.

Authenticated Playwright and live-account Run/Submit persistence remain unverified;
no dedicated Clerk test identity was supplied. Browser review left Curry unflagged
and unsolved and did not save source to the personal account. No database migration,
credentials or dependencies changed in this problem feature. The work was carried
from `codex/javascript-curry` into `feature/neon-auth` for the user-authorized
integration on 2026-11-11. Current auth verification is recorded in [Neon Auth](neon-auth.md).
