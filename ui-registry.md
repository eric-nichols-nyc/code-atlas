# Shared UI patterns

## Starter surfaces

Files: `apps/web/src/app/page.tsx`, `apps/admin/src/app/page.tsx`, `packages/ui/src/components/card.tsx`.
Last updated: 2026-11-07.

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

## Buttons and dialogs

Files: `packages/ui/src/components/button.tsx`, `packages/ui/src/components/dialog.tsx`, `apps/web/src/components/component-preview.tsx`.
Last updated: 2026-11-07.

| Property         | Pattern                                                     |
| ---------------- | ----------------------------------------------------------- |
| Primary action   | Default Button variant; semantic primary colors             |
| Secondary action | `outline` or `ghost` Button variant                         |
| Button radius    | `rounded-md`                                                |
| Button text      | `text-sm font-medium`                                       |
| Button spacing   | Default `h-9 px-4 py-2 gap-2`                               |
| Hover            | Variant-defined semantic hover colors                       |
| Focus            | `focus-visible` ring using the shared ring token            |
| Dialog surface   | `bg-background`, `border`, `rounded-lg`, `p-6`, `shadow-lg` |

Use `asChild` for links and Radix dialog triggers. Every dialog includes a DialogTitle and DialogDescription. Prefer component variants over overriding their colors or typography. Both applications share these patterns.

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

The Code Atlas brand link returns to the app's home page. The web and admin navigation use Dashboard as their explicit route item, with no separate Home item.

Consumers may supply `containerClassName` for the inner navigation width. The web and admin apps consistently use the full viewport width on every page. The optional `utilities` slot keeps controls such as the theme switcher visible even when the mobile route links are collapsed. Keep its DOM and visual order aligned with the brand, disclosure, and route links.

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

File: `apps/web/src/app/page.tsx`.
Last updated: 2026-11-09.

| Property       | Pattern                                                         |
| -------------- | --------------------------------------------------------------- |
| Background     | Inherited `bg-background`; subject cards use `bg-card`          |
| Text           | `text-foreground`; supporting copy uses `text-muted-foreground` |
| Hero heading   | `text-4xl font-semibold tracking-tight`, larger on wide screens |
| Page spacing   | `px-6 py-16`, `gap-20` between sections                         |
| Section border | `border-t` with `pt-10`                                         |
| Subject cards  | Shared Card composition, `gap-4` between cards                  |
| Primary action | Default Button, `size="lg"`                                     |
| Browse action  | Outline Button, `size="lg"`                                     |
| Subject status | Secondary Badge                                                 |
| Focus / hover  | Shared Button variants                                          |

Use semantic section headings. Link the primary action to the real dashboard and the browse action to the subjects section. Keep subjects informational and label unfinished content "Coming soon" until lesson routes exist.

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

Map Basics to blue, Functions to amber, and Async to rose in feature-owned metadata. Keep these color variants generic in the UI package. The JavaScript action is a real link to the protected subject landing. State lesson availability honestly; do not display invented progress or link to missing lesson routes. Reuse the shared shell and primitives for later learner screens. Home and dashboard use the same subject metadata, card title size, content width, and grid breakpoints.

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

Shared learning panels use `learning-panel` (`bg-card`, `border`, `rounded-md`, no shadow),42px headers and16–20px inner padding. Problem headings use24/32px; prose14/23px. CodeMirror uses Menlo13/24px, semantic light/dark syntax roles and local assets. Default Tab exits the editor; Mod-Enter runs. Lazy editor loading reserves its space. Session drafts and submissions must never say saved to account.

The problem description is continuous, with no left-panel tabs or Submissions view. Hints and Solution use shared Accordion rows; Testcase/Test Result retain shared line Tabs. Cases use shared Buttons and labeled numeric Input. Verdicts are server results with text labels, bounded diagnostics and explicit stale-code warnings. Hidden cases never expose private values/logs. Tutor and Notes remain unavailable. Sleep is the sole published problem; Scope is now planned.

Feature CSS in `apps/web/src/app/globals.css` owns viewport containment and editor layout; shared primitives/tokens remain in UI. Split mode contains document scrolling; route exit removes the root mode attribute and restores ordinary scrolling. Sheets disable animation for reduced-motion preferences.

## JavaScript sections and practice navigation

Files: `apps/web/src/components/site-nav.tsx`, `packages/ui/src/components/global-nav.tsx`,
`apps/web/src/features/catalog/components/javascript-practice.tsx`,
`apps/web/src/app/javascript/learn/page.tsx`, and the practice workspace toolbar.
Last updated: 2026-11-09.

| Property          | Pattern                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Section links     | GlobalNav shared Button asChild; active `secondary`, inactive `ghost`; `aria-current="page"`                                           |
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
Last updated: 2026-11-09. Reference: TraceCode practice category sidebar and list.

| Property        | Pattern                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| Categories      | Shared vertical Tabs, default TabsList surface and active/focus states; `min-h-11` triggers |
| Category counts | Secondary Badge with real published counts; result count announced in the selected panel    |
| Main heading    | Existing subject heading sizes; panel headings 22/30px, supporting text muted               |
| Row surface     | Shared card background, subtle border, rounded-md list, no added shadow                     |
| Row spacing     | 16px padding, 20px horizontal on larger screens, 12–16px gap                                |
| Row labels      | Title with concise topic Badge; secondary difficulty Badge; summary uses muted text         |
| Search          | Labeled shared Input; empty search results offer Clear search while retaining category      |

Recommended is an explicit curated view; each topic category lists its published
problems. Sleep is recommended and Async. Do not duplicate problem records for
recommendations, invent progress or show empty topic categories. Desktop places
categories beside the list; narrow screens stack categories above it. Tabs own
keyboard navigation and selection. Keep the global header separate from content
filtering and preserve the flat problem rows.

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
