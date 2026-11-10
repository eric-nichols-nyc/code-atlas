# Implementation Plan: JavaScript Foundations

**Feature**: `001-javascript-foundations` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Git branch**: `main`, unchanged. The setup script reports the logical feature identifier as BRANCH; it did not create a Git branch. Active feature selection is checkout-local.

**Input**: One complete Scope and shadowing lesson for user review before any other lesson is published.

## Summary

Deliver Dashboard → JavaScript landing → Scope and shadowing as a complete protected browser journey. Reuse the reviewed Paper layout: left lesson panel, a vertically split center for example/practice and visualization/output, and optional unavailable tutor/notes. Implement real pointer/keyboard splitters, safe local dimensions, responsive flow/drawers, a prediction checkpoint, and six prepared visualization frames.

Use trusted local MDX for prose, typed data for catalog and activities, an explicit server-only content registry, server-side Shiki tokenization, and current shared shadcn/Radix primitives. Keep only one lesson published; Values and types and Variables with let and const are deferred alongside the other planned entries.

This command produces planning artifacts only. It does not install dependencies, implement the feature, create tasks, publish additional lessons, or deploy anything.

## Technical Context

**Language/Version**: TypeScript 5.9.3; existing Node 24 baseline, pnpm 11.25.0, Next 16.4.5, React 19.3.1.

**Primary Dependencies**: Preserve Clerk, Tailwind 4, next-themes, and shared Radix UI. Planned web additions: `@next/mdx@16.4.5`, `@mdx-js/loader@3.1.1`, `@mdx-js/react@3.1.1`, `server-only@0.0.1`, `shiki@4.6.0`. Planned web development additions: `@types/mdx@2.0.14`, `tsx@4.23.15`. Planned UI addition: `react-resizable-panels@4.21.0`. Planned root test addition: `@clerk/testing@2.2.55` for opt-in authenticated verification. Recheck pinned registry compatibility when implementing if the baseline changes.

**Storage**: Repository-authored content; versioned browser-local layout dimensions. Answers, feedback, selected tabs, drawer visibility, and playback are active-session state only. No Prisma schema, migration, database access, saved notes, or account-synced progress.

**Testing**: Existing Vitest/Testing Library and Playwright. Add Node environment coverage for content/route contracts, DOM coverage for interactions, credentials-pending smoke coverage, and separate authenticated journey coverage. Validate the real signed-in browser, keyboard controls, all target widths, themes, and reduced motion.

**Target Platform**: Modern desktop/tablet/mobile browsers. Electron, offline behavior, and native distribution are excluded.

**Project Type**: Feature inside the existing learner app, with generic primitives in shared UI. No additional app or package.

**Performance Goals**: Lesson reading and its checkpoint must not require downloading an editor or browser syntax engine. Filter the seven-entry reference catalog locally. Persist completed resize interactions rather than every pointer frame. Keep the highlighted source and all prepared frames in one small authorized payload. Use bundle analysis to verify new client dependencies stay bounded; do not add an unsupported numeric production latency claim.

**Constraints**: Authorize each protected route before content lookup/import. Build and public pages remain usable without credentials. No arbitrary-code execution or remote MDX evaluation. Preserve learning state through adaptive layout changes. Start tutor closed on each initial load. No page-level horizontal overflow at 320–1440px or 200% zoom.

**Scale/Scope**: One subject landing; one published lesson; six planned entries; one checkpoint; one example; one six-step scope scenario; shared shell extension tested through an unpublished fixture.

## Constitution Check

Pre-research and post-design evaluation both PASS. No principle exceptions are required.

| Principle                        | Gate and design evidence                                                                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Explicit specification        | Updated spec records the user's one-lesson review boundary. No other lesson is a publication task.                                                                |
| II. Clear module ownership       | Routes own access/composition; learning owns generic capabilities; JavaScript owns scope rendering; shared UI owns primitives.                                    |
| III. Server authorization        | Guard both landing and lesson pages before invoking loaders; keep proxy initialization-only. No new protected API/data boundary is introduced.                    |
| IV. Appropriate validation       | Content, guards, playback, storage, responsive state, and real browser journeys have distinct verification paths. Authenticated proof gaps are reported honestly. |
| V. Persistence when needed       | Prose, typed content, local dimensions, and ephemeral learner state are separate. No business model or database is introduced without a persistence requirement.  |
| VI. Explicit visualization state | Six immutable prepared snapshots, source-line references, and explanations; no execution/tracing claim.                                                           |
| VII. Shared accessible patterns  | Existing nav/theme retained; Radix drawers/tabs; library splitter ARIA/keyboard behavior; labels and focus restoration; reduced motion.                           |

