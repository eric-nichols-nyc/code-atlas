# Shared UI patterns

## Starter surfaces

Files: `apps/web/src/app/page.tsx`, `packages/ui/src/components/card.tsx`.
Last updated: 2026-11-09.

| Property       | Pattern                                                 |
| -------------- | ------------------------------------------------------- |
| Background     | Semantic `bg-background` for pages, `bg-card` for cards |
| Border         | `border` using the shared `--border` token              |
| Card radius    | `rounded-xl`                                            |
| Primary text   | `text-foreground` / `text-card-foreground`              |
| Secondary text | `text-sm text-muted-foreground`                         |
| Card spacing   | `py-6`, inner sections `px-6`, `gap-6`                  |
| Page padding   | `px-6 py-16`                                            |
| Card shadow    | `shadow-sm`                                             |

Use the full Card composition. Keep titles in the CardTitle component; use semantic headings through its children when the page needs them. Theme values are defined once in `packages/ui/src/styles/globals.css`.

Dark palette matched to the supplied TraceCode practice reference on 2026-11-10:
page/header `--background: #0e0e0e`, shared panels `--card: #111111`,
overlays `--popover: #141414`, muted surfaces `--muted: #1d1d1d`,
active/secondary surfaces `#242424`, and solid subtle borders `#232323`.
Primary text is `#f9f9f9`; supporting text is `#a3a3a3`. Keep these values in
the shared theme and consume semantic classes throughout the app. Light theme
keeps its existing palette. Difficulty and category accents retain their roles.

## Buttons

File: `packages/ui/src/components/button.tsx`.
Last updated: 2026-11-09.

| Property         | Pattern                                          |
| ---------------- | ------------------------------------------------ |
| Primary action   | Default Button variant; semantic primary colors  |
| Secondary action | `outline` or `ghost` Button variant              |
| Button radius    | `rounded-md`                                     |
| Button text      | `text-sm font-medium`                            |
| Button spacing   | Default `h-9 px-4 py-2 gap-2`                    |
| Hover            | Variant-defined semantic hover colors            |
| Focus            | `focus-visible` ring using the shared ring token |

Use `asChild` for links. The optional `navigation` Button variant changes text color without a hover background, retaining the shared focus ring. Prefer component variants over overriding their colors or typography.
The unused starter preview and Alert, Dialog, Field, RadioGroup, and Separator
primitives were removed; add shared primitives through shadcn when a feature needs them.

## Global navigation

Files: `packages/ui/src/components/global-nav.tsx`, `packages/ui/src/components/brand-icon.tsx`, and each app's `site-nav.tsx`.
Last updated: 2026-11-09.

| Property         | Pattern                                              |
| ---------------- | ---------------------------------------------------- |
| Background       | `bg-background`                                      |
| Border           | `border-b` using the shared border token             |
| Text             | `text-foreground`; brand `font-semibold`             |
| Padding          | `px-6 py-3`                                          |
| Spacing          | `gap-x-4 gap-y-3`; links `gap-1`; actions `gap-2`    |
| Navigation links | Button `ghost` variant; active link uses `secondary` |
| Focus and hover  | Inherited from the shared Button variants            |
| Shadow           | None                                                 |

The shared component receives branding, items, active item ID, optional actions, labels, and a link adapter. Application routes, Next.js hooks, and auth controls belong in consumers. Below the medium breakpoint, a disclosure button reveals the links and actions in document flow. Escape closes it and returns focus to the button; leaving the navigation or selecting a link also closes it. Keep DOM and visual tab order aligned. Each rendered instance owns a unique disclosure ID.

Brand links use a decorative compass icon beside the text, aligned with `inline-flex items-center gap-2`. The icon inherits the text color. Keep the visible name as the link's accessible name and truncate the text before shrinking the icon. Brand content remains supplied by each app.

The Code Atlas brand link returns to the app's home page. The web navigation uses Dashboard as their explicit route item, with no separate Home item.

