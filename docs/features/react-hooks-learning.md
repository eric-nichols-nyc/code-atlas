# React Hooks learning

**Outcome:** Dashboard → React JS → React Learn → Hooks → **useEffect lifecycle**.
Reuse the JavaScript/Algorithms catalog and reading panel with one authored React
lesson and a six-step code explanation.

**Included:** Recommended/Hooks categories, search and difficulty, one Easy module
with one lesson outline, authenticated catalog/preview routes, source highlighting,
Previous/Next/Restart, React-local recovery/navigation, all shared themes and 320px
layout. The example explains a timer's setup, dependencies, cleanup and replacement;
it does not execute the timer. Walkthrough and filters last for the mounted visit.

**Later:** Additional Hooks content, separate individual-lesson routes, live React
execution, lifecycle visualizations, quizzes, learning tutors/notes, completion and
account persistence. No new dependency, API, database model, or credential.

**Availability decision:** This requested learning slice supersedes the earlier
React sandbox proposal's Learn deferral. Learn is available in production after
authentication. React Practice remains a separate development pilot with its
existing page/API guards; its execution policy and tracking artifacts are unchanged.

**Acceptance and implementation:**

- [x] Authored Hooks metadata/MDX/walkthrough validate without a judged React problem.
- [x] Catalog and preview independently enforce setup/session boundaries; unknown,
  unpublished and foreign lesson addresses offer a React-local return destination.
- [x] Filters intersect/clear, walkthrough boundaries/restart work, and neither
  interaction writes account progress or executes code.
- [x] Dashboard and subject navigation expose Learn in production and preserve the
  development Practice entry without weakening its production restrictions.
- [x] Keyboard, reduced motion, four theme settings, desktop/320px, internal code
  scrolling, and filter/step retention work in the actual browser.
- [x] Root checks, content checking, production smoke and authenticated learning
  journeys pass; results and limits are recorded below.

**Ownership:** Trusted content is under `content/react/learn`; existing
`features/learning` owns rendering, filters, syntax preparation and manual steps.
Next routes own authentication and subject composition. The content checker keeps
learning subjects distinct from published judged-practice subjects.

**Verification — 2026-11-14:** Root `pnpm lint`, `pnpm typecheck`,
`pnpm test --maxWorkers=2` (66 files / 566 tests), content checking and a production
`pnpm build` with auth/database runtime values explicitly empty passed. OpenSpec
strict validation passed. No new dependencies or data migration were required.

Production Playwright passed 63 credential-free smoke checks and nine authenticated
checks (fresh dedicated-learner setup plus eight journeys). These cover React
discovery/filters/lesson/Back, all six source highlights, boundaries/restart/reload,
keyboard focus, announcements, four themes, reduced motion, 1280px/320px without
document overflow, direct/foreign/anonymous access, no execution/account writes,
and production pilot/obsolete-prototype denial. Existing JavaScript walkthrough,
catalog/navigation and Algorithms discovery journeys passed. Fresh sign-in first
encountered a transient Neon DNS failure; the final rerun passed after connectivity
returned, without auth configuration or infrastructure changes.

Manual signed-in Chrome review confirmed Hooks category alignment, the timer source
and dependency explanation, step retention at 320px, contained source scrolling and
mobile React navigation. The temporary viewport override was reset. The user's
development server on port 3000 remained running; production suites used ignored
configs and test copies with port references changed to 3001. An initial smoke run
with unmodified hardcoded port references failed four older tests; the corrected
port-3001 copies passed all 63. Test-harness corrections did not change application
code or tracked configuration.

Evidence is under ignored `outputs/react-hooks-verification/auth-results`, including
`react-hooks-catalog-desktop.png`, `react-hooks-lesson-desktop.png`, and
`react-hooks-lesson-mobile.png`. Packaged Electron was not tested. Learning remains
an authored module preview with visit-only step/filter state and no saved progress.
