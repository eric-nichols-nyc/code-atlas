# JavaScript practice

**Outcome:** Solve one JavaScript-specific problem in Code Atlas with real Run/Submit results.
**First review:** Sleep — return a Promise that settles after the requested delay.

## Practice and Learn sections

JavaScript owns two separate sections. `/javascript` opens Practice at
`/javascript/practice`; Sleep lives at `/javascript/practice/sleep`. Learn is reserved
at `/javascript/learn` with a clear coming-soon state; its behavior and curriculum
will be defined later. Practice lists coding problems only. Existing planned lesson
metadata stays separate from the practice catalog. The old `/learn/javascript` and
problem URLs redirect to their Practice equivalents.

Reference: [TraceCode practice workspace](https://tracecode.app/practice/binary-search),
reviewed for its dedicated practice route and focused problem workspace. This change
retains the existing editor, Run/Submit, resizable layout and shared visual conventions.

Acceptance: dashboard → Practice → Sleep uses only canonical URLs; Practice/Learn
navigation identifies the active section; Learn is explicitly unavailable; redirects
preserve old links; all protected pages still verify sessions.

Route migration checklist:

- [x] Separate routes, practice content and planned learning metadata.
- [x] Update navigation, titles, breadcrumbs and unavailable states.
- [x] Verify auth boundaries, redirects, content, build and browser navigation.

## Scope

Editable JavaScript, description/examples/constraints/solution, visible editable Run cases,
server-private Submit cases, resizable results workspace and actual session submission history.
Visualization and the multiple-choice checkpoint are removed. Sleep is the only published problem.

**Later:** account-saved submissions/progress, connected tutoring, more problems and Electron.

## Acceptance checks

- Empty/immediate solution fails; a proper asynchronous timer solution passes Run and full Submit.
- Hidden inputs/logs remain server-owned; non-terminating code is bounded and later runs still work.
- Source and results survive responsive/theme changes; reset layout preserves code.
- No visualization/checkpoint or pretend saved/accepted state appears.

## Build checklist

- [x] Public problem contract, Sleep content and catalog.
- [x] Lazy JavaScript editor, description and test/result panes.
- [x] Authenticated BFF/API with an isolated bounded execution runtime.
- [x] Actual Run/Submit and explicitly unsaved session submission results.
- [x] Meaningful runner/auth/UI tests, lint, typecheck and production build.
- [x] Signed-in browser review of Wrong Answer → Run Accepted → Submit Accepted (10/10).

## Earlier execution review

66 tests passed across 14 files. Root lint/typecheck and production build passed. The signed-in
browser retained source and Accepted across 320/390/768/1024/1280/1440px without horizontal overflow;
both themes and real session submission history were reviewed. Screenshots are in
`outputs/002-javascript-coding-problems/`. Submission persistence is not implemented.
Authenticated automation was deferred by the user. Actual browser zoom/media emulation remains
unverified in the in-app browser. Production smoke has not been rerun during this signed-in dev
session. The detailed 002 artifacts record the earlier formal plan and are now historical context.

Bundle analysis passed: CodeMirror is present; QuickJS, the worker, private execution service and private input modules are absent from the client graph.

## Practice migration verification — 2026-11-09

- 70 Vitest tests passed across 14 files, including section access and catalog separation.
- Root lint and typecheck, content validation, and the credential-free production build passed.
- 11 production Playwright route tests passed: new routes withhold content before credentials;
  old catalog/problem links and `/javascript` redirect to the canonical Practice destinations.
- Signed-in browser review verified Practice ↔ Learn navigation, the coming-soon page,
  no horizontal overflow for either section at 320px, and Sleep at
  `/javascript/practice/sleep`. Starter Run returned Wrong Answer; the correct solution
  submitted Accepted with 10/10 cases. The viewport override was reset.
- Screenshots: `outputs/javascript-practice/practice-sections.png` and `sleep-practice.png`.
  The development web/API servers are running again. Full authenticated automation remains
  deferred as requested; account persistence and the Learn feature remain future work.

## Contextual JavaScript header

Dashboard sits beside Code Atlas and returns to the dashboard subject picker. Only
Learn and Practice are centered within `/javascript` routes; nested problems keep
Practice active. The app supplies routes; GlobalNav exposes generic `leadingItems`
and `itemsAlign` options. Remove breadcrumbs from Practice, Learn and the problem
workspace. Page headings identify the current content. Keep mobile disclosure and
account/theme controls. Interview remains deferred. Select problems directly from
the catalog; no Start practicing shortcut.

Verify Dashboard → subject → Practice → problem, separate section links, true
centering, left placement, and mobile keyboard/menu behavior.

## Practice categories and recommendations

The practice landing uses a category sidebar beside the problem list, based on the
TraceCode practice reference. Recommended is the initial category. Sleep is explicitly
recommended and belongs to Async, so it appears in both lists and opens the same problem
route. Show only populated topic categories. Recommendations are curated metadata, not
personalized progress. Search intersects the selected category; clearing search retains
the category. Shared vertical Tabs provide selection and keyboard behavior; narrow
screens stack categories above the list. Difficulty and topic are problem metadata.

Acceptance: Recommended → Sleep; Async → same Sleep; search/clear works within the
selected category; counts are actual published entries; unpublished and nonrecommended
entries are not incorrectly recommended. Preserve the separate Dashboard and section
links and keep breadcrumbs removed.

## Current verification — header and category updates

Root lint, typecheck, content validation, 74 Vitest tests across 15 files and the
credential-free production build passed. All 22 production Playwright checks passed,
including Dashboard beside the brand, centered section links at 768/1280px, route
changes, mobile keyboard behavior and existing auth/redirect contracts.

Signed-in browser review verified Dashboard → JavaScript → Sleep, absence of breadcrumbs
on Practice/Learn/problem pages, Recommended and Async opening the same Sleep route,
search and clearing without leaving Async, and arrow-key category selection. At 320px,
categories stack above the list without horizontal overflow; the viewport was reset.
The development servers are running again. Authenticated automation remains deferred
as requested; category interactions were reviewed manually in the signed-in browser.

## Focused problem page

Individual problem routes omit the Code Atlas global header and its Learn/Practice
links. A compact toolbar begins with Back, a deterministic link to `/javascript/practice`,
and AI tutor/Notes icon toggles. The Problems button/drawer is removed. Keep the theme switcher in the code header and keep Clerk
and theme providers mounted. Catalog and Learn pages retain their normal navigation.
The editor, execution and split panes remain the existing implementation. Verify Back
restores the Practice catalog/header, the workspace uses the released vertical space,
and Run/Submit and narrow-screen controls remain usable.

Focused-page verification: root lint, typecheck, 74 Vitest tests and the production
build passed. Four production navigation smoke tests passed using the root smoke
configuration on a separate port (3100), preserving the running development workspace.
Signed-in browser review confirmed no Main navigation on Sleep, Back returning to
Recommended with the global header restored, and Back visible with no horizontal
overflow at 320px. The viewport was reset. The authenticated automation suite remains
deferred as requested; the Back journey was checked manually.

## Description and editor-control revision

The left pane shows the description, examples and constraints without tabs or a
Submissions view. Each hint is an independently collapsible Accordion row; Solution
is the final row and reveals authored code plus explanation. Help expansion persists
across responsive panel changes. Remove unused left-tab and submission-history state,
while retaining the latest Run/Submit result.

The code header owns Share (disabled, coming soon), Reset code, and the theme icon.
Reset code restores starter source and is disabled when unchanged or executing. Run
and Submit stay below the editor. The workspace Reset layout button is removed.

The workspace toolbar contains Back, a Sparkles AI tutor icon and a NotebookPen
Notes icon. Each tool opens its corresponding tab, switches an already-open panel
to that tab, and closes the panel when its active icon is clicked. Icons have
accessible Show/Hide names; drawer focus returns to its opening icon.
The Problems button and its unused drawer state are removed.

Revision verification: root lint, typecheck, all 77 Vitest tests and the production
build passed. Signed-in browser review confirmed independent hint/solution rows,
code-header Reset/Share/theme controls, and Notes/AI shortcuts selecting their
matching tabs. At 320px the Notes drawer opens the correct tab, returns focus to
its icon on close, and has no horizontal overflow. Authenticated Playwright remains
deferred as requested. The development servers remain running.
