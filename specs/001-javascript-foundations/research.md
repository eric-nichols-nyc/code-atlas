# Research: JavaScript Foundations — one-lesson review

**Date:** 2026-11-09. **Scope:** planning only; no application dependency was installed and no feature source was implemented.

## R1. Scope and ownership

**Decision:** Publish only Scope and shadowing. Retain the other six illustrative catalog entries as planned metadata, without body loaders or active links. Start learning opens Scope regardless of its third position in the eventual curriculum. A short prerequisite primer makes the lesson usable independently.

**Rationale:** This follows the user's explicit review boundary. One complete journey exercises every planned capability before content is expanded.

**Alternatives considered:** Publishing the prior three-lesson scope; building only a shell with placeholder content. Both miss the requested review boundary.

**Evidence:** Updated spec FR-002/023; reviewed Paper and learning-layout v0.4. Codedrill is a pattern reference, not a dependency or backend migration source.

## R2. Trusted MDX with an explicit server registry

**Decision:** Use local, trusted MDX for the prose, compiled by Next.js. Use separate TypeScript catalog, example, exercise, and scenario data. Keep an allowlisted server-only body-loader registry. Use `src/mdx-components.tsx` to map prose elements to shared learning typography. Do not use frontmatter or Markdown plugins initially.

**Rationale:** Long-form authoring stays readable while activities remain independently validated. Explicit registry lookup prevents arbitrary slug-to-file imports. Passing rendered server prose into client layout slots preserves server ownership without forcing the whole lesson into a client bundle.

**Alternatives considered:** Large JSON/HTML lesson records, a remote CMS, runtime MDX compilation, and separate hard-coded pages. None is needed for one trusted lesson. MDX component mappings are a style convention, not a security sandbox.

**Dependency decision:** Web dependencies `@next/mdx@16.4.5`, `@mdx-js/loader@3.1.1`, `@mdx-js/react@3.1.1`, `server-only@0.0.1`; web development dependency `@types/mdx@2.0.14`. Preserve installed Next 16.4.5 and React 19.3.1. Compose MDX into the existing bundle-analyzer configuration.

