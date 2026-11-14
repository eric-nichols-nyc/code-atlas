# Design

## Context

See `proposal.md` for the outcome and `specs/react-learning/spec.md` for acceptance behavior. This design spans content, shared learning UI, routes, discovery, and validation, so an explicit integration design is useful.

Observed implementation:

- `content/javascript/learn` and `content/algorithms/learn` each provide typed catalog/topics, a lazy MDX overview registry, and a walkthrough registry. Both use the same `LearningCatalog`, `LearningModuleOverview`, and `CodeWalkthrough` renderers in `features/learning`.
- `LearningModule` requires a nonempty `lessonOutlines` array. The catalog displays its length; the reading page intentionally has no bottom outline section or individual-lesson routes.
- Learn route entries independently use `isAuthConfigured`, `AuthSetup`, and `requirePageLearner`. The proxy supplements these boundaries, rather than replacing page authorization.
- At initial inspection, `SiteNav` recognized only JavaScript and Algorithms and Dashboard linked to `/react/prototype` in development. During planning, concurrent sandbox work added React recognition, development-only Practice navigation, and a Dashboard link to `/react/practice`, using `isReactPilotAvailable()`. `/react` and `/react/learn` still do not exist. Integrate with the current pilot-aware code rather than restoring the earlier snapshot.
- `validate-learning-content.ts` currently shares one subject list between learning validation and judged practice validation. React needs learning validation without a fabricated practice entry.
- The checked-out branch includes the submitted-snapshot React prototype; concurrent work is promoting it to `/react/practice` and `/api/react/exercises/[exerciseId]/tutor` and removing the prototype entries. The separate `add-react-sandbox-module` change defers Learn and requires production execution gates. Its working files, task edits, and feature brief must remain untouched by this planning change.

## Goals / Non-Goals

**Goals:** Add a third consumer of the existing learning contracts, define Hooks as a React topic, and make one authored lesson reviewable through a familiar authenticated journey. Preserve the distinction between content display and sandbox execution.

**Non-Goals:** Introduce a different lesson hierarchy or renderer, tie Learn to Sandpack, extend the judged problem registry, or add account writes. The lesson has an authored code explanation, without an executing timer or a new lifecycle playback engine.

## Decisions

### 1. Map Hooks to the existing category contract

Create `content/react/learn/catalog.ts` with a `hooks` topic labeled Hooks, using an existing semantic badge variant. Publish one recommended Easy module:

| Field          | Value                                         |
| -------------- | --------------------------------------------- |
| id             | `react.learn.use-effect-lifecycle`            |
| slug           | `use-effect-lifecycle`                        |
| title          | `useEffect lifecycle`                         |
| topicId        | `hooks`                                       |
| order          | `10`                                          |
| lessonOutlines | One outline representing the requested lesson |

Pass the React title, topics, catalog, and `/react/learn` base path into the existing renderers. The user-facing lesson remains a module preview in the same sense as Two Pointers; do not claim a separate guided-lesson system exists. Keep shared Module/Difficulty/Topic/Lesson outlines columns and preview labeling. Use the existing Layers icon as a fallback for non-Recommendation categories so Hooks retains the established icon/text/count alignment; Arrays keeps its current appearance. No new theme color or shared primitive is needed.

Alternative: make Hooks the module and useEffect a nested lesson route. That would introduce a hierarchy absent from JavaScript and Algorithms, contrary to the requested pattern. A custom React catalog would duplicate filters and responsive behavior.

### 2. Author one MDX lesson and reuse the code walkthrough

Add `use-effect-lifecycle/overview.mdx` and `walkthrough.ts`, registered through React `overviews.ts` and `walkthroughs.ts`. Keep authored prose/source separate from rendering. Use plain JavaScript React source without JSX or TypeScript so the current syntax preparation needs no language expansion.

The proposed example is a small `Heartbeat({ delay })` component: an imported `useEffect` starts a browser interval that logs the current delay, returns cleanup that clears that interval, declares `[delay]`, and returns `null`. State that delay is a positive millisecond value. Six authored steps cover initial setup, dependencies, unchanged dependencies, old cleanup on delay change, new setup, and unmount cleanup. These are conceptual explanations of the same source, not a captured execution. Render them through the existing server-prepared, locally stepped walkthrough.

