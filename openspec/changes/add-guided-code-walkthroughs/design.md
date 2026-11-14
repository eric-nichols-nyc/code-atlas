# Design

## Context

See [proposal.md](proposal.md) for motivation and [the capability delta](specs/guided-code-walkthroughs/spec.md) for behavior. This design establishes a content contract and a server/client presentation boundary, so it is useful even for one example.

The current authenticated preview lazily loads trusted `two-pointers/overview.mdx` through `moduleOverviews`. `LearningModuleOverview` provides the reading panel and lesson outlines. The MDX contains a 17-line `findPair` example, usage, and expected result. Its surrounding strategies, diagrams, problem links, and worked prose already exist on this branch.

The practice `JavaScriptEditor` depends on problem-session state and editor commands. It is unsuitable as a read-only learning component. However, the app already directly depends on `@codemirror/lang-javascript` and `@lezer/highlight`, and defines `--code-keyword`, `--code-string`, `--code-number`, and `--code-comment` theme variables. A read-only Node probe confirmed that the installed parser/highlighter can produce syntax spans without a browser or `EditorView`.

## Goals / Non-Goals

**Goals:** Keep content independently authorable and validated, make the client responsible only for step selection, and keep the existing authenticated MDX route as the composition point. One walkthrough must exercise the complete content-to-browser path without introducing a curriculum engine.

**Non-Goals:** The component will not own lesson routing, execution state, account progress, or the practice editor. A conceptual walkthrough is not an interpreter or a sequence of runtime snapshots. Reference-site implementation details are unknown; only its previously observed interaction informs this design.

## Decisions

### 1. Use typed authored data and one canonical source

Add a pure learning-owned contract and validator under `features/learning/lib/`. A walkthrough has `id`, `title`, `source`, and ordered `steps`; each step has `id`, `explanation`, and `lines: number[]`. Explanations are plain text in this slice. Source line numbers are one-based and refer to the full displayed source. Shared newline normalization converts CRLF/CR to LF before validation, tokenization, and display; splitting at LF includes a terminal empty line when present.

Place `twoPointersWalkthrough` in `content/javascript/learn/two-pointers/walkthrough.ts`. A small explicit registry under `content/javascript/learn/` associates authored walkthroughs with published module slugs for content validation. The registry and MDX import the same definition. Replace only the existing code fence with the walkthrough component; do not duplicate its source in MDX.

Use the current function and usage unchanged, with these six conceptual steps:

| Step | Source lines | Explanation focus                                       |
| ---- | ------------ | ------------------------------------------------------- |
| 1    | 2, 3         | Start indices at opposite ends of the sorted array.     |
| 2    | 5            | Continue while the indices remain distinct and ordered. |
| 3    | 6            | Calculate the sum at the current indices.               |
| 4    | 8            | Return both indices if the sum matches the target.      |
| 5    | 9, 10        | Move left for a smaller sum or right for a larger sum.  |
| 6    | 13           | Return `null` if the search ends without a pair.        |

The source retains the target-9 call and successful `[1, 3]` result. Introductory copy identifies the steps as an explanation of the function, including alternative branches; the last explanation must not claim the successful sample returned `null`.

An MDX-only collection of custom line elements would couple prose markup to presentation and make validation harder. Duplicating the code for each step would allow it to drift. The typed definition avoids both while leaving future visualizations outside this contract.

### 2. Prepare syntax on the server and send serializable lines

Add a learning-owned server presentation helper and a `CodeWalkthrough` server wrapper. Validate the definition, parse JavaScript with the installed parser, and use Lezer highlighting to prepare line/token arrays with semantic roles. Send escaped text and these roles to a small `CodeWalkthroughClient`; do not send the parser to the client or instantiate a CodeMirror editor. Render tokens as React text, without HTML injection or execution.

Map roles to the existing syntax variables. Preserve every normalized source character, including unhighlighted text, whitespace, and blank lines. A tokenization failure falls back to plain readable source; invalid walkthrough data falls back to available source plus an unavailable message, without step controls. Surrounding MDX remains renderable. Keep the pure validator usable by the content-check CLI; mark the server preparation entry appropriately with `server-only`.

Reusing the practice editor would import unrelated state and capabilities. Client-side parsing would increase this interaction's browser work. A static plain code block would lose the existing syntax treatment. Server preparation reuses installed packages without those costs.

### 3. Keep navigation local and deterministic

The client owns one current-step index per instance. Derive selected lines, explanation, `Step n of 6`, and decorative indicators from that index. Previous is disabled at the first step; Next is disabled at the last; Restart returns to the first and is disabled when already there. There is no Done action, wrapping, automatic advancement, or completion write.