**Sources:** [Next.js MDX](https://nextjs.org/docs/app/guides/mdx), [React client boundaries](https://react.dev/reference/rsc/use-client), [MDX trust model](https://mdxjs.com/docs/getting-started/#security), [published Next MDX version](https://registry.npmjs.org/@next/mdx/16.4.5).

**Trap resolved:** App Router requires the MDX component mapping file. Turbopack plugins require supported module-name configuration and serializable options; importing plugin functions is not a safe default. No plugin is needed here.

## R3. Highlight on the server, render tokens in the browser

**Decision:** Use `shiki@4.6.0` in the web server layer. Reuse a single `createHighlighterCore` promise with the JavaScript regex engine, JavaScript grammar, and GitHub light/dark themes. Use `codeToTokensWithThemes`; map its result to minimal serializable text/color DTOs rather than sending grammar state or raw HTML.

**Rationale:** The source example remains one canonical string, and the same line tokens feed code display and highlighted playback. No Monaco, CodeMirror, browser grammar, or editor worker is necessary. Token color CSS variables follow the existing root `.dark` class, while panel backgrounds and focus styles use semantic tokens.

**Alternatives considered:** Manual syntax spans, a client highlighter, a rehype plugin, and a full editor. Manual markup drifts when source changes; the other approaches add unnecessary coupling or browser work.

**Sources:** [Shiki performance](https://shiki.style/guide/best-performance), [token API](https://shiki.style/guide/install), [dual themes](https://shiki.style/guide/dual-themes), [Next.js integration](https://shiki.style/packages/next), [published version](https://registry.npmjs.org/shiki/4.6.0).

**Trap resolved:** Import narrowly from `shiki/core`, `shiki/engine/javascript`, `shiki/langs/javascript.mjs`, and the two theme modules. Do not serialize the entire highlighter result or normalize away blank source lines.

## R4. Current splitter API and pixel-safe behavior

**Decision:** Add `react-resizable-panels@4.21.0` to shared UI and adapt the current shadcn Radix wrapper. It wraps `Group`, `Panel`, and `Separator`; use `orientation`, stable panel IDs, explicit pixel strings, and a center panel with no default size so it receives the remainder.

Side panels use `groupResizeBehavior="preserve-pixel-size"`; the center uses relative-size preservation. Keep panels non-collapsible through dragging. Tutor visibility is an explicit UI action that conditionally renders its panel and separator.

**Rationale:** This supplies native keyboard and ARIA behavior and avoids porting Codedrill's older `PanelGroup`/`direction` API. Numeric sizes in the chosen version are pixels; Group layouts are percentage maps. Explicit units avoid confusion.

**Sources:** [published 4.21.0 types](https://unpkg.com/react-resizable-panels@4.21.0/dist/react-resizable-panels.d.ts), [upstream API](https://github.com/bvaughn/react-resizable-panels#documentation), [current shadcn wrapper](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/radix/ui/resizable.tsx).

**Conditional-panel trap resolved:** Capture actual side widths with `getSize().inPixels` before changing tutor visibility. After the new panel set has registered and reports nonzero sizes, restore the lesson width and, when opening, the bounded tutor width with imperative `resize("...px")`. Do not resize before the new panel exists or repeatedly reconcile every callback. The center absorbs the full tutor/separator release.

**Sources:** [pixel-space calculation](https://github.com/bvaughn/react-resizable-panels/blob/main/lib/global/dom/calculateAvailableAxisSize.ts), [imperative sizing](https://github.com/bvaughn/react-resizable-panels/blob/main/lib/global/utils/getImperativeItemMethods.ts), [conditional panel registration](https://github.com/bvaughn/react-resizable-panels/blob/main/lib/flex/components/Group.tsx).

## R5. Local preferences and hydration

**Decision:** Store a small versioned app-owned record of side widths in pixels and center code share in percent. Catch reads, parsing, and writes; validate finite values, version, and reasonable ranges; clamp to measured available space. Save completed user interactions through `onLayoutChanged` with `meta.isUserInteraction`. Persist Reset layout explicitly. Do not persist tutor visibility.

**Rationale:** The library's `useDefaultLayout` does not guard malformed JSON reads in the inspected version. It also does not directly express the requirement that hiding the tutor preserves the lesson's pixel width.

Render a stable readable flow during server rendering and initial hydration. Mount the sizing subtree only after browser measurements and safe preferences are ready. The lesson-session provider stays above that subtree and all responsive branches. Do not render a blank page while waiting.

**Sources:** [persistence hook](https://github.com/bvaughn/react-resizable-panels/blob/main/lib/flex/hooks/useDefaultLayout.ts), [server rendering guidance](https://github.com/bvaughn/react-resizable-panels/blob/main/src/routes/PersistentLayoutsServerRenderingRoute.tsx).

## R6. Content integrity without a new database

**Decision:** Use TypeScript contracts plus a dependency-free pure validator for catalog identities, publication, body registration, exercise references, and scenario snapshots. Add web development dependency `tsx@4.23.15`, already resolved elsewhere in this workspace, to run the content-check command without adding custom TypeScript module resolution. Next's compiler validates registered MDX syntax/imports during build.

Keep MDX prose free of activity-ID lookups in this slice: shell activity slots receive explicit references from typed lesson composition. This avoids needing a custom MDX parser to discover references.

**Rationale:** There is no learner persistence requirement that needs Prisma or Neon yet. A shared pure validator can serve the build, tests, and runtime boundaries without importing UI or server-only modules.

**Alternatives considered:** Zod, a CMS content SDK, runtime filesystem discovery, and authoring all content in the database. They can be reconsidered when their consumers or input boundaries exist.

## R7. Prepared scope semantics

**Decision:** Use six complete teaching snapshots over the exact authored source: outer initialization, block entry, inner initialization, inner log, block exit, outer log. Represent the inner binding as uninitialized at block entry; initialize it at the declaration. Distinguish that state from an initialized `undefined` value.

**Rationale:** Block lexical bindings exist before their declaration is evaluated. This avoids teaching that an inner declaration reassigns the outer value, or that a lexical binding becomes available only after its declaration is reached. Snapshots model only the bindings relevant to this example, not a complete JavaScript runtime.

**Sources:** [MDN let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let), [ECMAScript BlockDeclarationInstantiation](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-blockdeclarationinstantiation).

The Paper's five-step count is illustrative; the implementation derives the displayed count from the authored six-step scenario. The final outputs are Inside, then Outside. Authored reference output may be checked in a test-only child process with a timeout; no learner input is evaluated by the application.

## R8. Access and honest verification

**Decision:** Each protected page checks configuration, then verifies the session, then resolves/imports content. Keep the current proxy and sign-in completion behavior. Use static generic route metadata rather than importing lesson prose before authorization. Do not add an API endpoint or production auth bypass.

**Evidence:** Existing web dashboard guard, dynamic root layout, and proxy already establish this sequence. The existing Playwright suite blanks Clerk credentials and proves setup behavior only.

**Testing decision:** Keep that suite, add route/loader contract tests, and add a separate opt-in authenticated Playwright configuration using `@clerk/testing@2.2.55`, development-instance keys, and a dedicated existing test learner. Use a setup project, `clerkSetup`, `clerk.signIn({ page, emailAddress })`, and ignored auth state. Reject production-instance keys. A test learner must not require MFA or session tasks.

**Sources:** [Clerk Playwright overview](https://clerk.com/docs/guides/development/testing/playwright/overview), [state reuse](https://clerk.com/docs/guides/development/testing/playwright/test-authenticated-flows), [current helper restrictions](https://clerk.com/docs/guides/development/testing/playwright/test-helpers).

Authenticated automation requires test identity configuration. Until it runs, report it as unverified. The existing signed-in development browser can provide manual journey evidence without exporting its session. Configuration-free unit and smoke tests do not establish authenticated end-to-end success.

## Resolution

All planning unknowns are resolved. The dedicated identity is a validation prerequisite, not an unresolved product decision. No external service or new credential is needed to write the lesson, validate content, or build the application. No experimental editor, code tracer, AI integration, database model, or desktop package is included.