Consumers may supply `containerClassName` for the inner navigation width. The web app uses the full viewport width on every page. The optional `utilities` slot keeps controls such as the theme switcher visible even when the mobile route links are collapsed. Keep its DOM and visual order aligned with the brand, disclosure, and route links.

On desktop, utilities sit immediately before the account actions, placing the theme switcher to the left of the avatar. Mobile retains an always-visible utility control beside the navigation disclosure. Responsive utility instances are mutually hidden so only one is visible and keyboard-reachable at a time.

## Authentication and account controls

Files: `apps/web/src/components/nav-auth.tsx`, `apps/admin/src/components/nav-auth.tsx`, and each app's `auth-screen.tsx` and `auth-setup.tsx`.
Last updated: 2026-11-09.

| Property        | Pattern                                                |
| --------------- | ------------------------------------------------------ |
| Background      | Inherited `bg-background`; setup cards use `bg-card`   |
| Text            | Shared Button/Card typography and semantic colors      |
| Auth spacing    | `px-6 py-16`; centered within the remaining page space |
| Account spacing | GlobalNav actions use `gap-2`                          |
| Sign-in link    | Button `ghost` variant                                 |
| Sign-up link    | Default Button variant                                 |
| Loading avatar  | Shared Skeleton with `rounded-full` and status text    |
| Profile menu    | Clerk UserButton with its built-in avatar and fallback |
| Focus and hover | Shared Button variants and Clerk's account controls    |
| Shadow          | Shared Card or Clerk defaults                          |

Keep Clerk and session decisions in app-owned components passed through GlobalNav's actions slot. Resolve the session before choosing signed-in or signed-out controls. Mount one account menu in the global navigation; page bodies use it for profile management and sign-out. Auth screens share the same centering and loading pattern, and send active sessions to the dashboard.

## Public home page

Files: `apps/web/src/features/landing/components/landing-page.tsx`, `counter-preview.tsx`; composed by `apps/web/src/app/page.tsx`.
Last updated: 2026-11-10.

| Property       | Pattern                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Background     | Inherited `bg-background`; shared Cards use `bg-card`                                                                                       |
| Text           | Landing-scoped foreground copy, including supporting copy, badges, labels and footer; white in dark mode, readable foreground in light mode |
| Hero heading   | `text-4xl leading-[1.06] font-semibold tracking-[-0.045em]`, larger on wide screens                                                         |
| Hero accent    | White foreground through the landing-only theme scope                                                                                       |
| Page spacing   | `px-5 pt-16 pb-8`, `gap-20` between sections                                                                                                |
| Panels         | Shared Card composition, `rounded-xl border shadow-sm`; `gap-4` between cards                                                               |
| Branding       | Centered 32px BrandIcon and 16px semibold Code Atlas text above the headline; no hero tag                                                   |
| Primary action | One Start practicing link, 48px tall and 208px wide on desktop; white surface with black label in both themes                               |
| Subject status | Amber Badge for available; disabled outline Button for coming soon                                                                          |
| Focus / hover  | Shared Button variants                                                                                                                      |

Use semantic section headings. The public home page has no GlobalNav. Resolve the
hero's Start practicing destination from verified Clerk identity on the server:
signed-in learners go directly to `/dashboard`; other visitors go to `/sign-in`.
Missing Clerk configuration uses the sign-in route without attempting session
access. Keep the hero to branding, headline, description and one action; omit the
Try an example button and the three benefit labels. Other page sections keep their
existing Counter/practice links. List published problems from catalog metadata
and label unfinished subjects "Coming soon".

The preview uses shared Cards, Buttons, Badges and Tabs: foreground captions, `text-sm leading-6` prose, `font-mono text-[13px] leading-7` source with existing code tokens, and `text-5xl font-mono` foreground return values. Description, source and controls stack on narrow screens. Keep card descriptions in their first grid column when an action is hidden. Wrap source lines and retain focus rings. The fixed Counter example supports call, starting-value selection and reset; it never pretends to submit, save or judge learner code. FAQ uses the shared single-open Accordion.

