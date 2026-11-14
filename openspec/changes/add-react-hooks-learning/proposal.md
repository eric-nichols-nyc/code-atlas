# Proposal

## Why

React JS appears in the subject dashboard but has no learning catalog. Learners need a Hooks section and a first useEffect lifecycle lesson, presented consistently with JavaScript and Algorithms Learn.

## What Changes

- Enable Dashboard → React JS → React Learn, with a **Hooks** category and one published **useEffect lifecycle** entry. Recommended, search, difficulty, counts, and topic badges follow the existing Learn catalog.
- Deliver the lesson at `/react/learn/use-effect-lifecycle` through the existing module reading panel, trusted MDX, and a manually stepped code example. Cover setup, reactive dependencies, cleanup before re-synchronization and on unmount, and development Strict Mode behavior.
- Keep React Learn navigation, loading, recovery, and return links within React. Verify each protected page independently through the shared Neon Auth boundary.
- Extend authored-content validation and focused catalog, page, walkthrough, and browser coverage to React without treating learning entries as judged practice problems.
- Make the read-only Learn experience available in production independently of the existing development-only React sandbox. This replaces the earlier sandbox proposal's assumption that React Learn remains unavailable; its execution gates and practice scope remain intact.
- Defer additional Hooks lessons, separate individual-lesson routes, live React execution, a new lifecycle visualization, quizzes, tutors/notes for Learn, and learning progress or persistence. The requested lesson uses the same module-preview delivery pattern as the two existing subjects.

## Capabilities

### New Capabilities

- `react-learning`: Authenticated React learning discovery, the Hooks category, and the authored useEffect lifecycle lesson with shared catalog and walkthrough interactions.

### Modified Capabilities

None. `openspec list --specs` reports no main capability specs. The completed JavaScript/Algorithms changes and the in-progress React sandbox change supply context, rather than an existing main spec to modify.

## Impact

Add React Learn route entries and trusted content under `apps/web/src/content/react/learn`. Reuse `features/learning` renderers and helpers; update Dashboard discovery, subject-aware SiteNav, redirect configuration, and `apps/web/scripts/validate-learning-content.ts`. Add focused tests alongside existing learning tests and production browser journeys. Record implementation and verification in `docs/features/react-hooks-learning.md`, and update delivered-availability copy in README, the constitution, and the UI registry as needed.

No new dependency, API, database model, credential, execution adapter, or change to account-backed practice semantics is required. The branch starts from the existing React sandbox work; its pre-existing uncommitted tasks and brief are unrelated to this change.
