# Delay the resolution of each promise

Outcome: publish one original Medium Async problem at
`/javascript/practice/delay-the-resolution-of-each-promise`, also in Recommended.
First review: edit a delay and function descriptors, Run, then Submit the full suite.

Research: [MDN Promise.then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)
documents preserving fulfillment values through returned promises;
[MDN setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
documents asynchronous timer scheduling. This is an independently authored exercise,
not a reproduction of the inaccessible LeetCode Premium statement.

Contract: `delayAll(functions, ms)` returns one wrapper function per input function,
in the same order, without calling any input during construction. Each wrapper
starts its original function immediately when invoked, waits for its promise to
fulfill, then fulfills with the same number after an additional `ms` milliseconds.
Supplied functions always fulfill. The JSON test descriptors `{t, value}` represent
functions that fulfill with `value` after `t` ms; every wrapper is called once at
clock time zero. Outputs `{t, value}` are listed in input order, not completion order.

Included: examples, hints, solution, editable inputs, isolated judging, existing
authenticated saving/flags/solved integration. Later: rejection transformations,
arbitrary callback source and submission history. No schema/dependency changes.

Isolation: use the existing QuickJS Node worker and deterministic timer clock.
Limit input to 0–10 functions, integer ms/t 0–1000, integer values −1e9–1e9;
at most five Run cases. Retain 16 MiB guest memory, 256 KiB stack, 100 ms per entry,
250 ms cumulative CPU, 128 timer registrations/32 pending timers, bounded jobs/logs,
and the 10 s watchdog. Capture judge intrinsics before learner code. Inspect
untrusted arrays/callbacks/promises only inside timed guest execution; return only
bounded numeric observations. Hidden cases stay server-owned and redacted.

Acceptance:

- Async/Recommended open the same problem; malformed descriptors are rejected.
- General solutions preserve values/order, including zero delays, out-of-order
  fulfillment, empty input and ten concurrent functions.
- Eager execution, delayed starts, missing delays, wrong output, runtime errors,
  unresolved promises and endless code receive real failure verdicts.
- Submit ignores client cases; existing account boundary owns saving and solved state.
- Builds remain credential-independent; browser review must not write review data
  to the user's account.

Checklist:

- [x] Definition, MDX, catalog and input controls.
- [x] Bounded Promise adapter/private suite and relevant regression tests.
- [x] Repository checks, build and read-only browser review.

Verification (2026-11-10): `pnpm lint`, `pnpm typecheck`, `pnpm test` (157 tests,
21 files) and a production `pnpm build` with Clerk/database credentials unset passed.
Production Playwright passed 33 checks on an isolated port 3200, including the new
protected route. The real worker accepted all ten Submit cases; Route Handler
tests used verified-identity and persistence mocks, without account writes.
Browser review confirmed the published statement, starter, sample inputs, hints,
solution and Async/search entry. The new row remains unflagged and unsolved;
no Run/Submit or code-saving action was performed in the user's browser.
Authenticated end-to-end execution remains unverified without a dedicated test user.
The production trace includes the worker adapter; its judge markers are absent
from all 22 browser chunks. `git diff --check` passed.

Unrelated landing-page work preserved. No commit or push.
