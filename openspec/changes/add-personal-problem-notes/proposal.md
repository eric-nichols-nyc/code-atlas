# Proposal

## Why

Code Atlas's existing Notes tool is a placeholder, so learners cannot keep problem-specific patterns, mistakes, and takeaways with their account. Adapt CodeDrill's personal-note workflow into a complete Code Atlas slice: open Notes on Sleep, write formatted notes, explicitly save, and restore them after reopening the problem.

## What Changes

- Replace the Notes placeholder in the existing desktop tools panel and mobile drawer with one private rich-text document per authenticated learner and published problem.
- Support bold, italic, blockquotes, ordered/bulleted lists, code blocks, links, and clearing formatting. The user selected text formatting and links first; image/video embeds and uploads are deferred.
- Load account notes on first opening Notes. Provide explicit Save, loading/empty/unsaved/saving/saved states, and distinct read/write failures with retry. Only a confirmed server response establishes saved state.
- Keep drafts above responsive branches so closing Notes, switching to AI tutor, resizing, and changing themes preserve them. Reset state on learner/problem changes, ignore stale responses, and preserve edits made during a save.
- Add authenticated same-origin GET/PUT notes handlers, strict versioned rich-text validation, and a separate Prisma personal-notes model keyed by the existing User and stable problem ID.
- Keep personal notes out of public problem definitions, catalog/progress payloads, authored hints/solutions, judging, and future AI context unless a separate feature explicitly introduces that access.
- Preserve explicit-save semantics: unsaved drafts live only in the current problem session; saved notes follow the account across sessions/devices. Concurrent sessions use last successful database write wins.

Autosave, offline synchronization, browser draft backups, collaboration, history, export, sharing, curated learning notes, CodeDrill data import, and connected AI tutoring are outside this change.

## Capabilities

### New Capabilities

- `personal-problem-notes`: Private account-owned problem notes, bounded formatted content, explicit persistence, session draft recovery, and accessible integration with the existing workspace tools.

### Modified Capabilities

None. The project's OpenSpec capability inventory is currently empty. This adds a capability without changing Run/Submit or progress contracts; implementation will update the existing documentation that describes Notes as unavailable.

## Impact

- UI/state: extend `features/problems` for notes components, client contract/helpers, and a session provider; compose them through `ProblemExperience` and the existing `features/learning` tools panel/drawer. Retain shared UI primitives and semantic tokens.
- API/server: add `apps/web/src/app/api/problems/[problemId]/notes/route.ts`; place account persistence and handler factories in `features/catalog/server`, reusing `requireLearner`, `readJson`, `json`, and `findProblem`. Prisma stays server-only and `getDb()` remains request-time after authentication/validation.
- Database: add `ProblemNote`, a unique user/problem pair, account cascade deletion, a versioned JSON document, and timestamps through an additive Prisma migration. Validate the migration on an isolated Neon development branch; builds remain credential-independent.
- Dependencies: lazily load Quill in a feature-owned React adapter and persist a validated document Delta instead of copying CodeDrill's HTML body. Do not add NestJS, Drizzle, Clerk, an upstream proxy, or React Query for this slice. Review editor bundle cost and React lifecycle behavior.
- Verification: meaningful document-validation, ownership/API, persistence, and state-race tests; browser checks for save/reload, keyboard/focus, narrow layouts, and existing coding state. Separate credential-free checks from authenticated/database checks and online Electron review.
- Reference: the 20 requested CodeDrill files were inspected under `/Users/ericnichols/Documents/monorepo-apps/codedrill`; the design records their mapping and the reasons to adapt rather than copy their boundaries.
