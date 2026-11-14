# Design

## Context

See `proposal.md` for the outcome and `specs/javascript-learning/spec.md` for behavior. This design is included because the new catalog crosses route, content, and feature boundaries and needs an explicit boundary between module previews and future lessons.

Read-only discovery on 2026-11-14 confirmed:

- The running app has the Practice category/table layout and a Learn coming-soon page. Browser inspection covered both pages and the existing Electron practice workspace without changing learner code, notes, or account records.
- `features/catalog/components/javascript-practice.tsx` owns a 1920px page, 280px sidebar, 24px gap, vertical category Tabs, container-aware toolbar, and compact striped Table. Its record hook, flags, and solved cells are practice-specific.
- `features/learning/lib/types.ts` derives `TopicId` from `ProblemDefinition`; `CatalogEntry` and `problemHref` currently describe practice. `features/learning/components/learning-workspace.tsx` is the working coding workspace despite its name.
- `/javascript/learn/page.tsx` already checks auth configuration and calls `requirePageLearner()`. `SiteNav` already marks Learn active for descendant URLs and only hides navigation on focused practice routes. The proxy protects routes but does not replace page-level verification.
- Trusted practice MDX uses an explicit lazy import registry. `scripts/validate-learning-content.ts`, despite its name, validates practice only and prints that Learn is unpublished.
- Main OpenSpec specs are empty. Existing unit/browser tests and several docs explicitly describe Learn as future work. `docs/design/learning-layout.md` is earlier multi-panel lesson design input, not a requirement to implement that workspace now.
- Existing uncommitted navigation, themes, CSS, editor, and tutor changes are present. Use current files as the baseline and preserve that work.

## Goals / Non-Goals

**Goals:** Reuse the visible catalog pattern with a small learning-owned contract; deliver one complete catalog-to-preview journey; keep authored content replaceable when lessons are designed.

**Non-Goals:** No generalized course engine, shared lesson/problem execution model, workspace refactor, progress API, or extension of problem judging. The sample outlines do not establish future lesson routing, exercise types, or completion rules.

## Decisions

### 1. Add learning-owned catalog and module preview components

Add `JavaScriptLearn` and `LearningModuleOverview` under `features/learning/components/`, with pure helpers/types under `features/learning/lib/`. Follow `JavaScriptPractice` composition and reuse existing Tabs, Table, Input, Select, Badge, Button, and difficulty badge. Do not mount `usePracticeRecords` in Learn.

Use Practice's exact page gutters, heading scale, sidebar dimensions, table surface, row spacing, toolbar alignment, square search/select corners, and result-count placement from the current UI registry. The page heading remains **JavaScript Learn**. The table replaces practice-only columns with **Module / Difficulty / Topic / Lesson outlines**; the title cell has no flag control. Put the topic beside difficulty at narrow widths, keep the count compact, and allow internal table scrolling only if needed. Categories initially contain Recommended and Arrays, using existing icons and semantic colors. Search and difficulty remain local component state above category content; theme/width changes must not remount that state. Returning from the preview may restore default catalog filters, as existing Practice does.

Alternative: add a mode prop to `JavaScriptPractice`. Rejected because it couples Learn to account progress and executable problem types. A generic catalog framework is unnecessary for this first module; extract a small shared piece only if implementation demonstrates a concrete need without changing Practice behavior.

### 2. Keep a minimal independent learning content contract

Place metadata in `content/javascript/learn/catalog.ts`, trusted overview prose in `content/javascript/learn/two-pointers/overview.mdx`, and an explicit lazy overview loader registry beside the catalog. Allow only registered loaders; never construct a dynamic import path from a URL parameter.

Use a learning module record with stable `id`, `slug`, `title`, `summary`, `topicId`, `difficulty`, `order`, `status`, `recommended`, and an ordered `lessonOutlines` array of `{ id, title, summary }`. Keep learning topics local to this catalog and independent of `ProblemDefinition`; the first topic is Arrays. Counts come from published module records and actual outlines. Keep helpers for published category counts, intersecting filters, and module destinations separate from `problemHref`.

Seed one published record, `javascript.learn.two-pointers`, slug `two-pointers`, difficulty Easy, topic Arrays, and recommended true. Author three short outlines: Introduction, Opposite-end pointers, and Same-direction pointers. They have no lesson URLs or completion fields. This metadata is a provisional content organization, not an interactive lesson schema.

