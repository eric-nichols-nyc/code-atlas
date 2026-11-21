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

Brown replaces the optional Dark purple palette on 2026-11-20. Its colors
match the live Code Drill dark theme and its shared stylesheet, including the app's
white-copy overrides. Use the `.brown` root class with warm charcoal backgrounds
and cards `oklch(0.2679 0.0036 106.6427)`, cream muted text
`oklch(0.7713 0.0169 99.0657)`, white main copy, terracotta primary/focus accents
`oklch(0.6724 0.1308 38.7559)`, and warm borders
`oklch(0.3618 0.0101 106.8928)`. Popovers, secondary, muted, accent and input tokens
also come directly from Code Drill. Keep semantic status/category colors and dark
editor syntax. The shared provider maps the stored `dark-purple` preference to the
`brown` class; the menu labels it Brown. Existing saved preferences therefore pick
up the new palette immediately, without discarding workspace state.

Verification: the 17 shared palette values match Code Drill's live computed colors.
Signed-in dashboard/workspace review confirmed Brown selection, reload persistence,
readable editor/input surfaces, and working Light/Dark choices. Root lint, typecheck,
credential-free build, 28 relevant workspace tests and `git diff --check` passed.
Screenshots are ignored under `outputs/code-drill-test-runner/brown-*.jpg`.

## Buttons

File: `packages/ui/src/components/button.tsx`.
Last updated: 2026-11-20.

| Property         | Pattern                                                                            |
| ---------------- | ---------------------------------------------------------------------------------- |
| Primary action   | Default Button variant; semantic primary colors                                    |
| Secondary action | `outline` or `ghost` Button variant                                                |
| Colored actions  | `success` (green), `warning` (amber), `info` (blue), with paired foreground tokens |
| Button radius    | `rounded-md`                                                                       |
| Button text      | `text-sm font-medium`                                                              |
| Button spacing   | Default `h-9 px-4 py-2 gap-2`                                                      |
| Hover            | Variant-defined semantic hover colors                                              |
| Focus            | `focus-visible` ring using the shared ring token                                   |

Use `asChild` for links. The optional `navigation` Button variant changes text color without a hover background, retaining the shared focus ring. Prefer component variants over overriding their colors or typography.
Colored variants use their matching focus ring and 90% hover background. Shared
theme tokens pair green `#34d399` with `#052e24`, amber `#fbbf24` with `#422006`,
and blue `#60a5fa` with `#102a4c` in every theme. Use `interactive` for green
text/indicators: `#087a4b` in Light and `#34d399` in both dark palettes.
The unused starter preview and Alert, Dialog, Field, RadioGroup, and Separator
primitives were removed; add shared primitives through shadcn when a feature needs them.

## Global navigation

Files: `packages/ui/src/components/global-nav.tsx`, `packages/ui/src/components/brand-icon.tsx`, and each app's `site-nav.tsx`.
Last updated: 2026-11-14.

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

The web header uses `sticky top-0 z-40` to stay visible during document scrolling. Its opaque `bg-background` keeps content readable beneath it; shared menus and dialogs retain their overlay stacking.

On desktop, utilities sit immediately before the account actions, placing the theme switcher to the left of the avatar. Mobile retains an always-visible utility control beside the navigation disclosure. Responsive utility instances are mutually hidden so only one is visible and keyboard-reachable at a time.

Consumers may opt into `mobileSections` for persistent section links. This layout
uses a compact two-row grid below `lg`: consumer branding/context and utilities
on the first row, section links and the account disclosure on the second. Section
links stay outside the disclosure and use 44px minimum targets. At `lg`, links
are centered between equal side columns, with utilities/account actions on the
right. The default layout retains its existing `md` disclosure behavior.

## Authentication and account controls

Files: `apps/web/src/components/nav-auth.tsx`, `apps/admin/src/components/nav-auth.tsx`, and each app's `auth-screen.tsx` and `auth-setup.tsx`.
Last updated: 2026-11-09.