`landing-page.module.css` scopes the foreground aliases to the landing main.
Supporting text, colored badge labels and hero accents render
white in dark mode; action labels stay readable on dark neutral buttons. Coming
soon buttons remain disabled with full-opacity labels. Keep syntax highlighting
inside the source example. Other routes retain their existing semantic colors.
The primary hero action supplies its own white secondary surface and black
secondary foreground through scoped theme tokens; preserve the shared focus ring.
The logo enters immediately, heading/description after 90ms and action after
180ms, each over 680ms. The preview enters over 520ms after 220ms; lower sections
share a 260ms entrance delay. Motion fades opacity 0→1 and moves translateY
16px→0 with `cubic-bezier(0.22,1,0.36,1)`. These are observed TraceCode reference
values, recorded in the landing feature brief. Keep intro motion in the landing
CSS module and animate only transform/opacity; reduced motion removes the entrance
entirely. No JavaScript timer, loading screen, permanent `will-change`, or exit
delay is needed.

## Learner dashboard

Files: `apps/web/src/features/dashboard/`, `apps/web/src/features/catalog/`.
Last updated: 2026-11-09. Reference: Paper **code atlas**, Dashboard desktop/mobile.

| Property        | Pattern                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| Theme           | User-selected shared theme across every route, including navigation and portalled controls |
| Workspace       | Centered 1200px maximum including padding; `px-5 pt-6 pb-8`, then `md:px-6 md:py-12`       |
| Section spacing | 32px mobile, 40px desktop                                                                  |
| Headings        | Page 28/36px mobile, 36/44px desktop; section 22/30px                                      |
| Subject grid    | One column below `lg`, three columns above; 16px/20px gaps                                 |
| Subject cards   | Full shared Card composition; text-only, radius 12px; 20px/24px padding                    |
| Card title      | Shared `CardTitle size="lg"`, 22/28px; semantic `h3` child                                 |
| Topic tags      | Badge variants `blue`, `amber`, `rose`; theme-owned surface, foreground, and border tokens |
| Actions         | Full-width default Button for JavaScript, disabled outline Button for future subjects      |
| Focus and hover | Shared Button variants and Radix dialog focus handling                                     |
| Shadow          | Existing shared Card `shadow-sm`; no added effects                                         |

Map Basics to blue, Functions to amber, and Async to rose in feature-owned metadata. Keep these color variants generic in the UI package. The JavaScript action is a real link to the protected subject landing. State lesson availability honestly; do not display invented progress or link to missing lesson routes. Reuse the shared shell and primitives for later learner screens. Home and dashboard share subject metadata, Card title size and theme; the public landing gives available JavaScript more space and lists its published problems.

## Theme selection

Files: `packages/ui/src/components/theme-provider.tsx`, `packages/ui/src/components/theme-switcher.tsx`, both app root layouts, and `packages/ui/src/styles/globals.css`.
Last updated: 2026-11-09.

| Property                | Pattern                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| Page and overlay colors | Existing semantic tokens; one `.dark` class on the document root         |
| Default                 | Dark; saved Light, Dark, or System preference takes precedence           |
| Trigger                 | Shared ghost Button, icon size, accessible name "Change theme"           |
| Menu                    | Shared DropdownMenu surface, border, radius, padding, and shadow         |
| Selection               | Radio items with a visible indicator and `aria-checked` state            |
| Typography              | Shared menu label and item typography                                    |
| Focus / hover           | Shared Button and DropdownMenu states; Escape and selection return focus |
| Clerk surfaces          | Native `--clerk-*` variables reference the same semantic tokens          |

