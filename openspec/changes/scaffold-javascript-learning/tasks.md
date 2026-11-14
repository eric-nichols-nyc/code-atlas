# Tasks

## 1. Learning content and catalog behavior

- [x] 1.1 Create the one-page `docs/features/javascript-learning.md` brief from this change, covering the first catalog-to-preview journey, included/deferred scope, acceptance checks, implementation checklist, and pending verification; verify it explicitly leaves the individual lesson layout open.
- [x] 1.2 Add learning-owned module/topic types and source metadata under `features/learning/lib/` and `content/javascript/learn/`; author the Two Pointers overview MDX and three lesson outlines from the design. Verify the single published record has the planned slug, Easy/Arrays metadata, explicit preview copy, original sorted-array example, and three non-navigable outlines.
- [x] 1.3 Implement pure learning category/filter/destination helpers and colocated tests; verify published-only counts, recommended/topic membership, stable ordering, trimmed case-insensitive title/summary search, intersecting difficulty filters, and missing/planned destinations using representative fixtures. Keep practice types/helpers unchanged.
- [x] 1.4 Extend `apps/web/scripts/validate-learning-content.ts` with learning metadata/outline/reference validation and focused invalid-content coverage while preserving practice checks; verify `pnpm --filter @workspace/web content:check` succeeds for authored content and the focused tests reject duplicates, invalid metadata/outlines, and unavailable published previews. Document the learning authoring files and validation command in the feature brief.

## 2. JavaScript Learn catalog

- [x] 2.1 Build the learning catalog component using Practice's shared primitives, layout measurements, category styling, search/difficulty controls, module counts, and table with learning-specific columns; verify component tests cover filtering, count changes, empty states, clear-with-category-preservation, and the Two Pointers destination without flags/solved controls.
- [x] 2.2 Replace the Learn placeholder page with the authenticated catalog while retaining AuthSetup and page-level session verification; update `features/learning/components/access.test.tsx` and the catalog/navigation cases in `tests/e2e-auth/learning.spec.ts`. Verify rejected sessions withhold content, missing configuration shows setup only, authorized sessions see the catalog, and existing Practice access assertions still pass.
- [x] 2.3 Update the catalog sections of `ui-registry.md` and the feature brief with learning labels, content counts, responsive behavior, and the preserved Learn/Practice navigation; verify documentation matches the component and does not claim learning progress or finished lessons.

## 3. Two Pointers module preview

- [x] 3.1 Add the protected `/javascript/learn/[moduleSlug]` page and learning-owned overview component with a published-module lookup and explicit lazy MDX registry; add focused route/access tests. Verify the canonical and direct Two Pointers route shows the introduction, read-only example, three outlines, and Back to Learn only after session verification, with no runner, lesson links, or database progress calls.
- [x] 3.2 Add Learn loading/error/not-found surfaces using existing UI patterns; verify missing/planned slugs show not found, simulated content failures show retry and Back to Learn, and loading has an accessible name without displaying a successful module prematurely.
- [x] 3.3 Extend the existing authenticated browser suite with Learn → filter → Two Pointers → Back to Learn, direct module access, active Learn navigation on the preview, and return to Practice. Extend credential-free smoke access cases to the new module route. Verify these tests are discovered by the existing Playwright configs and do not submit code or mutate account records.
- [x] 3.4 Update README and current app availability copy to distinguish the sample module preview from deferred guided lessons; record the preview typography/code containment in `ui-registry.md` and the feature brief. Annotate conflicting historical guidance as appropriate, and clarify obsolete future-Learn wording in the constitution only if necessary under its governance rules. Verify no copy promises interactive lessons, saved completion, or an available Algorithms subject.

## 4. Integrated verification and review

- [x] 4.1 Review the real catalog and preview alongside Practice at the same desktop viewport and at 320/390px widths. Verify keyboard category/filter/link navigation, focus, empty-filter recovery, no document overflow, local code scrolling, and Light/Dark/Dark purple/System behavior; record findings and any fixes in the brief while preserving existing learner drafts and uncommitted changes.
- [x] 4.2 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; after a completed build and with port 3000 free, run `pnpm test:e2e` and the dedicated-identity `pnpm test:e2e:auth` when configured. Record actual results, distinguish manual authenticated review from automated runs, and report any blocked check without claiming it passed. Confirm the completed slice remains within the deferred lesson boundary.