| Property        | Pattern                                                         |
| --------------- | --------------------------------------------------------------- |
| Background      | Inherited `bg-background`; setup cards use `bg-card`            |
| Text            | Shared Button/Card typography and semantic colors               |
| Auth spacing    | `px-6 py-16`; centered within the remaining page space          |
| Account spacing | GlobalNav actions use `gap-2`                                   |
| Sign-in link    | Button `ghost` variant                                          |
| Sign-up link    | Default Button variant                                          |
| Loading avatar  | Shared Skeleton with `rounded-full` and status text             |
| Profile menu    | Shared Avatar + DropdownMenu with initials fallback             |
| Focus and hover | Shared Button variants and shared DropdownMenu account controls |
| Shadow          | Shared Card and DropdownMenu tokens                             |

Keep Neon Auth and session decisions in app-owned components passed through GlobalNav's actions slot. Resolve the session before choosing signed-in or signed-out controls. Mount one account menu in the global navigation; page bodies use it for account identity and sign-out. Auth screens share the same centering and loading pattern, and send active sessions to the dashboard.

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
hero's Start practicing destination from verified Neon Auth identity on the server:
signed-in learners go directly to `/dashboard`; other visitors go to `/sign-in`.
Missing Neon Auth configuration uses the sign-in route without attempting session
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
Last updated: 2026-11-14.

| Property                | Pattern                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| Page and overlay colors | Semantic tokens; root `.light`, `.dark`, or `.dark-purple` class            |
| Default                 | Dark; saved Light, Dark, Dark purple, or System preference takes precedence |
| Trigger                 | Shared ghost Button, icon size, accessible name "Change theme"              |
| Menu                    | Shared DropdownMenu surface, border, radius, padding, and shadow            |
| Selection               | Radio items with a visible indicator and `aria-checked` state               |
| Typography              | Shared menu label and item typography                                       |
| Focus / hover           | Shared Button and DropdownMenu states; Escape and selection return focus    |
| Neon Auth surfaces      | Shared Card, Field, Input, Button and Avatar use semantic tokens            |

Wrap each app once with the shared next-themes provider. Keep the trigger stable during hydration and disable it until mounted. Persist the preference across routes and reloads; System tracks OS appearance. Do not add page-specific forced themes or nested dark wrappers. Keep the control in GlobalNav's always-visible utilities slot on small screens. Disable transitions while switching to avoid mismatched color fades.

Both dark palettes activate Tailwind's `dark` variant and CodeMirror's dark
appearance. CSS owns `color-scheme` so custom palettes render native controls
correctly before hydration and after switching from Light.

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

The coding workspace puts Problem, Solution, and Notes tabs on the left, editable JavaScript above Testcase/Test Result/Feedback in the center, and the optional AI tutor on the right. The visualization and multiple-choice checkpoint are removed. All three splitters resize; closing the tools panel releases its column. Mobile uses a reading flow and drawers. Preserve source, editor selection/undo, cases and results above responsive branches.

Shared learning panels use `learning-panel` (`bg-card`, `border`, `rounded-md`, no shadow),42px headers and16–20px inner padding. Problem headings use24/32px; prose14/23px. CodeMirror uses Menlo13/24px, semantic light/dark syntax roles and local assets. Default Tab exits the editor; Mod-Enter runs. Lazy editor loading reserves its space. Show Saved to account only after a successful database write/read; ordinary typing is Unsaved edits and latest verdicts remain session results.

The Problem tab shows the continuous problem description and is selected by default. Solution is the second tab, with authored code and an explanation; Notes is third. Hints use shared Accordion rows in Problem; Testcase/Test Result retain shared line Tabs. Cases use shared Buttons and labeled numeric Input. Verdicts are server results with text labels, bounded diagnostics and explicit stale-code warnings. Hidden cases never expose private values/logs. Tutor uses the question-triggered chat described below; Notes uses the private note editor described below. Counter (Closures), Filter Elements from Array (Arrays), Debounce and Sleep (Async) are published practice problems. Learn has a module catalog and read-only Two Pointers preview; guided lessons remain future work.