Wrap each app once with the shared next-themes provider. Keep the trigger stable during hydration and disable it until mounted. Persist the preference across routes and reloads; System tracks OS appearance. Do not add page-specific forced themes or nested dark wrappers. Keep the control in GlobalNav's always-visible utilities slot on small screens. Disable transitions while switching to avoid mismatched color fades.

## Learning workspace and subject landing

Source: `docs/design/learning-layout.md` v0.4 and the Paper page **JavaScript · Workspace & landing**.
Last updated: 2026-11-09. Implemented in `apps/web/src/features/learning/`, `features/catalog/components/javascript-practice.tsx`, and shared resizable/Tabs/Sheet primitives.

| Property                 | Pattern                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| Page / panel surfaces    | Existing `background` and `card` semantic tokens                               |
| Panel borders and radius | 1px shared border; 6px radius; no added shadow                                 |
| Dense body copy          | Arial 14/23px; shared muted foreground for supporting text                     |
| Lesson title             | Arial bold 24/32px                                                             |
| Example code             | Menlo 13/26px; existing syntax roles                                           |
| Active example line      | Basics surface with a visible leading indicator                                |
| Panel spacing            | 16–20px inner padding; 12px workspace inset                                    |
| Splitter appearance      | Subtle 4px grip within a larger interactive region; shared hover/focus tokens  |
| Subject catalog          | Flat rows; fixed ordinal/action slots; title and concise topic tag on one line |
| Unavailable lesson       | Coming soon text and clock icon; no dead navigation or paywall-style lock      |

The coding workspace puts a problem description on the left, editable JavaScript above Testcase/Test Result in the center, and optional unavailable tutor/notes on the right. The visualization and multiple-choice checkpoint are removed. All three splitters resize; closing the tutor releases its column. Mobile uses a reading flow and drawers. Preserve source, editor selection/undo, cases and results above responsive branches.

Shared learning panels use `learning-panel` (`bg-card`, `border`, `rounded-md`, no shadow),42px headers and16–20px inner padding. Problem headings use24/32px; prose14/23px. CodeMirror uses Menlo13/24px, semantic light/dark syntax roles and local assets. Default Tab exits the editor; Mod-Enter runs. Lazy editor loading reserves its space. Show Saved to account only after a successful database write/read; ordinary typing is Unsaved edits and latest verdicts remain session results.

The problem description is continuous, with no left-panel tabs or Submissions view. Hints and Solution use shared Accordion rows; Testcase/Test Result retain shared line Tabs. Cases use shared Buttons and labeled numeric Input. Verdicts are server results with text labels, bounded diagnostics and explicit stale-code warnings. Hidden cases never expose private values/logs. Tutor and Notes remain unavailable. Counter (Closures), Filter Elements from Array (Arrays), Debounce and Sleep (Async) are published practice problems. Learn remains future work.

Feature CSS in `apps/web/src/app/globals.css` owns viewport containment and editor layout; shared primitives/tokens remain in UI. Split mode contains document scrolling; route exit removes the root mode attribute and restores ordinary scrolling. Sheets disable animation for reduced-motion preferences.

## JavaScript sections and practice navigation

Files: `apps/web/src/components/site-nav.tsx`, `packages/ui/src/components/global-nav.tsx`,
`apps/web/src/features/catalog/components/javascript-practice.tsx`,
`apps/web/src/app/javascript/learn/page.tsx`, and the practice workspace toolbar.
Last updated: 2026-11-09.

| Property          | Pattern                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Section links     | GlobalNav text appearance with decorative book/code icons; active text and `aria-current="page"`, no hover background                  |
| Link spacing      | Existing `gap-1`; centered as one group on desktop                                                                                     |
| Header appearance | Existing background/border, Button text/focus states and `px-6 py-3`; no new colors, shadow or decoration                              |
| Placement         | `itemsAlign="center"` uses equal side columns; brand and Dashboard left, section links at the viewport center, utilities/account right |
| Mobile            | Existing disclosure in document flow; Escape restores focus, selecting a route closes the menu                                         |
| Availability      | Learn opens a clearly labeled coming-soon page; Interview remains deferred                                                             |

