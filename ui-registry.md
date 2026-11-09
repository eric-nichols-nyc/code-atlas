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

File: `packages/ui/src/components/global-nav.tsx`.
Last updated: 2026-11-07.

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
