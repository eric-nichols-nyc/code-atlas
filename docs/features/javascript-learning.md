# JavaScript learning

## Two Pointers lesson refresh

The JavaScript and Algorithms Learn catalogs open the same Two Pointers lesson
under their existing module IDs and URLs. The previous sorted-pair example is
replaced by a JavaScript palindrome check using `racecar`. The lesson introduces
opposite-direction, same-direction, and fixed-offset scans in the Code Atlas
reading layout. [AlgoMaster’s introduction](https://algomaster.io/learn/dsa/two-pointers-introduction)

- The five visual steps show the pointers starting at `(0, 6)`, comparing
  `r/r`, `a/a`, and `c/c`, and meeting at `(3, 3)` with a result of `true`.
- The six code steps explain initialization, comparisons, early exit for
  `hello`, inward movement, and the successful return.
- Previous, Next, Restart, and the visualization slider preserve independent
  visit-only state. Check keyboard navigation, theme and width changes, reload,
  and a 320px viewport. Each subject keeps its own Learn navigation and access
  boundary.
- Shared metadata, prose, source, and prepared snapshots live in
  `content/shared/learn/two-pointers`. Each subject registers the overview and
  walkthrough under its own catalog. Content validation checks source references
  and the complete palindrome trace.

Lint, typecheck, content validation, the web production build, and all 797
Vitest tests passed. The signed-in Chromium run passed six lesson journeys and
the dedicated learner sign-in. It covered both subject routes, stepping,
keyboard scrubbing, all four themes, and visit-only state. Desktop and 320px
browser captures show the centered pointers and local code scrolling.

## Original rollout and verification

**Array visualization improvement — 2026-11-14:**

- [x] Typed prepared frames, shared sample input, source references, and validation.
- [x] Reusable array display, controls/slider, and deterministic navigation coverage.
- [x] Actual lesson/browser review, root checks/build, and verification recorded below.

**Ownership:** `features/learning` owns components and pure catalog helpers.
`content/javascript/learn/catalog.ts` owns module metadata and lesson outlines;
`overviews.ts` registers lazy trusted MDX; `two-pointers/overview.mdx` owns prose.
`two-pointers/walkthrough.ts` owns the canonical example/steps, registered in
`walkthroughs.ts`. Feature-owned pure validation and server syntax preparation
feed the reusable local-state client component.
`two-pointers/example.ts` supplies the shared numbers/target to the source and
visualization; `visualization.ts` owns prepared teaching frames. The learning
validator checks the complete inward-search ordering, pointer positions, and source
references before publishing. This first visualization supports a sorted finite
sample ending in a matching pair; it does not interpret JavaScript. Navigation
controls are shared with the conceptual walkthrough; Slider lives in `packages/ui`
and uses the existing Radix dependency.
Add metadata plus a registered, nonempty overview for each published module.
`pnpm --filter @workspace/web content:check` validates content as part of build.
No new dependencies, API, database models, or secrets.

**Guided walkthrough improvement — 2026-11-14:** Replace the static example with
one canonical typed source and six explanations: initialize, loop, sum, match,
movement, and no match. Prepare syntax on the server using installed packages;
keep manual step selection in the learning client component.

- [x] Validated authored definition and content-check integration.
- [x] Server presentation/fallback and accessible responsive controls.
- [x] Two Pointers MDX integration and access/browser coverage.
- [x] Root checks, credential-free build, production smoke, authenticated learning,
  and direct browser review recorded below.

**Original scaffold implementation:**

- [x] Authored content, independent types/helpers, and content validation.
- [x] Catalog and authenticated page with matching Practice layout.
- [x] Module preview, loading/error/not-found, and navigation coverage.
- [x] Availability copy and UI registry updated.
- [x] Browser review and repository checks recorded below.

**Original scaffold verification — 2026-11-14:**

- `pnpm lint`, `pnpm typecheck`, `pnpm test`: passed; 50 files / 439 tests.
- `pnpm build`: passed, including authored practice/learning content validation.
  Forced build with auth/database environment values empty: passed.
- Credential-free production smoke: 48/48 passed. Authenticated production suite:
  14/15 passed; both new learning journeys and Practice/Learn navigation passed.
  A targeted repeat also passed catalog → preview and reproduced the unrelated
  existing tutor test failure at `tests/e2e-auth/tutor.spec.ts:148`: Escape leaves
  the mobile tools dialog open instead of focusing Show AI tutor. Tutor/workspace
  source is unchanged by this feature. This is a broader-suite limitation, not a
  passing check; no tutor fix was folded into the learning scope.
- Browser suites used ignored copies/config overrides under
  `outputs/learning-verification/` on production port 3001, replacing only test
  port references. The tracked configs and running dev server on 3000 were left
  intact. A dedicated Neon development learner was used for authenticated tests.
- Manual signed-in Chrome review: Practice and Learn at 1280px both have a 280px
  sidebar / 862px table. Catalog and preview work at 320/390px without document
  overflow; code scrolls inside its surface (236px visible / 400px content at
  320px). Keyboard category/search-clear/link navigation and Light/Dark/Dark
  purple/System were checked; original Dark preference and viewport restored.
- Review screenshots: `outputs/javascript-learning-catalog.png` and
  `outputs/javascript-learning-preview.png`. Existing uncommitted source changes
  were preserved byte-for-byte; the UI registry received learning additions.

**Original scaffold limitations:** Individual lessons remain outlines, without lesson routes,
interactive exercises, or completion tracking. Packaged Electron was not tested;
this change reuses the web experience without altering desktop code.

**Content addition — 2026-11-14:** Added the supplied Two-pointer Strategies
section (inward, unidirectional, and staged traversal), retaining the two linked
ByteByteGo SVG diagrams. Staged traversal currently ends at the supplied opening
sentence. Diagrams keep their aspect ratio and fit the reading panel on mobile.
Lint and content validation passed; browser review confirmed both SVGs loaded and
fit at 320px without document overflow.

Added three name-only LeetCode examples under each strategy, linked to their
official problem pages. Staged examples use pivot/group/word-boundary scans;
classification depends on the chosen implementation and can overlap strategies.

**Navigation loading — 2026-11-14:** Learn/Practice already had skeleton route
fallbacks, but navigation disabled prefetching and showed no feedback while the
first response was pending. Add `app/loading.tsx` and reuse one visible, announced
spinner/skeleton fallback across global, Learn, and Practice loading pages.
Use Next's `useLinkStatus` inside navigation links to replace the existing icon
without changing link width, announce the destination, and clear on commit or
interruption. Restore automatic navigation prefetching. Keep navigation usable
and respect reduced motion. Mobile also shows a shared status Badge outside the
collapsed navigation menu, so feedback stays visible after the menu closes.
Acceptance: deliberately held Learn and Practice
responses show pending feedback before response bytes arrive, preserve link
names/width, and clear after navigation; mouse and keyboard both work.
The global Suspense boundary can stream page-level redirects as HTTP 200, so the
canonical `/javascript` redirect is also declared in Next's redirect config to
retain its existing HTTP 307 response before streaming begins.
Verified: lint, typecheck, 439 unit/component tests during the loading update, and
credential-free build passed. Final production smoke passed 52/52, including four
held-response journeys at 1280px/320px, mouse/keyboard activation, reduced motion,
and preserved redirect status. Selected authenticated production checks passed
5/5, including a pending-navigation interruption on mobile (the prior desktop run
also passed). Manual Chrome section navigation at desktop and 320px passed without
horizontal overflow. Production checks again used ignored port-3001 test copies
to preserve the dev server on 3000. Screenshot: `outputs/navigation-pending-mobile.png`.
The previously recorded unrelated tutor focus failure remains outside this update.

**Guided walkthrough verification — 2026-11-14:**

- Delivered six synchronized conceptual steps with Previous/Next/Restart,
  numbered readable source, server-prepared syntax, polite explanations, and
  responsive code/explanation layout. Removed the preview's bottom lesson outlines
  per the follow-up request; catalog metadata and surrounding strategy content remain.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed: 53 files / 475 tests.
  The initial full test run encountered an unrelated reduction-judge verdict mismatch
  (`runtime-error` instead of `wrong-answer`); its isolated 46-test file and the full
  475-test rerun both passed. No judging source was changed.
- `pnpm --filter @workspace/web content:check` and root `pnpm build` passed,
  with auth URL/cookie secret and database URL explicitly empty for the build.
  Validation rejects invalid authored identities, content, and source references.
  Tests also cover complete source reconstruction, safe text rendering, syntax
  failure, malformed optional data, independent instances, and mount reset.
- Credential-free production smoke passed 52/52. Authenticated production checks
  passed 15/15, including dedicated learner setup, both new walkthrough journeys,
  catalog/navigation, practice execution, and existing notes coverage. The walkthrough
  journey confirmed no execution/progress writes and unchanged practice progress.
  The separate tutor suite was not rerun in this change; its historical focus failure
  above is not counted as passing.
- A later screenshot-only rerun hit an existing sign-in hydration race: the setup
  locator briefly found two Password inputs. Repeating just the responsive test
  with the dedicated learner session established by the passing full run succeeded
  (1/1); no auth implementation or setup source was changed. Review screenshots
  were refreshed after waiting for the theme menu to close.
- Manual signed-in Chrome review covered desktop/320px, keyboard stepping and
  restart, boundaries, and Light/Dark/Dark purple/System. Step selection survived
  theme/width changes; at 320px the document remained 320px wide while source
  scrolled within 236px (429px content). The bottom outlines were verified absent.
  Original Dark preference and viewport override were restored.
- Production checks used ignored current test copies/config overrides under
  `outputs/guided-walkthrough-verification/`, with port references changed to 3001.
  The existing development server on 3000 and unrelated working files were preserved.
  Screenshots: `two-pointers-walkthrough-desktop.png` and
  `two-pointers-walkthrough-mobile.png` in that output directory.

**Initial walkthrough limits:** This is an authored code explanation embedded in the module
preview. Individual lessons, runtime visualizations, quizzes, execution, autoplay,
and saved walkthrough progress remain deferred. Packaged Electron was not tested;
no desktop code or native integration changed.

**Array visualization verification — 2026-11-14:**

- Delivered the seven prepared frames below the conceptual walkthrough. Left/right
  labels, solid/dashed pointer borders, ruled-out values, comparison math, source
  lines, narrative, result, slider, and controls follow one selected frame. Both
  examples share controls but keep independent state. The removed bottom lesson
  outlines remain absent. No new dependency, API, database model, or credential.
- `pnpm typecheck`, root `pnpm test` (55 files / 492 tests), content checking,
  and a root production build with auth/database values explicitly empty passed.
  Focused coverage checks the known sample, source mappings, invalid pointer/phase
  ordering and content, forward/back/restart/scrubbing, independent instances,
  remount reset, accessible names, and optional-visualization fallback.
- Biome checks passed for the 18 exact changed files. Wider checks encountered
  formatting in concurrent work: the separate Algorithms proposal and later edits
  to shared learning catalog/workspace files. Those files were left untouched;
  repository-wide lint is not claimed as passing.
- Credential-free production smoke passed 52/52. The authenticated setup initially
  reproduced the previously recorded duplicate-Password-input hydration race, so
  its 15 dependent journeys did not run in that attempt. Reusing the existing
  dedicated development learner session with `--no-deps` passed all 15 authenticated
  journeys, including the new visualization and existing walkthrough/practice/notes
  regressions. A new sign-in setup pass is not claimed; auth source was unchanged.
- The new browser journey covers all seven frames, known sums/indices, source
  references, boundary controls, keyboard slider Home/End/arrows, restart/reload,
  1280/390/320px, Light/Dark/Dark purple/System, reduced motion, and no execution or
  progress writes. Manual signed-in Chrome review confirmed both pointer moves,
  matching indices/values, 320px layout, and Light/Dark contrast. Original Dark
  preference and viewport override were restored.
- Production checks used ignored port-3001 test copies/configs under
  `outputs/two-pointer-visualization-verification/`. The development server on 3000
  and unrelated working files were preserved. Review images are
  `two-pointer-array-desktop.png` and `two-pointer-array-mobile.png` in that directory.

**Current limits:** The visualization follows the fixed sorted-array example
through a matching pair. It does not execute learner code, generate traces, autoplay,
or save progress. Other examples, no-match scenarios, quizzes, individual lesson
routes, and packaged Electron verification remain later work.