For `/javascript` and descendants, the app supplies Learn / Practice as centered section links and Dashboard as a
leading link beside Code Atlas. Problem routes `/javascript/practice/<problem>` omit the global header and use a compact Back link to Practice. Other
routes retain Dashboard navigation. Keep JavaScript routes and auth decisions outside
the shared UI package. The page body does not duplicate section links.

JavaScript owns `/javascript/practice` and `/javascript/learn`; `/javascript` opens Practice.
Practice lists coding problems only; problem rows open canonical
`/javascript/practice/<problem>` links. Learn curriculum remains unspecified. Page and workspace
breadcrumbs are removed; the Back link returns to Practice.
Keep route navigation as semantic links, not state-only tabs. Preserve the shared theme
and responsive workspace behavior. Old `/learn/javascript` links redirect to Practice.

Dashboard is application-level navigation through the generic `leadingItems` prop.
It remains available outside JavaScript for selecting subjects. On mobile, leading
links appear first in the disclosure; only one responsive instance is visible at a time.
Learn and Practice remain subject-level links, and page headings identify the current area.

## Practice catalog categories

Files: `apps/web/src/features/catalog/components/javascript-practice.tsx`,
`apps/web/src/features/catalog/lib/practice-catalog.ts`, and
`apps/web/src/content/javascript/practice/catalog.ts`.
Last updated: 2026-11-10. Reference: TraceCode practice category sidebar and list.

| Property        | Pattern                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Categories      | Shared vertical Tabs with `TabsList variant="panel"`: bordered `bg-card`, `rounded-md`, `p-3`, `gap-1`; active item uses `bg-accent` without shadow; 45px minimum trigger height |
| Category icons  | Decorative Star/Braces/Layers/Repeat2/Timer for Recommended/Closures/Arrays/Generators/Async; semantic purple/amber/blue/pink/cyan colors and shared icon size                   |
| Category counts | Secondary Badge with real published counts; result count announced in the selected panel                                                                                         |
| Main heading    | Subject heading 40/50px on desktop; panel headings 20/28px, supporting text muted                                                                                                |
| Row surface     | Shared Table in one `bg-card` surface with border and rounded-md corners; `TableRow variant="striped"` uses `even:bg-muted/30`, hover `bg-muted/70`; no shadow                   |
| Row spacing     | 58px minimum row height, 8px vertical cell padding; 20px desktop outer gutters, 32px flag area, aligned title/header and fixed metadata columns                                  |
| Row labels      | Flag and problem title link, Difficulty, Topic and Solved; no description beneath the title                                                                                      |
| Search          | Decorative Search icon inside the input, hidden accessible label, and shared Select for difficulty; empty results can clear filters                                              |

Recommended is an explicit curated view; each topic category lists its published
problems. All published problems are recommended and appear in their own topic category. Do not duplicate problem records for
recommendations, invent progress or show empty topic categories. Desktop places
categories beside the list; narrow screens stack categories above it. Tabs own
keyboard navigation and selection. Keep the global header separate from content
filtering. The page title has no supporting subtitle. Use semantic table headings and a single
title link per problem. Search, category and difficulty filters intersect; clearing filters
preserves the selected category. Keep table overflow contained on narrow screens.
The unfiltered difficulty option reads "Difficulty". The controls row uses
`sm:items-center` so the 32px dropdown is vertically centered beside the 44px
search field, including when the controls wrap below the table heading.
The difficulty trigger/menu and search field use square corners (`rounded-none`).
Place the live result count right-aligned above the table card, outside its
toolbar. Keep its status semantics and update it when search/category filters change.
At a panel width of at least 700px, keep the heading and controls
on one row. Use the named `practice` container query with `flex-nowrap`; keep
the title and 148px dropdown intact while the search field takes the
remaining space, up to 320px. Below that panel width, allow the toolbar to wrap
and keep the existing stacked mobile controls. This is based on panel space,
so the 280px category sidebar does not force an early wrap at 1186px viewports.