Future generator output must adapt to the same serializable scenario/step contract, but no generator is included. Visualizer output is not a complete runtime environment. Browser proof is not Electron proof.

## Project Structure

### Documentation (this feature)

```text
specs/001-javascript-foundations/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content.md
│   ├── routes.md
│   └── workspace.md
├── checklists/requirements.md
└── tasks.md                    # Later speckit-tasks output; not created here
```

### Source Code (planned changes, repository relative)

```text
apps/web/
├── scripts/validate-learning-content.ts
├── next.config.ts              # Compose MDX with existing analyzer
└── src/
    ├── mdx-components.tsx
    ├── app/learn/javascript/
    │   ├── page.tsx
    │   ├── loading.tsx
    │   ├── error.tsx
    │   └── [lessonSlug]/
    │       ├── page.tsx
    │       ├── loading.tsx
    │       ├── error.tsx
    │       └── not-found.tsx
    ├── content/javascript/
    │   ├── catalog.ts
    │   └── scope-and-shadowing/
    │       ├── lesson.mdx
    │       ├── definition.ts
    │       ├── example.ts
    │       ├── exercise.ts
    │       └── scenario.ts
    └── features/
        ├── catalog/            # Existing subject catalog; add learning entry/list/filter UI
        ├── dashboard/          # Replace JS preview action with the real landing link
        ├── learning/
        │   ├── components/    # Shell, lesson/prose, example, exercise, playback, fallback UI
        │   ├── hooks/         # Safe preferences and measured viewport policy
        │   ├── lib/           # Pure contracts, validation, catalog/order helpers
        │   ├── server/        # Guard adapter, explicit registry, loader, Shiki adapter
        │   └── state/         # Lesson session and layout coordinator
        └── javascript/scope-shadowing/
            ├── components/    # Subject adapter and scope/binding renderer
            └── lib/           # Scope-state validation/formatting
packages/ui/src/components/    # Add/adapt only required shared primitives
vitest.config.ts              # Separate *.node.test.ts from DOM tests; include TSX
playwright.auth.config.ts     # Opt-in authenticated suite
tests/e2e/                    # Existing credentials-pending suite extensions
tests/e2e-auth/               # Setup + authenticated learning journeys
```

**Structure Decision**: Keep content inside the learner app until a second actual consumer needs a package. Use one typed lesson composition and explicit loader map rather than folder scanning. Put tests alongside their owned modules, with browser journeys in root tests. Do not migrate Codedrill's backend, auth bridge, editor, or problem schema.

## Workspace reconciliation before task generation

The admin app was removed in the current working tree after planning. Preserve that existing change. The current production smoke configuration starts only web and API on ports 3000/4000; do not restore the admin app or its removed tests. This feature does not change the API work already present in the checkout.

## Phase 0 — Research decisions

[research.md](research.md) resolves concrete MDX, highlighting, splitter API, persistence/hydration, JavaScript semantics, and test-auth questions. Current splitter API differs from the reference app. Its unguarded persistence reader will not be used directly. There are no unresolved planning clarifications.

## Phase 1 — Architecture and contracts

### Route and rendering boundary

Use `/learn/javascript` and `/learn/javascript/scope-and-shadowing`. Each page follows configuration check → session protection → registered published-content lookup → render. Keep the existing root GlobalNav and theme provider; do not duplicate branded headers or change sign-in's current dashboard destination.

Use static generic route metadata so metadata generation does not import protected prose first. Do not add static lesson generation or a new API endpoint. The server-only registry is not imported by client components. Pass rendered prose as a server child and validated activity/token DTOs into client-controlled slots.

### Content, validation, and authoring

The pure catalog describes all entries and availability. The published body registry has exactly one allowlisted loader. Typed lesson composition links prose identity, example, checkpoint, and scenario; it does not duplicate prose or source strings. MDX contains the authored explanation and primer through shared mappings; the lesson definition holds concise takeaway bullets; exercise and scenario references are explicit in composition rather than hidden inside MDX markup.