Extend the existing content-check script to validate unique module IDs/slugs/order, known topic/difficulty/status values, required nonempty text, outline IDs/titles/summaries, and nonempty preview files plus registered loaders for published entries. Keep practice validation intact and replace the stale unpublished-Learn success message.

Alternative: reuse `CatalogEntry` by extending the problem topic union. Rejected because learning should not change executable problem contracts simply to obtain visual reuse. A database/CMS adds no value for source-authored sample content.

### 3. A module opens a small read-only overview

Compose `/javascript/learn/[moduleSlug]/page.tsx` from a published module lookup and its registered MDX loader after the page's auth check. Unknown or unpublished slugs call `notFound()`. Use one title, topic/difficulty badges, a short Preview label, an introduction, one read-only example, the outline list, and Back to Learn. Retain GlobalNav and its Learn active state.

The original example can show pair-sum search on a sorted array, with explicit sorted-input precondition, `left`/`right` index updates, and a stated result for `[1, 2, 4, 7, 11]` with target `9`. Present it as explanatory source, never as executed output. Use ordinary semantic pre/code with local overflow and feature-scoped MDX styling; no CodeMirror, Run/Submit, playback, or new syntax dependency. The outline list is plain content.

Alternative: link to a new lesson workspace or the existing practice worker/editor. Rejected because either would decide the lesson interaction model prematurely. A module preview makes the catalog link real while keeping that later design open.

### 4. Preserve auth and provide route states without persistence

Both catalog and overview pages use the current `isAuthConfigured()` → AuthSetup → `requirePageLearner()` boundary before rendering/loading learner content. There is no new API or database call. Use existing loading Skeleton, error Button, and not-found patterns under the Learn route; report a learning-specific failure with Try again and Back to Learn. Auth verification must remain in the pages even though the proxy also redirects.

Keep `/javascript`, legacy redirects, Practice, AI tutor, notes, and practice progress unchanged. No SiteNav behavior change is needed because Learn descendants already activate its link. Public availability copy should describe a sample module preview while continuing to defer full guided lessons.

Alternative: publish the sample publicly or rely only on the proxy. Rejected to preserve the current access policy and per-resource verification requirement.

## Risks / Trade-offs

- [Catalog styling can diverge] → Match current registry measurements and compare the running Learn/Practice pages at the same desktop and mobile widths. Reuse shared visual primitives and tokens.
- [A lesson count suggests finished lessons] → Label it Lesson outlines and mark the module as a preview; outlines are text with no Start lesson or completion actions.
- [Sample content grows into premature lesson architecture] → Restrict the contract to summary outlines and a read-only overview. The full lesson model requires a later proposal.
- [Existing documentation disagrees about Learn availability] → Add one `docs/features/javascript-learning.md` brief during apply and update current README, availability copy, and UI registry; annotate older feature/design documentation where needed rather than erasing its history. The constitution's deferred lesson requirements remain deferred; clarify only its obsolete blanket future-Learn wording using its governance rules if needed.
- [Verification disrupts current work] → Preserve the existing dev server and learner drafts. Production browser suites need port 3000 free and a completed build; coordinate that during apply, and report any blocked check honestly.

## Verification and Delivery

Use meaningful unit/component checks for filtering/counts, unavailable entries, clear behavior, preview destinations, invalid slugs, and independent page auth boundaries. Update the existing Learn-placeholder expectations in `features/learning/components/access.test.tsx` and `tests/e2e-auth/learning.spec.ts`. Add browser coverage to that existing authenticated suite so its configured test discovery includes the new journey. Extend credential-free smoke access checks to the new module route.

During apply, run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` (which includes content checking). After a completed production build and with port 3000 available, run `pnpm test:e2e`; run `pnpm test:e2e:auth` with the dedicated development identity when configured. Review the actual catalog/preview at desktop and 320/390px widths, keyboard navigation, empty-filter recovery, long code containment, and Light/Dark/Dark purple/System behavior. Record automated and manual results separately in the brief. No tests or builds have been run in this proposal-only phase.

Delivery is an ordinary app update without a migration, new secret, or dependency. Rollback reverts the learning change and restores the placeholder; no learner data needs conversion.