Measured directly from the [live reference](https://tracecode.app/practice) on
2026-11-10 using DOM bounds and computed styles, at a **1280 × 720 CSS-pixel
viewport with device pixel ratio 1**. Code Atlas was checked at the same viewport:

| Measurement                               | Reference and Code Atlas               |
| ----------------------------------------- | -------------------------------------- |
| Page maximum width                        | 1920px, centered; computed CSS maximum |
| Desktop page side padding                 | 56px                                   |
| Desktop content width at 1280px           | 1168px                                 |
| Sidebar outer width                       | 280px                                  |
| Sidebar border / inner padding            | 1px / 12px each side                   |
| Category button width                     | 254px = 280 − 2 borders − 24 padding   |
| Category button height / gap              | 45px / 4px                             |
| Sidebar-to-table gap                      | 24px                                   |
| Table panel / inner table width at 1280px | 864px / 862px                          |
| Table toolbar height                      | 85px when controls share one row       |
| Table header / normal row height          | 44.5px / 58px                          |
| Difficulty / topic column width           | 112px / 190px                          |
| Solved area                               | 72px plus 20px right gutter            |
| Search input / difficulty control width   | 320px / 148px                          |
| Search input / difficulty control height  | 44px / 32px                            |

Use `max-w-[1920px]`, `lg:px-14`, `gap-6` and
`lg:grid-cols-[280px_minmax(0,1fr)]`. Below 1024px, Code Atlas stacks its existing
category controls above the table; page side padding is 32px from 768px and 20px
below that. Long content may increase row height and toolbar controls may wrap.
The fluid Problem column takes the remaining space. Keep the semantic table and
the existing Code Atlas navigation, content and controls. Measurements describe
CSS layout pixels, not pixels in a scaled screenshot. When matching another
reference, inspect its live bounds, box sizing and breakpoints before choosing
container dimensions; record the viewport and distinguish outer width, padding
and interactive content width.

## Focused problem workspace

Files: `apps/web/src/components/site-nav.tsx` and
`apps/web/src/features/learning/components/learning-workspace.tsx`.
Last updated: 2026-11-09. Reference: TraceCode binary-search workspace.

| Property          | Pattern                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Global navigation | Omitted on individual JavaScript problem routes; retained on catalog and Learn pages                 |
| Back action       | Shared ghost Button, small size, decorative ArrowLeft icon and a real link to `/javascript/practice` |
| Workspace toolbar | Existing background/border, `px-3 py-2`, wrapping controls with `gap-2`; no brand or subject links   |
| Tools             | Back link with AI tutor and Notes icons; editor header owns its icon controls                        |

Keep authentication and theme providers mounted. The compact toolbar participates in
workspace height measurement, allowing panes to use the space released by the global
header. Back always returns to Practice, including after directly opening a problem.
The Problems drawer and Reset layout control are removed. AI uses Sparkles and
Notes uses NotebookPen, both shared icon Buttons. Each opens its matching tab in
the existing panel/drawer; clicking the active icon closes the panel. Use a visible
active state, accessible Show/Hide names and titles, and `aria-expanded`. Closing
the mobile drawer restores focus to the icon that opened it.

## Problem help and editor controls

Files: `packages/ui/src/components/accordion.tsx`,
`apps/web/src/features/problems/components/description-panel.tsx`, `code-panel.tsx`,
and `state/problem-session.tsx`. Last updated: 2026-11-09.

| Property             | Pattern                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| Description          | Existing panel and 20px padding; title, prose, examples and constraints stay visible             |
| Help rows            | Shared Accordion with multiple independently open rows; Hint 1, Hint 2, then Solution            |
| Accordion appearance | Shared border, 16px vertical trigger padding, text-sm font-medium, native focus ring and chevron |
| Motion               | Default accordion reveal; reduced-motion disables reveal and chevron transitions                 |
| Code header actions  | Shared ghost icon Buttons for Share and Reset code, followed by the shared theme switcher        |
| Availability         | Share is visibly disabled and named Share code (coming soon)                                     |
| Execution actions    | Run and Submit stay beneath the editor; no Reset layout action                                   |

Keep help expansion in the problem session above adaptive branches. Solution reveals
the authored code and explanation below the hints. Remove left-tab selection and
submission-history state; keep the latest real result in Test Result. Reset code is
only enabled for an edited source and restores starter code. Icons have accessible
names; tooltips identify the reset/share actions.

## Difficulty and category colors

Files: `packages/ui/src/styles/globals.css`, `packages/ui/src/components/badge.tsx`,
`apps/web/src/features/catalog/components/difficulty-badge.tsx`. Last updated: 2026-11-09.

Use semantic `difficulty-easy` (green), `difficulty-medium` (amber), and
`difficulty-hard` (red) tokens through the shared Badge variants in both catalog
and problem headers. Category icons use `category-recommended` (purple),
`category-closures` (amber), `category-arrays` (blue), `category-generators` (pink), and `category-async` (cyan). Tokens have separate
light/dark values; labels remain visible so meaning never depends on color alone.

GlobalNav items may supply an icon component and `appearance="text"`. Learn/Practice
use this appearance with BookOpen/CodeXml, while retaining centering, mobile keyboard
behavior, and accessible link names. Dashboard and account controls retain their own variants.

## Row flags and solved status

Files: `apps/web/src/features/catalog/components/javascript-practice.tsx` and
`state/practice-records.ts`. Last updated: 2026-11-09.

Use a shared ghost icon Button with a decorative Flag and `aria-pressed`. Flagged
icons use a solid red fill (`fill-current text-destructive`); accessible names identify the
problem and whether clicking flags or unflags it. Solved is a read-only CircleCheck
in the Easy green token; unsolved uses a muted Circle. The status name and title identify account-backed records. Only a server-judged accepted Submit marks solved.
Retain old browser completion separately as unverified history; its title requests an accepted resubmission.
Namespace browser backups to the authenticated learner. Show account loading, failure and Retry progress without claiming a local flag is saved. Keep flag clicks separate from
problem navigation. On mobile, hide the separate Topic column and group its badge
with Difficulty, retaining the flag, title and solved indicator without page overflow.
Dashboard uses a decorative LayoutDashboard icon through GlobalNav's item icon prop.

Case fields remain labeled shared Input/Select controls: Sleep takes millis; Counter
takes a start and invocation count; Debounce takes a delay and JSON call schedule;
Filter takes a JSON array and a supplied callback with its source shown below. Keep
JSON fields and output arrays inside their panes, and reject invalid drafts before Run.
Promise fulfillment delay uses `ms` and a JSON `functions` field of `{t, value}`
descriptors, with help explaining that `t` is each original function's delay.
Both timing fields allow 0–1000ms, and an empty descriptor array is valid. Reuse
the existing Input controls and inline validation feedback.
Fibonacci Generator uses a single count field (0–50), with supporting text clarifying
that it controls `.next()` calls and is not an argument to the learner's function.

## Account progress and saved code

Files: `features/catalog/state/practice-records.ts`, `features/problems/state/problem-session.tsx`, and code panel.
Last updated: 2026-11-09.

Reuse existing muted text, bordered error rows and shared small Buttons. The editor footer distinguishes
Loading saved code, Saved to account, Unsaved edits, and Not saved to account; Retry saved code retries reads.
Run/Submit save the submitted source, while later typing stays unsaved. Restoring a delayed response must
never replace typing or Reset. Flag controls disable during initial loading and their own write; account
errors retain browser backups and expose Retry progress. Keep verdicts separate from save status.