Surrounding prose covers external synchronization, the dependency-list variants, client execution, and the development Strict Mode check, with links to the official references. Describe commit ordering precisely without guaranteeing paint timing or presenting empty dependencies as a lifetime-once guarantee. Content references checked during planning: [useEffect reference](https://react.dev/reference/react/useEffect) and [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects).

Alternative: mount a live demo or add a prepared lifecycle visualization. Both add behavior beyond the requested catalog/lesson slice and would need their own execution or playback contract. The existing array visualization is specific to Two Pointers and is not relevant to Hooks.

### 3. Add authenticated React Learn routes and capability-aware navigation

Add `app/react/page.tsx` redirecting to `/react/learn`, plus the same redirect in `next.config.ts` to retain HTTP 307 before streaming. Add `app/react/learn/page.tsx` and `[moduleSlug]/page.tsx` with the established setup/session checks, React metadata, subject-scoped catalog lookup, and lazy overview loading. Reuse loading, error/retry, and unavailable-module patterns with React wording and return paths.

Enable the Dashboard React card in all environments, linking to `/react`; update its subject-availability copy. Recognize React in SiteNav independently of the practice pilot flag. Always include React Learn; retain the current Practice destination in development only when `isReactPilotAvailable()` enables the integrated pilot. Production React navigation has only Learn. Preserve both sections for JavaScript and Algorithms, plus the pilot's existing focused-workspace navigation rule. React Learn pages retain GlobalNav. No execution gate is relaxed.

Alternative: reuse the development Dashboard link or wait for sandbox practice. That would leave the requested learning catalog undiscoverable in production and couple read-only content to an unrelated execution pilot.

### 4. Validate learning subjects separately from judged practice subjects

Extend `apps/web/scripts/validate-learning-content.ts` with a learning-subject registry for JavaScript, Algorithms, and React. Run existing metadata/overview/walkthrough validation for each. Keep the judged-practice validation input restricted to its current JavaScript and Algorithms catalogs so its union still matches `publicProblems`. Preserve existing array-visualization validation for the subjects that supply it; React supplies no array visualizations.

Add focused coverage of the React content contract, missing overview and invalid source-reference failures, Hooks filtering/counts, direct page authorization, subject destinations, and navigation availability. Reuse existing walkthrough interaction coverage with a React integration check rather than copying every generic test. Add React browser journeys under `tests/e2e-auth` plus setup/unavailable assertions in the credential-free smoke suite.

Alternative: give React an empty/fake judged catalog in the current combined structure. Separate validation inputs express the real distinction without creating a new publication or progress contract for React.

### 5. Resolve the existing React Learn deferral narrowly

The earlier sandbox proposal's “React Learn unavailable” assumption is superseded by this user's request for React learning. Record that decision in the new feature brief and delivered documentation when implementing. Do not mark tasks in the sandbox change complete or weaken its development guards. Verify production denial for the integrated `/react/practice` pages and `/api/react/exercises/[exerciseId]/tutor`, and the removed `/react/prototype` and `/api/react-prototype/tutor` paths, while new Learn pages are available after authentication. Applying this learning change does not require completing the practice proposal.

## Risks / Trade-offs

- Shared navigation assumes every subject has Practice → represent React's available section explicitly and test all three subjects' links, active states, and mobile disclosure.
- Existing reading-panel copy describes a module preview → retain that honest label while delivering the requested lesson content; separate lesson routes remain deferred.
- Lifecycle explanations can imply overly simple mount/unmount semantics → review the authored dependency and cleanup explanations against the official React references and test source/step associations.
- A combined validator can accidentally remove judged-publication checks → separate its inputs and run existing JavaScript/Algorithms regressions with the React content checks.
- Concurrent sandbox work can overlap discovery/navigation → preserve pre-existing files, document the Learn-only availability decision, and recheck production prototype gates after integration.

## Migration Plan

Before implementation, create the one-page `docs/features/react-hooks-learning.md` brief from these artifacts with outcome, scope, acceptance, checklist, and pending verification. Add the content, validation, routes, and discovery in that order, then run root lint/typecheck/tests/build and browser review. Update README, UI registry, constitution availability wording, and the brief with delivered behavior and actual results; preserve the constitution's execution and authorization principles.

Use a completed production build and an available port for Playwright, preserving running user work. Use the dedicated development learner for authenticated checks and record any unavailable credentials as unverified. Review desktop and 320px, keyboard controls, reduced motion, and Light/Dark/Dark purple/System. Browser walkthrough stepping must produce no execution or account writes. Packaged Electron is outside the verification claim.

No data migration or new configuration is needed. Rollback removes the new React Learn routes/content/registry entries and restores discovery links; it must leave existing JavaScript, Algorithms, and development sandbox behavior intact.
