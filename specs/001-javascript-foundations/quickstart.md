# Quickstart and validation: Scope and shadowing

Implementation and validation record for the one-lesson review. The content, build, test and opt-in auth scripts are now installed.

## Prerequisites

- Use the repository's Node 24 and pnpm 11.25.0 versions and existing startup instructions in README.md.
- Keep the active feature selected through `.specify/feature.json`. The current Git branch is unchanged by planning.
- Use ignored environment files for credentials. Do not paste keys, tokens, or browser auth state into this document or tests.
- Public startup, content checking, and build must remain independent of Clerk and Neon credentials. Protected lesson access requires the existing configured development Clerk instance.
- No database model, migration, API service, AI provider, editor runtime, or Electron setup is required for this lesson.

## 1. Implement the planned dependency and content changes

Follow generated tasks after this plan. Preserve the installed application baseline. The dependency pins and module ownership are in plan.md; expected data and route behavior are in contracts/ and data-model.md.

Do not publish additional lessons while making the first review slice. The real catalog must show Scope and shadowing as the only available lesson and label every other entry Coming soon. Its first/last position in the published subset means there is no valid previous or next lesson; provide All lessons instead.

## 2. Configuration-free checks

After the implementation introduces `content:check`, run from the repository root:

```sh
pnpm --filter @workspace/web content:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all content references validate; exactly the intended production lesson is published; MDX compiles; token lines preserve source; guards precede loaders; exercise outcomes and six prepared states are verified; malformed preferences fall back; and shared UI/auth tests continue to pass. No published lesson is a test fixture.

For focused checks, retain the existing Vitest project names. Add `*.node.test.ts` to the server project and exclude it from browser projects, with TSX included in the latter. Avoid running the same authored-data test in both environments.

A test-only reference check may run the fixed trusted example in a bounded Node child process to verify Inside/Outside output. It must never accept learner-supplied source or add a runtime execution path.

## 3. Credentials-pending production smoke suite

Stop the existing development stack before browser tests: Playwright owns production ports 3000 and 4000, and it must not reuse the running development servers. Preserve or restart the development stack after validation.

```sh
pnpm test:e2e
```

The existing configuration intentionally clears Clerk and database credentials. Add `/learn/javascript`, the published lesson route, and unavailable lesson addresses to setup/access tests. Expected: setup UI appears, protected content does not, and ordinary public/API smoke checks remain unchanged. These tests do not prove signed-in lesson success.

## 4. Authenticated production journey suite

The implementation adds a separate `playwright.auth.config.ts`, `tests/e2e-auth/`, and `test:e2e:auth` script. Keep it opt-in and separate from the credential-free suite.

Use the same development-instance keys for the web build, test server, and Clerk testing helper. Load the ignored web environment without logging its contents; supply `CLERK_TEST_USER_EMAIL` for a dedicated existing development learner through an ignored test environment or process variable. Reject production-instance keys and fail clearly if required test identity/configuration is absent. Do not silently mark that absence as a passing suite.

Use `http://localhost:3000` consistently for authenticated setup and tests. A serial setup project initializes Clerk testing, visits the public page, signs in the dedicated learner with the official helper, confirms protected access, and saves state under ignored `.clerk/`. No real-user cookie export, production bypass, test-only lesson route, or account creation is needed.

```sh
pnpm test:e2e:auth
```

Prove these journeys:

1. Dashboard → JavaScript → Start learning reaches Scope and shadowing within two navigation actions.
2. Catalog search/topic filtering preserves order, reports available/planned counts, and clears no-match results.
3. Direct lesson entry works; planned and unknown slugs have safe unavailable/not-found behavior.
4. Correct and incorrect prediction answers give specific explanations and permit retry.
5. All six visualization steps have correct highlight/state/output; backward and Reset are deterministic and bounded.
6. Pointer and keyboard adjustment of both visible width dividers and the center height divider respects minimums.
7. Hiding tutor preserves lesson width within 2px measurement tolerance and gives released width to center; reopening restores a usable width.
8. Answer, feedback, and selected step survive tool/tab/theme changes, layout reset, and 1440 → 390 → 1440 transitions.
9. Saved dimensions survive reload, tutor starts closed, and corrupted/denied browser storage still produces a readable workspace.
10. Curriculum and tutor drawers are keyboard accessible, mutually modal on compact screens, close with Escape, and restore focus.

Until a dedicated identity is configured and the suite actually runs, report authenticated automation as unverified. Unit guard mocks are not a substitute for it.

## 5. Manual review in the existing signed-in browser

Run the development stack again:

```sh
pnpm dev
```

Review the real landing and lesson using the user's existing signed-in development session. Do not extract or reuse that session as automated test state.

