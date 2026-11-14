# Tasks

## 1. Author the first React learning slice

- [x] 1.1 Create `docs/features/react-hooks-learning.md` with the outcome, included/deferred scope, acceptance checks, implementation checklist, and pending verification; verify it explicitly records that React Learn now supersedes the sandbox proposal's Learn deferral while preserving the development-only execution boundary.
- [x] 1.2 Add `content/react/learn/catalog.ts` with Hooks and the single recommended Easy `react.learn.use-effect-lifecycle` module plus one outline; add React content/catalog coverage verifying stable identity, category counts, intersecting filters, case-insensitive trimmed search, and subject-local lesson links.
- [x] 1.3 Author the useEffect lifecycle MDX overview, six-step timer walkthrough, and lazy overview/walkthrough registries; verify readable complete source, valid step lines, cleanup ordering, dependency variants, client-only execution, and Strict Mode explanations against the official React references, and document the example's conceptual/nonexecuting scope in the brief.
- [x] 1.4 Separate learning and judged-practice validation inputs in `apps/web/scripts/validate-learning-content.ts` and register React learning only; verify missing overview and invalid walkthrough references fail, valid React requires no judged problem, existing JavaScript/Algorithms publication checks remain covered, and `pnpm --filter @workspace/web content:check` passes.

## 2. Deliver authenticated catalog and lesson routes

- [x] 2.1 Add `/react/learn` and `/react/learn/[moduleSlug]` using existing Learn renderers with React props, metadata, and independent setup/session checks; add route coverage proving setup and rejected sessions withhold content and unknown, unpublished, or foreign-subject slugs are unavailable.
- [x] 2.2 Add React loading, retryable error, and unavailable-module states with `/react/learn` return destinations; verify their rendered feedback/actions and direct lesson return link, and add a neutral existing-icon fallback for Hooks without changing Arrays/Recommended styling.
- [x] 2.3 Add React catalog/lesson integration coverage for filter clearing, Hooks labels/counts, six manual walkthrough steps, disabled boundaries, restart, polite explanations, and absence of execution/completion/flag controls; verify existing shared Learn component tests remain green and record the reused presentation in `ui-registry.md`.

## 3. Enable React learning discovery while preserving the practice pilot

- [x] 3.1 Add `/react` → `/react/learn` in both the route and Next redirect config, and enable Explore React JS through `/react` in all environments; update Dashboard availability copy/tests and verify the canonical HTTP 307 destination without changing JavaScript/Algorithms redirects.
- [x] 3.2 Integrate React Learn into current SiteNav independently of `isReactPilotAvailable()`, retaining development Practice when enabled and the focused-workspace rule; verify React Learn active/return states, mobile navigation, Learn-only production links, existing JavaScript/Algorithms links, and unchanged production denial for pilot page/API paths plus obsolete prototype URLs.
- [x] 3.3 Update README and constitution subject-availability wording and the feature brief to describe delivered React Learn separately from development Practice; verify copy does not claim runtime judging, account learning progress, extra lessons, or packaged Electron validation and does not alter authorization/execution principles or unrelated sandbox tracking files.

## 4. Review the integrated learning journey

- [x] 4.1 Add and run production Playwright coverage for Dashboard → React Learn → Hooks → useEffect lifecycle → Back, intersecting/cleared filters, direct/foreign lesson access, missing setup, and denied sessions; with a dedicated learner verify walkthrough stepping emits no execution, tutor, notes, or progress writes and existing JavaScript/Algorithms journeys still pass.
- [x] 4.2 Review catalog and lesson in the actual browser at desktop and 320px with keyboard, reduced motion, and Light/Dark/Dark purple/System; verify local code overflow, visible focus, step/filter retention through theme/width changes, initial/end/restart behavior, and correct subject navigation, then record actual browser evidence and any credential limitations in the brief.
- [x] 4.3 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and a credential-independent `pnpm build`; use the completed production build and an available port for browser suites, preserving existing user work, and record exact outcomes, any unrelated concurrent-check failures, and remaining limitations in the brief before marking implementation complete.

## Workflow follow-up

- Review the completed first lesson before expanding the Hooks curriculum.
- Archive the change only after implementation and recorded verification are complete.
