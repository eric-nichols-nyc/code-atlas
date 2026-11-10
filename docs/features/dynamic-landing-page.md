# Dynamic public landing page

**Outcome:** Give visitors a clear reason to practice JavaScript and a useful first
interaction before sign-in. **First review:** one complete public home page with a
working Counter example and real paths into the existing practice workspace.

## Included and later

- Reuse the shared theme/primitives and application providers. Use a standalone
  centered Code Atlas hero without GlobalNav, followed by the working Counter preview.
  The hero contains branding, headline, description and one white Start practicing
  button with black text. It opens `/dashboard` for a verified Clerk session and
  `/sign-in` otherwise; the server computes this link without protecting the public page.
  Missing Clerk configuration skips session access and keeps public builds working.
  The former tag, Try an example action and three benefit labels are removed.
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

## Standalone hero revision — 2026-11-10

Requested review: Code Atlas brand above the heading, no global header, and one
white-background/black-text Start practicing action. The public preview and lower
sections remain interactive. Other routes retain their global navigation and theme
controls; the selected theme persists onto the standalone landing page.

Verification completed:

- `pnpm lint`, `pnpm typecheck`, `pnpm test`: passed, 137 tests across 20 files.
  New page tests cover verified identity, anonymous identity and missing Clerk
  configuration without making the public page protected.
- Credential-free `pnpm build`: passed. Production Playwright: 32 passed on
  isolated port 3100, preserving the existing development server on 3000.
  Covers the missing header/tag/extra hero controls, sign-in destination, white
  background/black text, retained public preview, themes, and responsive layout.
- Signed-in manual browser: Start practicing linked directly to Dashboard and
  opened the protected subject picker. The homepage remained header-free when
  returning. A 390px review showed no document overflow and kept the white/black
  action. No practice submissions or progress writes were performed for this review.
- The optional authenticated Playwright journey is configured but unverified;
  it still requires the dedicated test identity previously deferred by the user.

## Intro animation reference — 2026-11-10

The requested marketing entrance prevents a jarring page reveal. Inspecting the
[live homepage](https://tracecode.app/) DOM and its
[published stylesheet](https://tracecode.app/assets/styles-DiGbVbwt.css) established
the actual implementation: CSS keyframes fade opacity 0 → 1 while moving upward
from `translateY(16px)` to zero, with `cubic-bezier(0.22, 1, 0.36, 1)` and fill `both`.

| Target                  | Duration | Delay |
| ----------------------- | -------- | ----- |
| Brand                   | 680ms    | 0ms   |
| Heading and description | 680ms    | 90ms  |
| Primary action          | 680ms    | 180ms |
| Interactive preview     | 520ms    | 220ms |
| Lower content sections  | 680ms    | 260ms |

The implementation uses these observed values in the landing CSS module, with
one entrance per page mount and no added dependency, loading gate or exit delay.
Only opacity and transform animate. Reduced-motion visitors see static content,
matching the reference's accessibility behavior. Keep account-based navigation,
the white/black primary button and the existing public Counter interaction intact.
The stylesheet snapshot is ignored at `work/landing-intro-reference/reference.css`,
SHA-256 `b09be8da6ed186fbdf7d0802a87fed6be1697d5cdddbc7cc73391f1a21fc1aba`.
Runtime computed styles confirmed the same durations, delays and curve; this
establishes the entrance behavior, not the site's application internals.

Animation verification: production browser tests read the real keyframes,
duration, delay and easing; confirmed the final visible state and static,
keyboard-accessible reduced-motion state. Manual browser replay observed the
brand, copy and button at distinct in-flight opacity/translation values, followed
by full opacity and zero translation. The white/black action and verified
Dashboard destination remained intact. No new runtime dependency was added.
