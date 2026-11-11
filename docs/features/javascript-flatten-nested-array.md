# Flatten Nested Array practice

Outcome: add one complete Medium **Flatten Nested Array** problem at
`/javascript/practice/flatten-nested-array`, in Recommended and Arrays.
First review: edit a nested JSON array, Run a solution, then Submit the full suite.

Contract: `flatten(arr)` returns a new, fully flattened array of integers in their
original order, preserving duplicates and zero. Empty arrays contribute no values.
The input must remain structurally unchanged. Implement the traversal without
`Array.prototype.flat` or `flatMap`; both methods are disabled in this exercise.
Only dense JSON arrays of integer leaves are supported: at most 20 array levels
including the outer array, 1000 total array/number nodes, and integers from -1e9
to 1e9. Later: depth-limited flattening, sparse arrays and arbitrary value types.

Included: typed public definition, trusted MDX, examples, hints, solution, one
editable JSON array field, isolated judging, and existing account progress and
latest executed code behavior. No layout, dependency or database changes.

Isolation: reuse QuickJS in the disposable Node worker and existing memory, stack,
CPU and watchdog limits. Parse input with captured intrinsics inside the timed
guest. Inspect learner arrays, proxies and getters entirely inside that entry;
copy only bounded primitive numbers into a null-prototype result. Validate input
iteratively with explicit depth/node budgets. Hidden suites and diagnostics stay
server-only. Submit ignores client-selected cases.

Acceptance:

- Recommended and Arrays list the same problem; search and Medium filtering work.
- Run uses the current source and edited array. Invalid JSON, unsupported values,
  excessive nesting/nodes, and extra input keys are rejected before execution.
- Submit accepts a general traversal and rejects one-level flattening, reordered
  or deduplicated values, input mutation, built-in shortcuts and endless execution.
- Empty input returns `[]`; negatives, zero, duplicates and maximum bounds work.
- Only an accepted Submit records solved; latest Run/Submit code uses the existing
  verified-user persistence boundary. Personal account progress stays untouched.
- The credential-free build and existing Curry and other problems continue to work.

Implementation:

- [x] Add definition, catalog/statement entries and editable nested-array input.
- [x] Add bounded judge, private cases, contract/UI/HTTP regression checks.
- [x] Run repository checks, production smoke tests and desktop/mobile review.

Verification (2026-11-11):

- `pnpm lint`, `pnpm typecheck`, `pnpm test`: passed; 207 tests across 23 files.
  The real-worker suite verifies the 20-level/1000-node boundary, empty arrays,
  duplicates, zero, negatives, order, input preservation, new-array results,
  disabled built-ins, fake/sparse output, hostile proxies/getters, recovery,
  private diagnostics and bounded invalid/cyclic inputs. Curry regressions pass.
- A component test edits nested JSON, rejects unsupported values before fetch,
  sends the current input to Run and renders the actual numeric array.
- A real Next execution-handler test uses Clerk-identity and persistence fixtures:
  edited Run passes, all 11 server-selected Submit cases pass, invalid client cases
  cannot choose the Submit suite, and both accepted and failed source/verdicts go
  to the verified owner's saving boundary. No real account was written.
- Credential-free `pnpm build`: passed, including eight-problem content validation.
- `pnpm test:e2e --config work/flatten.playwright.config.ts`: 35 production smoke
  tests passed on isolated port 3100. The ignored test copy changes only the port
  from the root suite; the running development server on 3000 was preserved.
- Signed-in development browser: Arrays lists two problems; Medium plus "nested"
  search isolates Flatten Nested Array. The workspace loads its starter editor,
  examples and editable `arr`. Unsupported `[null]` shows local validation without
  executing or saving. At 390px there is no document overflow; the edited array
  survives mobile/desktop transitions. Review screenshots are in ignored
  `outputs/flatten-nested-array/`.

Authenticated Playwright and live-account Run/Submit persistence remain unverified
without a dedicated Clerk test identity. Manual review left the problem unflagged
and unsolved and did not save code to the personal account. No credentials,
dependencies or migrations changed in this problem feature. The work was carried
with Curry into `feature/neon-auth` for the user-authorized integration on
2026-11-11. Current auth verification is recorded in [Neon Auth](neon-auth.md).