Practice color accents updated 2026-11-20, using the
[AlgoMaster solution workspace](https://algomaster.io/practice/dsa/contains-duplicate-ii/solution?list=am-300)
as a reference. Shared `TabsList variant="line" tone="accent"` makes selected
Problem/Solution/Notes and output tabs use green text and an underline. Selected cases
and Run use the `success` Button variant; Evaluate uses `warning`, and Submit
uses `info`. Run/Submit include decorative Play/Send icons alongside their
labels. Problem inline code uses `interactive` text over an 8% green tint;
example blocks use `border-interactive/50 bg-interactive/5`. Keep these colors
in shared semantic tokens and retain the existing panel surfaces, spacing,
visible labels, pressed/selected semantics and disabled behavior.

Feature CSS in `apps/web/src/app/globals.css` owns viewport containment and editor layout; shared primitives/tokens remain in UI. Split mode contains document scrolling; route exit removes the root mode attribute and restores ordinary scrolling. Sheets disable animation for reduced-motion preferences.

## Subject headers and section navigation

Files: `apps/web/src/components/site-nav.tsx`, `packages/ui/src/components/global-nav.tsx`,
`packages/ui/src/components/technology-icons.tsx`,
`apps/web/src/features/catalog/components/javascript-practice.tsx`,
`apps/web/src/app/javascript/learn/page.tsx`, and the practice workspace toolbar.
Last updated: 2026-11-14.

| Property          | Pattern                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Section links     | GlobalNav text appearance with decorative book/code icons; active text and `aria-current="page"`, no hover background             |
| Link spacing      | Existing `gap-1`; centered as one group on desktop                                                                                |
| Header appearance | Shared background/bottom border, navigation Button text/focus states, no shadow; `px-4 py-3`, `md:px-6`                           |
| Context           | Arrow + Dashboard navigation Button (`sm`, 44px minimum below `lg`), then a `border-s pl-3` divider and topic icon + full name    |
| Topic identity    | `text-sm font-semibold`, `gap-2`, decorative `size-5` icon; yellow JS tile, React atom, Algorithms Workflow icon                  |
| Placement         | `mobileSections` centers section links at `lg`; Dashboard/topic left, theme/account right                                         |
| Mobile            | Dashboard/topic/theme remain visible on the first row; Learn/Practice and account disclosure on the second; Escape restores focus |
| Topic accents     | Shared `brand-javascript`/foreground, `brand-react`, and `brand-algorithms` tokens; no inline page colors                         |
| Availability      | Learn opens a module catalog with a Two Pointers preview; Interview remains deferred                                              |

For JavaScript, React, and Algorithms routes with global navigation, the app
supplies one explicit Dashboard link and the current topic identity instead of
the Code Atlas brand group. Learn / Practice stay within the subject; React
Practice remains development-only. Focused practice routes omit this header and
use their existing subject-local Back link. Other app routes retain the compass
and Code Atlas brand. Keep route/topic/auth decisions outside the shared UI
package. The page body does not duplicate section links.

JavaScript owns `/javascript/practice` and `/javascript/learn`; `/javascript` opens Practice.
Practice lists coding problems only; problem rows open canonical
`/javascript/practice/<problem>` links. Learn lists module previews; individual lesson design remains unspecified. Page and workspace
breadcrumbs are removed; the Back link returns to Practice.
Keep route navigation as semantic links, not state-only tabs. Preserve the shared theme
and responsive workspace behavior. Old `/learn/javascript` links redirect to Practice.

Outside subject routes, Dashboard remains application-level navigation through
the generic `leadingItems` prop. Subject routes supply their always-visible Back
link through consumer-owned brand content. Crossing between a subject and the
Dashboard resets the disclosure. Topic names remain visible alongside icons;
color and symbols alone never identify the current subject. The theme-aware
React mark uses darker cyan on Light; Algorithms uses violet/lavender across the
three themes. The yellow JS tile retains its dark monogram in every theme.

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
| Tools             | Back link with AI tutor icon; editor header owns its icon controls                                   |

Keep authentication and theme providers mounted. The compact toolbar participates in
workspace height measurement, allowing panes to use the space released by the global
header. Back always returns to Practice, including after directly opening a problem.
The AI tutor uses a shared icon Button with Sparkles. Clicking the icon toggles
the docked panel or mobile drawer. Use a visible
active state, accessible Show/Hide names and titles, and `aria-expanded`. Closing
the mobile drawer restores focus to the icon that opened it.

## Problem help and editor controls

Files: `packages/ui/src/components/accordion.tsx`,
`apps/web/src/features/problems/components/description-panel.tsx`, `solution-panel.tsx`,
`code-panel.tsx`, and `state/problem-session.tsx`. Last updated: 2026-11-20.

| Property             | Pattern                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| Description          | Existing panel and 20px padding; title, prose, examples and constraints stay visible             |
| Help rows            | Shared Accordion with multiple independently open Hint rows in Problem                           |
| Accordion appearance | Shared border, 16px vertical trigger padding, text-sm font-medium, native focus ring and chevron |
| Motion               | Default accordion reveal; reduced-motion disables reveal and chevron transitions                 |
| Code header actions  | Shared ghost icon Buttons for Share and Reset code, followed by the shared theme switcher        |
| Availability         | Share is visibly disabled and named Share code (coming soon)                                     |
| Execution actions    | Evaluate, Run and Submit stay beneath the editor; no Reset layout action                         |

Keep hint expansion and the selected tab above adaptive branches. Solution is its
own scrollable tab between Problem and Notes, with 20px padding, an 18px semibold
heading, a bordered rounded-md code block, and 14px muted explanation text. Code
overflow stays inside the block; no additional reveal control is needed. Keep the
latest real result in Test Result. Reset code is
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
Curry reuses the supplied-callback Select and source preview, followed by a labeled
JSON `groups` Input. Each inner array represents one call; supporting text shows
the selected callback's arity and explains that only the final group completes it.
Keep the controls inside the scrollable results pane. Numeric expected/actual
outputs use explicit undefined checks so a valid zero is displayed as `0`.
Flatten Nested Array reuses the labeled JSON `arr` Input without a callback selector
or numeric field. Its help text states the 20-level and 1000-node limits, and
invalid nesting/value types use the existing inline Run validation feedback.

### Test result case details

Files: `features/problems/components/result-panel.tsx`, `test-result-panel.tsx`.
Last updated: 2026-11-20. Captured with the imprint workflow from the Code Drill
interaction update.

| Property       | Pattern                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Container      | Existing `learning-panel`, semantic `bg-card` and `border`                                        |
| Verdict        | `text-sm font-semibold`, `text-interactive` for accepted, `text-destructive` for failure          |
| Case tabs      | Shared Tabs with transparent list, `gap-1`, `px-2.5 text-xs`, active `bg-muted`, no active shadow |
| Case status    | Decorative Check/X in semantic green/destructive; accessible name includes verdict                |
| Value boxes    | `rounded-md border bg-muted/40 px-3 py-2.5`, `font-mono text-sm leading-relaxed`                  |
| Field labels   | `text-xs font-medium text-muted-foreground`; parameter labels also `font-mono`                    |
| Stdout label   | `rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary`                            |
| Detail spacing | `p-4`, `gap-5` between sections; `gap-2` between label and value                                  |
| Focus / hover  | Inherit shared Tabs keyboard focus ring and hover text                                            |

Keep the output tabs, verdict and case selector above the scrollable detail body.
Output tabs include decorative icons; use 12px labels/icons and compact spacing
on mobile, restoring the existing 14px labels and 16px icons on wider screens.
Contain long case rows in their own horizontal scroller and long values in their
boxes. Show one captured case at a time in Input, Stdout, Output, Expected order;
Sleep uses Observed delay. Empty stdout is explicit, errors have a labeled value
box, and private cases show only status and a privacy explanation. Preserve result
selection in session state across layout remounts; new executions begin at Case 1.
Testcase editing and AI Feedback remain independent.

## Account progress and saved code

Files: `features/catalog/state/practice-records.ts`, `features/problems/state/problem-session.tsx`, and code panel.
Last updated: 2026-11-09.

Reuse existing muted text, bordered error rows and shared small Buttons. The editor footer distinguishes
Loading saved code, Saved to account, Unsaved edits, and Not saved to account; Retry saved code retries reads.
Run/Submit save the submitted source, while later typing stays unsaved. Restoring a delayed response must
never replace typing or Reset. Flag controls disable during initial loading and their own write; account
errors retain browser backups and expose Retry progress. Keep verdicts separate from save status.

## Neon Auth forms

Sign-in and sign-up, including their nested routes, omit GlobalNav. Other application
pages retain their existing navigation.

Use one app-owned AuthForm for sign-in, sign-up, password reset and email verification.
Center a shared Card (`max-w-md`) in AuthScreen. Use Field/FieldLabel with Input,
a full-width primary submit, inline alert/status feedback, and an outlined Google action.
Pending operations disable form controls. Password recovery uses an email code.
Keep SDK calls and session decisions in the app, and all colors in semantic tokens.
The account avatar uses initials when no image is available; its DropdownMenu provides
identity and sign-out, including explicit failure feedback.

## Additional JavaScript practice inputs

Map Array, Reduce Array and Memoize use the existing supplied-callback Select with
its source preview. Their labeled JSON fields are `arr`, `nums` and `calls`.
Reduce adds numeric `init`; Chunk Array uses JSON `arr` and numeric `size`.
Majority Element uses only JSON `nums`, with a strict-majority guarantee and
1–1000 integer bounds; its result is a number, including zero or negative values.
Function Composition uses a JSON list of function IDs, the supplied functions'
source preview and numeric `x`. Keep JSON help/bounds and validation inside the
results pane, with shared Input/Label/Select controls and semantic tokens.
Chunk outputs are nested arrays; Memoize outputs `{values,callCount}`. Reuse the
existing bounded JSON result presentation, including valid zero and empty arrays.

## Electron desktop frame and connection state

`apps/desktop` wraps the existing web UI in a standard native window (1440×960 initial,
360×600 minimum), retaining the title bar and native Edit/View/Window menus. Reuse all
web layouts, shared components and semantic theme tokens; do not fork practice UI for desktop.
The renderer receives no native bridge. Safe external HTTPS links use the system browser.
Desktop sign-in uses the same form with email/password; replace Google with an explanatory
muted paragraph. This is a presentation choice, never an authorization boundary.

The server-unavailable screen is packaged native-shell HTML with no scripts: dark
`#0e0e0e` background, `#f9f9f9` heading, `#a3a3a3` supporting text, a white Try again
link styled as a button, and a visible keyboard focus ring. Keep it readable on narrow
windows. Retry navigates to the configured origin. Do not imply offline execution or
show an accepted/saved state without the server response.

## Private problem notes

Files: `features/problems/components/problem-notes.tsx`, `problem-notes-editor.tsx`,
`state/problem-notes.tsx`, and `problem-experience.tsx`.
Last updated: 2026-11-20.

Use shared line Tabs in the 42px problem pane header, ordered Problem, Solution,
then Notes. The notes body uses 12px padding, FieldGroup/Field/FieldTitle,
a bordered rounded-md editor, and shared small Buttons. Load BlockNote on demand.
Use its slash menu and selection toolbar for block insertion and rich-text
formatting. Use the workspace card colors for the editor and the current theme
for BlockNote controls. Keep long links wrapped and the note pane scrollable.

Keep notes state and the selected tab above responsive layout branches. Show Loading your notes, No saved notes
yet, Unsaved changes, Saving, Saved with the confirmed account timestamp, or Not saved
to account. Use status text, inline FieldError, and explicit Retry loading/saving
notes or Sign in. A failed initial read blocks editing. Preserve later typing when
a save completes, and preserve drafts when switching tabs or resizing. Display the draft
lifetime near Save: unsaved changes end when leaving/reloading the problem. Notes
Save, Reset code, progress, and Run/Submit have independent effects.

## Problem AI tutor

Files: `features/problems/components/problem-tutor.tsx`, `state/problem-tutor.tsx`,
and shared `message`, `message-scroller`, `bubble`, and `textarea` primitives.
Last updated: 2026-11-14.

Use an AI tutor heading in the 42px docked panel header and as the mobile Sheet title. State
belongs above adaptive branches; one tutor body is mounted at a time. Use the shared
MessageScroller for streaming follow and its jump-to-latest control. Use Message with
You/AI tutor headers, muted user Bubble and ghost assistant Bubble. The transcript has
12px padding and a 20px exchange gap. Composer uses FieldGroup/Field/FieldLabel with
shared Textarea and small Buttons. Enter inserts a newline; Mod-Enter sends only while
the composer is focused. Preserve CodeMirror's separate Mod-Enter Run behavior.

Use semantic card/background/muted/foreground/border tokens. Tutor Markdown is 14px
with 1.65 line height; fenced code is Menlo 12px, 12px padding, shared border/muted
background and 6px radius, with horizontal scrolling contained in the code block.
Render no raw HTML or remote images; only safe HTTPS links are interactive. The textarea
keeps mobile 16px type, a 64px minimum and 128px maximum height, and no resize handle.

Keep current-code/context and visit-only chat lifetime copy near Send. Use a separate
polite status row for sending/receiving/completed states rather than announcing every
stream delta. Indicate changed code beside its earlier answer. Preserve partial output
with stopped/failed feedback and an explicit Retry with current code action. Empty,
loading, limit, configuration and sign-in states retain source/questions and never
claim that code was executed or saved. Closing the mobile drawer restores its trigger.

## Code evaluation feedback

Files: `features/problems/components/code-evaluation.tsx`, `code-panel.tsx`,
`result-panel.tsx` and `state/code-evaluation.ts`. Last updated: 2026-11-19.

Evaluate remains a small outline Button with Sparkles beside Run/Submit. It selects
Feedback; Run/Submit select Test Result. Keep the three shared line tabs in the same
panel, with visit-owned state above responsive branches. Switching tabs preserves
both results and the current draft. Loading, Stop, retry and stale-source states
belong to Feedback; Test Result contains judge verdicts only.

The score uses CardTitle's `lg` preset with green/amber/rose semantic accents and a
shared easy/amber/rose Badge label. Overall thresholds: 9–10 strong, 6–8 needs
improvement, 0–5 needs attention. Rubric scores use green for full credit, amber for
partial credit and rose for zero, paired with text labels. Each rubric section has
a 4px colored left border, shared border/card tokens, rounded-lg corners, 16px
padding and 12px gaps. Body copy stays 14px with relaxed leading. Time/Space use
shared blue Badges and 12px monospaced values. Improvements use a blue-accented
border/heading. Use existing theme tokens; never rely on color alone.

In local sample-enabled previews, Feedback offers a small toggle Button labeled
Use sample feedback with `aria-pressed`. Show Sample feedback above the report and
Sample mode beside Evaluate. Explain that the fixed example does not assess current
code or call AI; expose its source in a keyboard-operable details disclosure. Sample
mode survives layout/tab changes, keeps the previous AI report, and resets on visit
exit. Controls are disabled during execution or an active evaluation. Sample reports
do not receive misleading stale-code warnings.

Use shared Card composition, a separate polite status row, readable error text and
contained code overflow. Prose is plain text with wrapping; model HTML, images and
links are never rendered. Keep focus rings and numeric/status labels in every theme.

## JavaScript learning catalog and module preview

Files: `features/learning/components/javascript-learn.tsx`,
`learning-module-overview.tsx`, and `learning-module-overview.module.css`.
Last updated: 2026-11-14.

| Property           | Pattern                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Catalog surface    | Match Practice: semantic `bg-card`, shared border, `rounded-md`, no shadow                                 |
| Catalog typography | Same 28/36px mobile and 40/50px desktop heading; 20/28px table heading                                     |
| Categories         | Existing vertical panel Tabs, 45px triggers, semantic Recommended/Arrays icons and real module counts      |
| Controls and rows  | Practice toolbar spacing, square search/select corners, right-aligned live result count, 58px striped rows |
| Learning labels    | Module / Difficulty / Topic / Lesson outlines; no account flag or solved column                            |
| Preview panels     | `bg-card border rounded-md p-5`, no shadow; shared Badge and ghost small Back to Learn Button              |
| Prose              | Existing MDX 14/23px body and muted foreground; inline code uses shared semantic tokens                    |
| Example            | Menlo 13/24px, 16px padding, shared muted background and border, 6px radius; local horizontal scrolling    |
| Focus and hover    | Shared controls and title-link focus ring/underline; no custom accent palette                              |

Use Practice's 1920px catalog maximum, 56px desktop gutters, 280px sidebar,
and 24px gap. Stack categories below 1024px; group topic under difficulty below
640px and retain a compact outline count. Keep filter state above category
content and preserve it across theme/width changes. Counts refer to published
modules and authored outlines, not completed lessons. Two Pointers is a module
preview with a guided code example and no bottom lesson-outline section. Learn
stays active on previews and global navigation remains visible. The preview uses a 1200px maximum reading
surface with 28px section gaps; contain code scrolling within its bordered panel.
Authored lesson diagrams use block images with a 100% maximum width, automatic
height, 16px vertical margins, and a 6px radius. Keep their original aspect ratio
and descriptive alternative text; the supplied diagrams retain their own light canvas.
Inline lesson links use an underline with a 3px offset and the shared ring token
for visible keyboard focus, keeping the surrounding prose typography.

## Guided code walkthroughs

React Learn reuses this catalog and preview pattern for the Hooks category and
useEffect lifecycle lesson. Non-Recommended categories without a specialized icon
use the existing Layers icon in muted foreground; Arrays retains its blue accent.
React navigation always offers Learn and offers Practice only while its development
pilot is enabled. No completion/flag controls appear in Learn. The timer example
uses the same numbered JavaScript source and six manual conceptual steps.

Files: `features/learning/components/code-walkthrough.tsx`,
`code-walkthrough-client.tsx`, and `code-walkthrough.module.css`.
Last updated: 2026-11-14.

Embed the example inside the existing module reading panel. Use a 6px-radius
bordered card, a 16px header, a muted code surface, and a 16px-padded explanation.
Code uses Menlo 13/24px with decorative line numbers; preserve source whitespace
and contain horizontal scrolling within its focusable surface. Prepare syntax on
the server and consume the existing keyword/string/number/comment theme variables.
Active lines have a foreground leading border and semantic accent background;
inactive lines retain readable foreground color. Exclude this owned surface from
ordinary MDX pre/code styling.

Use one DOM tree with code and explanation beside each other at 760px of component
width, stacked below that. Keep a visible Step n of total label, a polite atomic
explanation, decorative progress dots, and shared small Previous/Next/Restart
Buttons. Previous and Restart disable at the start; Next disables at the end.
Keep normal keyboard focus and a visible ring on the scrollable source. There is
no autoplay or animation. Step position belongs to each mounted example and survives
theme/width changes. Describe conceptual branches without implying execution or
saved completion. Authored source and explanations live in content, separately
from the learning-owned renderer; content checking validates their line references.

## Prepared array visualizations

Files: `features/learning/components/two-pointer-visualization*.tsx`,
`two-pointer-visualization.module.css`, `step-controls.tsx`, and shared `slider.tsx`.
Last updated: 2026-11-14.

Keep prepared sample runs separate from conceptual code explanations, using the
same walkthrough header, card border/radius, 16px body gutters, and shared small
Previous/Next/Restart controls. A shared semantic Slider provides deterministic
scrubbing with a visible Example step label and accessible Step n of total value.
Slider thumbs retain identity as values change and use existing Radix dependencies.

Render array cells as an accessible ordered list with value/index/pointer labels.
Use neutral semantic surfaces: left has a solid outline, right a dashed outline,
both have explicit text/arrows, discarded values are struck through but readable,
and a matching pair uses primary/primary-foreground. The five-cell example fits
320px without horizontal page scrolling. Keep the comparison, narrative, source
references, and result synchronized with the selected snapshot. Announce one polite
atomic explanation per step. No autoplay or motion is needed. Each instance owns
visit-only state that survives theme/width changes and resets on remount/reload.

## Route and navigation loading

Files: `apps/web/src/components/route-loading.tsx`, `site-nav.tsx`, and the global,
Learn, and Practice `loading.tsx` entry points. Last updated: 2026-11-14.

Use the shared Skeleton and LoaderCircle icon with semantic accent/muted colors.
Loading pages keep catalog gutters and show a visible 14px destination label with
a 20px spinner, followed by three decorative skeleton blocks with 20px gaps.
The main is busy and the label is a polite status. Hide decorative skeletons from
assistive technology. Reduced motion stops pulse and rotation.

While a navigation Link is pending, replace its existing icon in the same slot
with a spinner and announce Loading plus the destination. Preserve its accessible
name, width, focus ring, and enabled state. Next owns pending state and automatic
prefetching; do not add route timers or minimum loading durations.
On mobile, portal a secondary status Badge at bottom center while pending so it
stays visible after the navigation disclosure closes. Use the shared Badge's
surface/type, 12px horizontal / 8px vertical padding, an 8px gap, and a decorative
spinner. It accepts no pointer input and disappears with Next's pending state.

## Subject-aware catalogs and Algorithms string cases

Files: `features/learning/components/javascript-learn.tsx`,
`learning-module-overview.tsx`, `features/catalog/components/javascript-practice.tsx`,
`components/site-nav.tsx`, and `features/problems/components/anagram-case-fields.tsx`.
Last updated: 2026-11-14.

Learn and Practice renderers accept the subject title, topic data, and destination
paths. Algorithms reuses the existing catalog/preview/workspace visuals. Section
links and Back destinations stay within the current subject; focused workspaces
omit global navigation for both JavaScript and Algorithms. The copied lesson keeps
its existing walkthrough and pointer visualization without a separate visual style.

| Property        | Pattern                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| String fields   | Shared FieldGroup / Field / FieldLabel / Input / FieldDescription                |
| Input surface   | Existing semantic Input background, border, rounded-md and focus ring            |
| Labels and help | Shared field typography; muted descriptions with lowercase/length/empty guidance |
| Validation      | Field `data-invalid` and Input `aria-invalid`; original value retained           |
| Layout          | Two vertically stacked fields in the existing scrollable testcase panel          |
| Topic accent    | Two Pointers reuses the semantic Arrays accent and existing Repeat2 icon         |

Valid Anagram uses plain `s` and `t` strings with capitalization, correction, and
spell checking disabled. Do not trim drafts or substitute a numeric/JSON field.
Empty text means the empty string; result formatting quotes it and renders both
boolean values through explicit undefined checks.

Most Frequent Character uses the same Field primitives with a shared Textarea
for `str`, preserving case, Unicode, whitespace and line breaks. Blank text is
valid; drafts over 1000 UTF-16 code units stay visible and show invalid state.
Hash Maps uses the existing braces icon with the semantic Arrays accent.

The Sliding Window substring problem uses one plain `s` field with the same shared
field composition. Help states its 1–100000 English-letter limit and case-sensitive
comparison. Empty input is invalid and remains visible for correction. The category
uses the existing amber badge accent; the long problem title wraps within the
description panel. Reuse the current editor, Run/Submit/Evaluate controls and result tabs.

## React practice pilot

Files: `features/react-sandbox/components/react-workspace.tsx`,
`react-workspace.module.css` and `react-practice-catalog.tsx`.
Last updated: 2026-11-14. Development-only module; production adoption is pending.

Reuse learning-panel headers, shared Badge/Button/Tabs, CodeMirror appearance and
the existing ProblemTutor. Use three columns for exercise/editor/tutor; place the
preview beneath the editor and switch the same output region to Console / errors.
Keep the preview mounted when its tab is hidden so logging and component state
continue. At 1100px and below, stack in reading order and bound the tutor's height.
Panels use flow height, internal code overflow, semantic theme tokens and explicit
error text. Guest preview styles stay inside its separate iframe.

Place the primary Submit action beside Reset code in the editor header. Submit
renders an immutable source snapshot in a fresh output runtime; edits and Reset
code leave the last preview in place. Before submission, show a short prompt in
the output panel. After edits, identify the displayed preview as the last
submission. Mod-Enter uses the same Submit action. Keep editor and tutor state
outside the submitted runtime so they survive each submission.

The one-exercise catalog reuses Card, DifficultyBadge, Badge and Button without
account flag/completion columns. React-local Back returns to React Practice.
The catalog navigation offers Practice; React Learn remains unavailable. Focused
workspaces carry their own theme switcher and omit global navigation. Keep visible
visit-only, preview-only and TypeScript-transpilation copy, and disclose that tutor
questions include the current draft but no preview/console capture.
