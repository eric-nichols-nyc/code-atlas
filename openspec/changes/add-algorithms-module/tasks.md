# Tasks

## 1. Feature brief and shared subject inputs

- [x] 1.1 Create `docs/features/algorithms.md` with the first review journey, included/deferred scope, observable acceptance checks, implementation checklist, and pending verification; confirm it matches both capability specs and preserve the existing unrelated working-tree changes.
- [x] 1.2 Parameterize the existing Learn/Practice catalog renderers and category/link helpers with subject titles, topics, and base paths; add component/helper coverage proving Algorithms receives its own labels and links while existing JavaScript filters, counts, and empty states remain correct.
- [x] 1.3 Supply subject-correct preview/workspace return paths and generalize SiteNav's supported-subject detection and focused-workspace hiding; verify desktop/mobile links, active states, accessible names, pending feedback, and Back destinations for both subjects, then document the shared subject pattern in `ui-registry.md`.

## 2. Algorithms learning slice

- [x] 2.1 Re-read the current JavaScript Two Pointers preview and copy its coherent referenced content into `content/algorithms/learn`, including catalog, overview loader, prose, diagrams, links, example, walkthrough, and any already integrated authored interaction; verify initial content/behavior parity, the distinct module ID, and absence of bottom outlines, and record the copied source in the feature brief.
- [x] 2.2 Add authenticated Algorithms Learn catalog and preview routes with metadata and subject-correct loading/error/not-found recovery; add route access and component tests for setup, signed-out access, direct preview navigation, filters, and unknown/unpublished modules.
- [x] 2.3 Extend learning content validation to cover both subjects' modules and copied interaction references with the appropriate identity scope; verify valid copies pass and duplicate IDs, missing overviews, invalid topics, or broken source references fail, then update the brief's learning checklist.

## 3. Valid Anagram contract, editor inputs, and judging

- [x] 3.1 Add/export `algorithms.valid-anagram` in `packages/problems`, including the Two Pointers topic, `valid-anagram` kind, string-pair inputs, boolean outputs, starter code, samples, hints, and sort-plus-two-pointer solution; verify validation/formatting tests cover exact object shape, lowercase strings, empty values, 1000-character limits, multiplicities, and the documented complexity.
- [x] 3.2 Add exact string draft round-tripping and labeled `s`/`t` testcase fields using existing UI controls; verify empty strings remain valid, unsupported input is rejected without trimming, stale-result behavior works, and both `true` and `false` display as values; document the new input pattern in `ui-registry.md`.
- [x] 3.3 Implement the Valid Anagram QuickJS adapter and compiled worker dispatch using strict primitive booleans and an independent expected-value oracle; verify both correct sorting and frequency solutions pass while malformed source, throws, wrong answers, non-boolean/hostile outputs, and nontermination produce bounded failures under existing limits.
- [x] 3.4 Register a server-only private suite covering repeated characters, unequal lengths, empty inputs, permutations, and length boundaries; verify Submit ignores edited client cases/expectations, rejects public-example shortcuts, redacts hidden values/logs, and only accepted Submit can mark solved; record the runner contract in the feature brief.

## 4. Complete Algorithms practice and existing account tools

- [x] 4.1 Add Algorithms practice catalog/statement loaders and authenticated catalog/workspace routes with appropriate metadata and recovery boundaries; verify Recommended/Two Pointers filtering, direct workspace loading, and not-found behavior for unknown, unpublished, or foreign-subject problem slugs in both subjects.
- [x] 4.2 Generalize the tutor's trusted publication registry and statement loading for supported subjects, include Algorithms statements in production tracing, and adjust subject wording as needed; verify context includes the Algorithms public statement/current source, excludes solutions/hidden suites/notes, rejects unregistered IDs, and retains provider-unavailable feedback without requiring a live provider call.
- [x] 4.3 Verify existing progress, saved-code, and notes endpoints accept the stable Algorithms problem ID under their current identity checks; add focused coverage for account/problem isolation, saved-code restoration, successful flags/solved status, notes restoration, and honest persistence failures without schema or credential changes.
- [x] 4.4 Extend practice content validation to compare per-subject catalogs and their union against public definitions, validate string/boolean samples and subject membership, and reject missing statements or duplicate global IDs; verify focused validator tests and `pnpm --filter @workspace/web content:check` pass for JavaScript and Algorithms together.
- [x] 4.5 Enable Explore Algorithms, add `/algorithms` route/config redirects to Practice, and update delivered-availability copy in README and the constitution without changing their security principles; verify dashboard availability, React's existing state, redirect status, correct subject section links, and credential-free setup smoke coverage.

## 5. Integrated verification and browser review

- [x] 5.1 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and a production `pnpm build` with auth/database runtime values unavailable; verify all changed-subject checks pass and record exact results or unresolved blockers in the feature brief.
- [x] 5.2 Add/run production Playwright journeys for dashboard → Algorithms, Learn → copied preview → Practice, and Valid Anagram edited Run → incorrect Submit → accepted Submit → restored code/progress/notes; include existing JavaScript regression, denied-access, foreign-slug, and missing-configuration checks, using a completed build, dedicated development learner, and an available configured port while preserving the user's server/work.
- [x] 5.3 Review the working Algorithms catalog, copied lesson, and problem workspace directly in the browser at desktop and 320px with keyboard navigation, reduced motion, and Light/Dark/Dark purple/System; verify source/input/tool-state preservation, accurate booleans, correct return links, and contained overflow, then record screenshots, actual checks, any credential/infrastructure limitations, and the absence of a packaged Electron verification claim in the feature brief.
