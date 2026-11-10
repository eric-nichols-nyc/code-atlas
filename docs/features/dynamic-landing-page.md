# Dynamic public landing page

**Outcome:** Give visitors a clear reason to practice JavaScript and a useful first
interaction before sign-in. **First review:** one complete public home page with a
working Counter example and real paths into the existing practice workspace.

## Included and later

- Reuse the application shell, shared theme/primitives and navigation conventions.
  Use a strong centered hero, two clear actions, and a code/workspace preview.
- Counter preview executes a fixed trusted closure in the browser; visitors can call
  it repeatedly, choose another starting example, and reset. No arbitrary source is
  evaluated, no judging or solved state is simulated, and no account data is written.
- Explain the actual read → implement → test/save flow. List the published JavaScript
  problems from existing content metadata; mark Algorithms, React JS and Learn honestly
  as future work. Include concise FAQ and a closing practice action.
- Preserve keyboard focus, native navigation, theme support and narrow-screen layout.
  Do not add heavy editor/motion dependencies or auto-playing decoration.

**Later:** new course content, interviews, AI tutoring, pricing, testimonials, desktop
packaging and arbitrary-code execution on the public page. Deployment is outside this feature.

## Reference evidence and design choices

Reference: https://tracecode.app/ (public, signed out). REA observed a centered hero,
Dashboard/Practice actions, a three-pane code/trace preview, three explanatory sections,
pricing and a final CTA. A declared Next step click changed the preview from step 1/60
to 2/60, exposing the next line/state. Two visits selected different problem/language
examples; the selection mechanism and application internals remain unknown.

Evidence: `ev_b48313bd6763c1518bb45368dd03665d5aae685c758829e7b80bd014231aa5b4`
and `ev_8a1380507de9051c6ba374eeaefd6c28bf6d30e53ebf5146985b9f8fb7aff24f`.
Both owned browser processes were terminated after capture. Complete local evidence is
retained in `work/landing-reference/`; this is observed UI evidence, not source analysis.

Adapt the product-first structure to Code Atlas with a live JavaScript closure example,
existing typography/semantic colors, current practice metadata, and account persistence.
No claims about visualization, interviews, pricing or unbuilt learning features.

## Acceptance and checklist

- [x] Inspect existing UI and reference; create `feature/dynamic-landing-page` from clean main.
- [x] Implement the public page in `features/landing` with a small client-side preview.
- [x] Verify Counter increment, independent examples and reset, and real CTA destinations.
- [x] Review desktop/mobile, both themes and keyboard navigation without horizontal overflow.
- [x] Run relevant tests and root checks; update README, UI registry and actual results.

## Verification

Verified 2026-11-09:

- `pnpm lint`, `pnpm typecheck`, `pnpm test`: passed; 126 tests across 21 files.
- `pnpm build`: passed with Clerk and database credentials explicitly empty.
- Production Playwright: 28 passed, including Counter keyboard calls/tab selection/reset,
  FAQ keyboard expansion, published problem destinations and existing navigation/auth gates.
  Ran an ignored copy of the root configuration on 3100/4100 to preserve development servers.
- Direct browser review: desktop, tablet and 320/390px mobile; light/dark themes;
  increment, negative start and reset; no horizontal overflow. Fixed a narrow-screen
  Card header found during review. Automated both-theme overflow checks cover 320, 390,
  768 and 1280px. Theme and preview state survive responsive changes.
- README and existing public-home UI registry entry updated. Review screenshots retained
  locally in `outputs/dynamic-landing-page/` (desktop, mobile and hero).

The preview is a fixed trusted Counter example, not a code editor or submission judge.
Authenticated persistence was not changed or reverified by this public-page feature.
Existing learner drafts remain outside the preview. No new dependencies. Push and merge
were authorized after the working page was reviewed.
