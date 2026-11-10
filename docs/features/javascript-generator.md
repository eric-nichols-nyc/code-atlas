# JavaScript generator practice

Outcome: add one complete Easy **Fibonacci Generator** problem at
`/javascript/practice/fibonacci-generator`, recommended and in a Generators category.
First review: write a generator, Run an edited count, then Submit the full suite.

Included: trusted MDX description, examples, constraints, hints and solution;
editable count; real isolated iterator judging; existing flags, solved status and
latest Run/Submit source persistence. Later: more generator problems, async generators.

Contract: `function* fibonacciGenerator()` yields `0, 1, 1, 2, 3, …` indefinitely.
The harness requests the first `count` values (integer 0–50); it never exhausts an
infinite iterator. Each returned synchronous iterator must be iterable, yield finite
numbers with `done: false`, and keep state independent of other instances. Zero
requests produce `[]`. No learner-controlled serialization is used for results.

Isolation: extend the existing QuickJS guest inside the disposable Node worker;
no new host capabilities or dependencies. Iterator creation, protocol access and
advancement run under the existing 100 ms entry / 250 ms cumulative CPU limits,
16 MiB guest memory, 256 KiB stack, 10 s worker watchdog, and bounded logs. Each
case advances two interleaved iterators at most 50 times each. Hidden cases and
diagnostics remain server-only. Submit ignores client cases.

Acceptance:

- Recommended and Generators open the same published problem; search/filter work.
- Correct zero-, one- and long-prefix Runs pass; incorrect numbers, early completion,
  non-iterators, shared state, thrown errors and endless advancement fail honestly.
- A correct Submit passes the complete private suite with hidden values redacted.
- Existing authenticated APIs own saving; only accepted Submit marks solved.
- Credential-free builds and existing problems continue to work.

Implementation:

- [x] Add typed definition, content, category and editable input.
- [x] Add bounded generator adapter, private cases and regression tests.
- [x] Run repository checks, production build and browser review.

Verification (2026-11-10):

- `pnpm lint`, `pnpm typecheck`, `pnpm test`: passed; 134 tests across 19 files.
  Covers protocol errors, invalid counts, long prefixes, independent state,
  exceptions, endless next/getter execution, recovery and hidden-data redaction.
  The authenticated Route Handler test verifies the actual verdict reaches saving.
- `pnpm build`: passed both with local configuration and with Clerk/database
  environment values explicitly empty; content validation lists all five problems.
- `pnpm test:e2e --config work/javascript-generator.playwright.config.ts`:
  29 production smoke tests passed on isolated port 3100, keeping development port
  3000 available. The ignored test copy changes only the port from the root suite.
- Manual signed-in production browser: Recommended → Generators → problem;
  starter fails honestly; edited count 12 passes 3/3 Run cases; Submit passes 9/9;
  latest source restores from the account after reload. Hints/solution work;
  count 51 reports validation feedback; 390px viewport has no page overflow.
- Restarted the stale development server; the usual localhost:3000 catalog now
  shows the problem, and an actual Submit passes 9/9 there too. Existing problem
  records were retained. No migrations, credentials or dependencies changed.

The optional authenticated Playwright journey was added but remains unverified:
no dedicated Clerk test identity was supplied. Manual signed-in review is separate
from the passing credential-free browser suite. Work is uncommitted on
`codex/javascript-generator`.