Add a `content:check` web script using tsx. Run the pure validator before web build, and include the same validator in Vitest. It validates publication, IDs, cross-references, answer options, exact example identity, source lines, and snapshot structure. Next's MDX compiler checks syntax and registered imports. No runtime filesystem lookup is driven by a user slug.

Server tokenization preserves all source whitespace and blank lines. Shared code components use serializable token spans and light/dark CSS variables; Shiki remains outside the client graph.

### Workspace and hydration

A JavaScript subject adapter composes the generic learning shell with the scope-specific visualization slot; generic learning modules never import JavaScript renderers. A lesson-keyed session provider owns selected answer, submission state, playback index, and tabs above all splitter and responsive branches. Keep the outer Group and its panel IDs stable while toggling the tutor. Capture actual side widths before toggling, then reconcile widths after the conditional panel has registered. The center receives the released tutor width, including its removed separator.

Render readable single-column content on the server and first client render. Safely load preferences and measure the workspace host, shared header, and context toolbar before mounting the sizing subtree. Calculate available height from actual positions/viewport measurements, not hard-coded header offsets. Do not gate authorization or all readable content behind client mount.

Choose docked, two-pane/drawer, or single-column mode from measured inner width and height. Preserve session state above mode changes and panel scroll positions in transient pane records when moving content between layout trees. Do not key the session or entire Group to viewport mode, theme, or tutor visibility.

[workspace contract](contracts/workspace.md) defines units, bounds, saved state, focus, and reset behavior. Build UI primitives from the current shared shadcn base: resizable, tabs, sheet, radio-group, select, and alert as needed; reuse existing Button, Input, Field, Badge, Card, and Skeleton. Add no editor or enabled tutor composer.

### Lesson content and validation cases

Scope and shadowing includes a primer on let, quoted string values, braces, and console output; explains same-name distinct bindings and nearest-scope lookup; and has a concise takeaway. The pictured prediction asks what the final log prints, with Outside/Inside options and explanatory feedback. The first slice hosts this one checkpoint in the left lesson panel (before the example on mobile), rather than duplicating its controls in multiple panes. The upper center shows the implemented Example view; omit the illustrative Practice tab until there is a distinct central activity. The left panel uses Lesson/Takeaways.

Author six frames, including block entry's uninitialized binding and a separate block-exit frame. The final output is Inside then Outside. The visible state contains only lesson-relevant scopes and bindings. Test the trusted authored example's output independently; never evaluate learner answers or edited code. Reset playback and Reset layout have separate effects.

### Verification design

Expand the existing server Vitest project to include `*.node.test.ts` and exclude those from DOM projects; include `.test.tsx` in DOM projects. Cover guards and loader call ordering, content contracts, snapshot traversal, storage failures, state through responsive changes, and unavailable capabilities. An unpublished second-lesson fixture proves reuse without exposing another production lesson.

Keep credential-free Playwright smoke tests separate from an opt-in authenticated suite. Require development keys plus a dedicated existing test learner, saved under ignored `.clerk/` state. No production bypass, real-user cookie export, or test route is added. A missing identity prevents a claim of automated authenticated success; manual signed-in browser proof is recorded separately.

Run lint, typecheck, unit tests, content check, production build, both applicable browser suites, and bundle analysis after implementation. Check all target widths and 200% zoom, both themes, reduced motion, each splitter with pointer/keyboard, storage denial/corruption, and 1440 → 390 → 1440 state continuity.

### Delivery order for later task generation

1. Content contracts, one complete lesson, validator, server registry, and highlighted example.
2. Protected landing/direct lesson route and real dashboard navigation, initially readable without optional tools.
3. The controlled checkpoint and deterministic scope player; complete the vertical learning journey.
4. Shared splitters, drawer adaptation, safe preference storage, and state/focus preservation.
5. Error/unavailable states, full verification, and a browser review of this one lesson.

These are workstreams for tasks, not permission to publish additional lessons. The command stops after planning; no `tasks.md` is created here.

## Complexity Tracking

No constitution violations or exceptions. Three feature areas are justified by distinct ownership (generic catalog/learning and the scope-specific renderer), without adding monorepo packages. No editor, interpreter, service, database model, or general visual-authoring system is introduced.