Compare with Paper's JavaScript page and learning-layout v0.4. Expect deliberate content differences: only Scope is available, counts reflect one available/six planned, the real scenario derives Step 1 of 6, invalid previous/next destinations are omitted, and the unused central Practice tab is omitted rather than duplicating the left checkpoint. These differences follow the user's one-lesson scope and semantic accuracy; they do not change the panel design.

Check 320, 390, 768, 1024, 1280, and 1440px widths, 200% browser zoom, a short viewport, both themes, and reduced motion. Confirm no document-level horizontal overflow, no clipped essential controls, and local code scrolling only where needed. Inspect focus order, copy feedback, resizer focus rings, drawer focus containment, and reading position through layout changes.

Save a browser screenshot and record what actually passed. Do not present the Paper export as proof of implementation.

## 6. Dependency/bundle and final scope review

```sh
pnpm analyze
```

Inspect the existing analyzer outputs. The client must not include Shiki grammar/highlighter code, MDX loaders/importers, filesystem modules, a full editor, or a code execution engine. Shared splitter and activity controls are expected client dependencies. Never infer bundle contents solely from source import spelling.

Finish only this one complete lesson for review. Record checks that require missing infrastructure or test identity separately from passed checks. Additional authored lessons, synced progress, saved notes, connected AI, arbitrary-code execution, a visual authoring editor, deployment, and Electron packaging remain later work.

## Recorded implementation checks — 2026-11-09

- Content check: PASS, exactly one available lesson / six planned, all authored references valid. Scope snapshot validation lives in the JavaScript feature and is registered with the generic checker. The pure body-ID list type-checks the server MDX importer map.
- Biome lint: PASS. Root typecheck and final Next compilation: PASS.
- Vitest: PASS, 68 tests across 16 files. Includes guard ordering, highlight fidelity, catalog intersection/counts, canonical reference output, scope/TDZ semantics, feedback/retry, local activity failure, fixture reuse, safe storage and scroll-aware sizing.
- Production build: PASS with Clerk and database variables explicitly blank. Both Turbopack and analyzer/webpack compilation were exercised.
- Production smoke: PASS, 13 tests. The four learning-route checks prove setup behavior without exposing protected content; they do not prove authenticated execution.
- Authenticated Playwright: NOT RUN. The prerequisite check correctly rejected missing `CLERK_TEST_USER_EMAIL`; the user explicitly chose to leave this automation unverified. The configured suite uses only a dedicated development learner and ignored auth state.
- Signed-in browser: landing and Scope lesson reviewed in the existing development session. Both pages showed no horizontal document overflow at 320, 390, 768, 1024, 1280 and 1440px. Answer and Step 3 remained intact through every width and Reset layout. Source copy announced success. Light and dark themes were reviewed. All three splitters moved using pointer and keyboard; hiding tutor preserved lesson width from 300.1875px to 300px, and reload restored 300px with tutor closed.
- Browser testing found and fixed height inflation after a scrolled mobile-to-desktop transition. The corrected host fills the remaining viewport (bottom 900px at 1440×900), resets stale outer scroll, and contains document scrolling only in split modes. Returning to catalog restores ordinary page scrolling. Pure and DOM regressions cover this case.
- Remaining browser verification limits: the in-app browser does not expose actual browser zoom or media emulation. A 720×450 capacity check represents the layout capacity of a 1440×900 display at 200%, but is not evidence of actual browser zoom. Actual 200% zoom and reduced-motion emulation remain unverified; Sheet has explicit reduced-motion fallbacks, and the opt-in suite includes reduced-motion/viewport checks. This is a validation limit, not an enabled editor, AI, or persistence capability.

Review artifacts are in `outputs/001-javascript-foundations/`. Browser screenshots there are actual application captures, separate from the earlier Paper design exports.

- Bundle analysis: PASS. Parsed 868 client analyzer labels; no Shiki/@shikijs, MDX loader, published lesson MDX module, server registry/highlighter, Node filesystem, Oniguruma, Monaco or CodeMirror module matched. The expected shared resizable runtime is present. Saved analyzer reports and machine-readable checks under `outputs/001-javascript-foundations/`.

- The capacity-equivalent 720×450 browser review also passed: readable flow, no horizontal overflow, selected Outside answer and Step 3 retained. This remains distinct from actual browser-zoom verification. Desktop/mobile screenshots for landing and lesson were saved. The development stack was restored on web 3000 and API 4000.

Final convergence: T036/T037 architecture findings are resolved. The sole remaining finding is partial browser verification, tracked by T038; T032/T035 remain open. No remaining application-code gap was found. Counts checked: 32 requirements, 23 acceptance scenarios, 10 plan decisions, seven constitution principles. No extension hooks configured.
