# Tasks

## 1. Feature brief and document contract

- [x] 1.1 Create `docs/features/personal-problem-notes.md` with the Sleep review journey, selected text/link scope, explicit-save/session-only semantics, last-write behavior, and a verification section; verify it agrees with this change's spec and design and records all runtime work as pending.
- [x] 1.2 Implement the editor-independent versioned document type, empty value, validation, normalization, and equality in `features/problems/lib/problem-notes-contract.ts`; verify colocated tests cover all supported formats, empty documents, Unicode byte boundaries, 4,096-op limits, invalid versions/keys/attributes, disallowed URLs, embeds, retain/delete ops, line formatting, and stable equality without importing browser/editor/database modules.

## 2. Prisma persistence and owner isolation

- [x] 2.1 Add `ProblemNote` and `User.notes`, generate an additive reviewed Prisma migration and client through repository commands, and document the migration in the feature brief; verify the generated SQL contains the user/problem unique constraint and user cascade with no destructive progress changes.
- [x] 2.2 Implement server-only `features/catalog/server/problem-notes-service.ts` with a lazy database supplier, non-creating empty reads, and owner-scoped upsert using canonical problem IDs; verify service tests cover two learners/two problems, repeated and empty saves, missing users/notes, safe projections, no progress writes, and no database supplier call at module/factory construction.
- [x] 2.3 Apply/validate the migration only on an isolated Neon development branch and record results in the brief; verify real create/read/update/clear behavior, concurrent first-save uniqueness, account cascade, owner isolation, and preservation of existing progress. If development infrastructure is unavailable, leave this task pending and record the exact unverified check.

## 3. Notes HTTP boundary and client

- [x] 3.1 Add `features/catalog/server/problem-notes-handlers.ts` and GET/PUT delegates at `app/api/problems/[problemId]/notes/route.ts`; verify HTTP tests cover shared authentication/origin denial before database access, published slug-to-canonical-ID resolution, unknown problems, empty/read/save responses, no-store on success/errors, malformed JSON, extra owner fields, document/transport bounds, and sanitized persistence failures.
- [x] 3.2 Add `features/problems/lib/problem-notes-client.ts` with typed safe errors, encoded IDs, AbortSignal handling, and validated GET/PUT envelopes; verify tests cover network failures, 401/403/404/413/503, non-JSON errors, malformed successful documents/timestamps, and aborts without exposing raw server responses as UI text.
- [x] 3.3 Document the new API, byte limits, identity ownership, no-store behavior, and explicit-save/last-write semantics in `docs/development.md` and the brief; verify examples match the implemented `{content, updatedAt}` contract and add no secrets or new credential requirements.

## 4. Durable in-session notes state

- [x] 4.1 Add `features/problems/state/problem-notes.tsx` and mount its provider inside the existing learner/problem-keyed session above adaptive layout branches; verify component/hook tests show no request before Notes first opens, one initial read across repeated openings, no fetch for missing identity, and clean reset on learner/problem changes.
- [x] 4.2 Implement saved baseline, dirty state, explicit snapshot saves, load/save errors, and current-draft retries; verify state tests cover initial-read blocking/retry, failed-save draft retention, 401 guidance without automatic retry, duplicate-save prevention, and clearing an existing note.
- [x] 4.3 Guard request completions with session/request/edit generations and cancellation; verify deferred-promise tests prove late reads cannot overwrite edits, saving A while typing B preserves B as unsaved, and old-learner/problem completions cannot affect the new session. Record the session-only draft lifetime and failure semantics in the brief.

## 5. Rich-text Notes UI and first working slice

- [x] 5.1 Add the lazy Quill dependency and feature-owned `problem-notes-editor.tsx` adapter using full `getContents`/`setContents` documents and the allowed formats/toolbar; verify install/type checks and actual editor round trips preserve bold, italic, quotes, lists, code blocks, links, and empty content while paste/media/unsupported formats obey the contract.
- [x] 5.2 Build `problem-notes.tsx` with labeled controls, explicit Save, timestamp/status feedback, distinct load/save errors, retry/sign-in guidance, and session-only copy; verify component tests cover enablement, all user-facing states, edits during save, and inert literal markup. Check the real editor's development remount cleanup, selection behavior, and keyboard focus escape.
- [x] 5.3 Pass a notes slot from `ProblemExperience` through `LearningWorkspace` to `TutorPanel`, replace the Notes placeholder, update drawer copy, and scope editor CSS to existing semantic tokens; verify existing tool/focus tests plus notes transitions show preserved draft/code/inputs/help/results across tab changes, close/reopen, resize, and theme changes with a single visible editor.
- [x] 5.4 Add notes save/reload/clear and initial-load/save-recovery journeys to the existing authenticated `tests/e2e-auth/learning.spec.ts`, and notes access-denial coverage to the credential-free suite; verify test discovery through the root Playwright configs and run the signed-in Sleep slice using a dedicated development identity when available. Record runtime results or the precise infrastructure limitation in the brief.
- [x] 5.5 Review the working Sleep slice in a browser before broadening verification: test every supported format, long links/code, keyboard toolbar/Save, drawer focus return, light/dark themes, and 320px/mobile/desktop transitions; verify visible state and no page overflow, preserve existing learner work, and update `ui-registry.md`, README capability/planned-work copy, and the brief with observed behavior.

## 6. Integrated regression and delivery checks

- [x] 6.1 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`, including a credential-free build without rewriting environment files; verify they pass and that browser bundles exclude Prisma, account services, and private judging modules. Run `pnpm analyze` and confirm the editor is lazy-loaded; record checks and material bundle impact in the brief.
- [x] 6.2 With the production build complete and port 3000 free, run `pnpm test:e2e`; when dedicated auth/database setup is available run `pnpm test:e2e:auth`. Verify saved notes restore across fresh sessions and selected existing problems, unrelated Run/Submit/progress still work, and recognizable private notes never enter catalog/progress/problem/execution payloads. Report credential-free and authenticated outcomes separately.
- [x] 6.3 Review the same notes save/reopen/formatting journey in the online Electron runtime using existing desktop scripts; verify the shared API contract, link handling, keyboard use, and server-unavailable behavior without adding a native bridge, and record Electron-specific evidence or limitations separately.
- [x] 6.4 Reconcile the feature brief, README, development guide, and UI registry with actual delivery; verify the implementation meets every added requirement, deferred media/offline/AI work remains clearly identified, all required checks have honest results, and no production deployment or destructive rollback is implied.