Use stable component identity, unique DOM IDs, and the same mounted component across responsive layouts and themes. Fresh mounting/reload begins at zero. Do not add URL state, local storage, providers, API calls, or database writes. Test independent instances in fixtures without publishing a second lesson example.

A router-based stepper or saved progress would create semantics the preview does not yet support. Local state is sufficient for explanatory navigation and leaves future lesson-level navigation independent.

### 4. Fit the existing reading panel and shared controls

Use shared Buttons and current theme tokens, retaining the reading panel's compact borders, spacing, and monospace code treatment. Within the walkthrough, use a two-column code/explanation grid when its own available width permits, and a stacked layout below that container threshold. Use one DOM tree, `min-width: 0`, and horizontal scrolling within the code surface. Keep logical code lines unwrapped so visual numbering remains clear.

Own the walkthrough's code styles in its feature CSS module. Exclude its marked code surface from the broad `.prose pre` and `.prose pre code` rules in `learning-module-overview.module.css`; ordinary fenced code retains its existing treatment. Active lines get a leading marker and subtle background. Inactive source remains legible in every shared theme.

Give the section and scrollable code surface accessible names. Keep source available to assistive technology, hide decorative line numbers/indicators, and announce only the updated step and explanation in a polite live region. Preserve normal Tab/Enter/Space operation and visible focus; do not intercept global arrow keys. No animation is required. Any transition added during styling must respect reduced motion.

The reference's strong inactive-code dimming is not adopted because readable context matters here. Container-based layout avoids assuming the viewport equals the reading panel's width.

### 5. Extend existing validation, access checks, and feature documentation

Extend `scripts/validate-learning-content.ts`, already run by the production build, with the pure registry validator. Require nonempty identity/title/source, at least one step, unique walkthrough IDs across the registry, unique step IDs within each example, nonempty explanations, and nonempty distinct integer line references within source bounds. Overlap between different steps is allowed. Report module/walkthrough/step context in errors. Registry entries must refer to published learning modules.

Keep route authentication ahead of lazy content loading. Add no route or data access path. Preserve catalog, loading, not-found, setup, and practice behavior. Update existing tests that currently reject all preview buttons to permit the new navigation while still rejecting Run/Submit. Per the user's implementation follow-up, remove the bottom lesson-outline section and assert its absence in access/browser coverage. Catalog metadata remains available for existing module counts.

During apply, extend the existing `docs/features/javascript-learning.md` brief and acceptance criteria, update README availability wording and any preview copy that says all guidance is future work, and record the component pattern in `ui-registry.md`. Keep the Module preview status; individual lessons remain deferred. Do not modify the completed scaffold change's historical planning artifacts.

## Risks / Trade-offs

- **Line references drift after source edits** → Validate bounds and uniqueness at build time; component/content assertions verify the six intended concepts and line groups, since valid bounds alone cannot prove semantic alignment.
- **Conceptual steps resemble a runtime trace** → Label the interaction clearly and distinguish the successful sample from the alternative no-match branch. Defer runtime state visualizations.
- **Tokenization or broad prose styles corrupt code presentation** → Test source reconstruction and fallback behavior, isolate walkthrough CSS, and review the actual MDX composition in the browser.
- **Desktop presentation overflows the narrow reading panel** → Use available-width layout and local code scrolling; review 320px and desktop widths in all themes with keyboard and reduced motion.
- **The branch contains substantial uncommitted work** → Limit implementation edits to this feature's surfaces and necessary documentation/tests. Preserve existing changes and the running development server. Record unrelated suite failures separately; the prior tutor focus failure is not part of this change.
- **No stored position** → Reload intentionally resets to the first step. The UI makes no saved-progress claim.

## Migration Plan

No schema, account-data, dependency, or credential migration is needed. Implement the pure content contract/validation first, then server preparation and client presentation, then the MDX integration. The existing build gate validates registered walkthroughs before publishing. A rollback restores the previous MDX fence and removes the walkthrough integration; no learner data requires repair.

Verification pairs each implementation task with focused tests. Final integration includes root `pnpm lint`, `pnpm typecheck`, `pnpm test`, a credential-free `pnpm build`, the existing production smoke suite, and authenticated learning coverage in `tests/e2e-auth/learning.spec.ts`. That file already matches the authenticated Playwright configuration. Include manual browser review of the actual preview. Follow README startup setup and preserve an occupied development port; the brief records the existing isolated port-3001 verification approach.
