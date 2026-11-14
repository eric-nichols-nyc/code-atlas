# Design

## Context

See `proposal.md` for the outcome and scope, and `specs/personal-problem-notes/spec.md` for the behavior contract. This document records the agreed design; implementation and verification results are recorded in `docs/features/personal-problem-notes.md`.

Before this change, Code Atlas composed `ProblemExperience` → keyed `ProblemSession` → `WorkspaceTools` → `LearningWorkspace`. `TutorPanel` supplies AI tutor and Notes tabs; both contained placeholders. The desktop tools column and mobile Sheet can unmount their contents when closed or resized. State owned by the editor component would therefore lose drafts.

Protected Next.js handlers reuse `server/http.ts` (`requireLearner`, `readJson`, `json`). Account services live in `features/catalog/server`; `User.neonUserId` links verified Neon identities to internal user IDs. `PracticeProgress` stores flags, solved state, and executed code. Problems are file-authored and have stable IDs such as `javascript.sleep`; `findProblem` also accepts slugs and returns the canonical ID. No database Problem table or React Query provider exists.

### Reference evidence

The requested CodeDrill working tree was found at `/Users/ericnichols/Documents/monorepo-apps/codedrill`, not `Documents/ai-monorepos/codedrill`. Inspected on 2026-11-13; its HEAD was `9e7c21370e92ea144a657d23ad6fd572fb3f6124`. Paths in this table are relative to that source root. All 20 requested files informed this design.

| CodeDrill reference                                                                                                                               | Observed behavior                                                                                                                                                                      | Code Atlas adaptation                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/app/features/problem-workspace/components/chat-panel/components/chat-panel.tsx`                                                             | Notes is a sibling tab to chat.                                                                                                                                                        | Keep the existing Notes/AI tutor panel and icon behavior.                                                                                                                     |
| `apps/app/features/problem-workspace/components/chat-panel/components/problem-notes.tsx`                                                          | Lazy `react-quill-new`, HTML draft, one-time hydration, explicit Save, dirty state and saved time; toolbar includes media.                                                             | Use a lazy Quill adapter with the selected text/link toolbar, provider-owned draft, and full-document JSON.                                                                   |
| `apps/app/features/problem-workspace/components/chat-panel/queries/use-problem-notes-query.ts`                                                    | Conditional authenticated read; no retry on 401 and one retry for other failures.                                                                                                      | Start a read only when Notes opens; provide explicit retries and cancel/ignore obsolete requests.                                                                             |
| `apps/app/features/problem-workspace/components/chat-panel/queries/use-upsert-problem-notes-mutation.ts`                                          | Explicit mutation replaces cached saved note on success.                                                                                                                               | Acknowledge the submitted snapshot without replacing newer typing.                                                                                                            |
| `apps/app/features/problem-workspace/components/chat-panel/queries/problem-notes-api.ts`                                                          | Same-origin GET/PUT; runtime response checks; `{body, updatedAt}`.                                                                                                                     | Keep GET/PUT and response validation; use `{content, updatedAt}` with versioned structured content.                                                                           |
| `apps/app/features/problem-workspace/components/chat-panel/queries/problem-notes-keys.ts`                                                         | Cache key includes problem but no learner identity.                                                                                                                                    | Provider lifetime and request identity include both learner and canonical problem ID; no global notes cache.                                                                  |
| `apps/app/features/problem-workspace/components/chat-panel/queries/problem-notes-errors.ts`; `parse-problem-notes-error.ts` in the same directory | Typed network/auth/upstream errors.                                                                                                                                                    | Keep safe HTTP/network categories and user messages; omit internal-proxy secret/upstream error categories.                                                                    |
| `apps/app/app/api/problems/[problemId]/notes/route.ts`                                                                                            | Next proxies notes requests to a separate Nest API.                                                                                                                                    | Direct Next handler calls an account service after shared Neon identity/origin verification.                                                                                  |
| `apps/api/src/problem-notes/problem-notes.controller.ts`; `problem-notes.service.ts`; `problem-notes.module.ts`                                   | Guarded per-user GET/PUT, missing-note empty response, unique-pair upsert.                                                                                                             | Thin route plus handler factory and server-only Prisma service; no Nest modules.                                                                                              |
| `apps/api/src/problem-notes/dto/upsert-problem-note.dto.ts`                                                                                       | String body limited to 65,536 characters.                                                                                                                                              | Versioned document validation, 65,536 serialized UTF-8 bytes, plus a separate transport bound.                                                                                |
| `apps/api/src/app.module.ts`; `apps/api/src/problem-workspace-code/guards/problems-user.guard.ts`                                                 | Notes module registration; guard resolves a Clerk bearer identity.                                                                                                                     | Reuse existing Neon session boundary and the file-based Next route registration.                                                                                              |
| `apps/api/src/database/schema.ts`; `apps/api/drizzle/0004_problem_learning_notes_personal.sql`; `apps/api/sql/practice-platform.sql`              | One table mixes curated (`userId` null) and personal notes; migration adds updated time and a unique user/problem index. Baseline SQL lacks those later additions.                     | Separate `ProblemNote` model and additive Prisma migration; no copied SQL/bootstrap path or curated-note fields.                                                              |
| `apps/api/src/problems/problems.service.ts`; `apps/api/src/problem-chat/problem-context.builder.ts`                                               | Generic problem-details query retrieves learning notes by problem without an ownership filter; tutor context extracts selected note types. Personal writes currently use type `other`. | Keep personal notes outside generic problem data entirely. No personal-note import into tutoring; no claim that the existing context builder currently includes type `other`. |

## Goals / Non-Goals

**Goals:** Integrate a complete save/restore slice through existing boundaries; preserve in-session drafts across UI remounts; define identity, validation, ordering, and failure semantics before implementation.

**Non-Goals:** No separate API application, new authentication boundary, shared query-cache architecture, database-backed problem catalog, or raw HTML rendering. The scope exclusions in the proposal remain applicable. Use the online desktop renderer's existing web origin without a native notes bridge.

## Decisions

### 1. Separate account notes from progress and authored problem content

Add this conceptual Prisma model in `packages/db/prisma/schema.prisma`:

```prisma
model ProblemNote {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  problemId String   @db.VarChar(160)
  content   Json
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @db.Timestamptz(3)

  @@unique([userId, problemId])
}
```

Add the corresponding `User.notes` relation. `content` includes its own format version. Store canonical file-authored problem IDs; validate them before accessing persistence. Do not invent a Problem foreign key. The account foreign key cascades note deletion with the existing User.

Reads find the User by verified Neon ID and return empty content if no User/note exists; reads need not create records. Saves lazily upsert the User and then upsert the note by the unique pair, updating content and updatedAt only. `getDb()` is called inside the service operation after handler authentication and input validation. Service factories accept a database supplier for boundary tests, following the current progress pattern.

**Alternatives:** Adding a field to PracticeProgress couples unrelated writes and payloads. Copying CodeDrill's mixed curated/personal table requires ownership filters in every content query and creates avoidable exposure paths. A separate table gives notes one explicit access path.

### 2. Use a restricted full-document Delta rather than saved HTML

Use Quill directly in a small React adapter under `features/problems/components/problem-notes-editor.tsx`, dynamically loaded only when Notes is shown. This retains the reference interaction without depending on a React wrapper or copying its HTML persistence. Quill exposes full documents through `getContents`/`setContents`; its Delta format distinguishes full documents from edit operations. [Quill API](https://quilljs.com/docs/api), [Delta contract](https://quilljs.com/docs/delta).

The application wire/storage envelope is:

```json
{
  "content": {
    "formatVersion": 1,
    "document": { "ops": [{ "insert": "\n" }] }
  },
  "updatedAt": null
}
```

PUT sends only `content`; GET/PUT return the envelope. The example is a note that does not exist yet. A saved empty note has the same canonical blank document and a non-null timestamp.

Define an application-owned, serializable document type and pure validator/normalizer in `features/problems/lib/problem-notes-contract.ts`; import it from client and server without importing Quill, React, or Prisma. Validate unknown request and response data. Rules:

- Exact envelope/document/op keys, formatVersion 1, 1–4,096 insert-only operations, nonempty string inserts, and a final newline. Reject retain/delete operations and object inserts, including embeds.
- Allow only bold/italic true, safe link strings, blockquote, ordered/bullet list, and plain code-block attributes. Enforce valid inline versus line-attribute placement and mutually exclusive block formats; normalize Quill's emitted plain code-block value consistently.
- Only absolute HTTP/HTTPS links up to 2,048 characters; parse URLs, reject control characters and other protocols, and apply safe link target/rel behavior. Do not server-fetch links.
- Bound both submitted and normalized `JSON.stringify(content)` to 65,536 UTF-8 bytes. Use a 512 KiB streamed request cap for JSON whitespace/escaping overhead. Too many ops or invalid structure is HTTP 400; a byte-limit violation is 413.
- Normalize equivalent adjacent operations and attribute ordering for stable equality. Represent an empty editor as one unformatted newline; preserve intentional text whitespace/code.
- Configure the editor's allowed `formats` as well as its toolbar. Toolbar visibility alone does not constrain pasted formatting. [Quill formats](https://quilljs.com/docs/formats).

Never render note content with MDX, eval, `dangerouslySetInnerHTML`, or a raw HTML insertion helper. Load/save only validated document snapshots; the incremental text-change argument is not the document. Restrict pasted content to the supported formats; media embeds do not enter the draft.

**Alternatives:** Plain text/Markdown does not match the selected rich-text interaction. HTML requires a second sanitization/round-trip policy and can embed unsafe browser behavior. A rich-text framework plus separate React integration is unnecessary for this bounded editor. Versioning the application contract allows later conversion without exposing arbitrary editor internals as trusted data.

### 3. Extend the current server boundary

Add `apps/web/src/app/api/problems/[problemId]/notes/route.ts` exporting Node runtime GET/PUT delegates. Put `createProblemNotesHandlers` and `createProblemNotesService` in `features/catalog/server/problem-notes-handlers.ts` and `problem-notes-service.ts`; guard privileged entries with `server-only`. This preserves the repository's ownership rule for account data access.

Request order: `requireLearner(request)` → resolve params with `findProblem` and use `.id` → for PUT call `readJson(request, 524288)` and validate content → invoke the account service → project/validate the public envelope → `json(...)`. Accept the same slug-or-ID resolution as existing progress routes, but always persist under the canonical ID. Unknown problems return 404 before database access. The explicit `notes` route is separate from the existing `[action]` execution route; Run/Submit stay unchanged.

Use existing 401/403/503 access behavior, 400 invalid JSON/document, 413 size errors, and 503 for unavailable persistence. Every handled response uses the existing no-store JSON helper, including thrown body-limit Responses. Return stable safe messages; never pass through database exceptions. GET missing notes is successful empty data, not a 404. Unknown body keys, including owner IDs, are rejected; query parameters never select ownership.

**Alternatives:** The reference's Next-to-Nest proxy, Clerk guard, and Drizzle module have no place in the consolidated Code Atlas server. Reusing the execution handler would couple notes to judge limits and policies. Notes do not need admin privileges or new credentials.

### 4. Keep notes state above panels, with one active request per operation

Add a `ProblemNotesSession` provider in `features/problems/state/problem-notes.tsx`, inside the existing learner/problem-keyed `ProblemSession` and above `WorkspaceTools`/`LearningWorkspace`. Supply the Notes view through a `notes` ReactNode slot from `ProblemExperience` through `LearningWorkspace` to `TutorPanel`, so the shared learning shell does not import problem-specific state.

State owns load status, saved document/timestamp, draft, edit generation, read/write errors, controllers, and request/session generations. `ProblemNotes` mounting on the active tab calls an idempotent `ensureLoaded`; never refetch on theme, resize, focus, or tool toggles. No session identity means no request and a sign-in state. The existing outer key resets notes on learner/problem changes; cleanup aborts reads and invalidates late completions. A write may already have committed even if its response is abandoned, so abort is not represented as rollback.

Initial load disables editing/Save until a validated response arrives. A failed initial read exposes Retry loading notes and stays blocked, preventing accidental overwrites of an unknown server note. Once loaded, the editor can remain editable during a save. Snapshot the submitted document and edit generation; on success update the saved baseline and timestamp, and normalize the current draft only if it has not changed since submission. Later typing remains unsaved. Disable duplicate saves; retries submit the current draft. Never replace an edited draft with a late read. Apply a completion only to its original session/request generation.

Use `features/problems/lib/problem-notes-client.ts` for GET/PUT, encoded canonical IDs, AbortSignal support, response validation, and a small HTTP/network error type. Do not add React Query or global cache keys. No automatic retries; 401 gets sign-in guidance and other failures get explicit retry. Preserve the loaded draft on failures until that learner/problem session ends.

**Alternatives:** Component-local state disappears when the panel unmounts. Extending the code execution state with notes obscures independent persistence semantics. Global caching requires a learner-qualified key and lifecycle rules without adding value for one active problem.

### 5. Make saved scope and multi-device behavior explicit

Dirty compares normalized current content with the last acknowledged server content. Show Loading your notes, No saved notes yet, Unsaved changes, Saving, Saved with local formatted server time, and Not saved, using existing semantic styles and small Buttons. Keep load errors separate from save errors. The editor footer includes concise copy that unsaved changes remain only until leaving/reloading the problem.

Use last successful database write wins across sessions. This slice has no revision precondition, background refresh, or merging. A timestamp identifies the acknowledged save, not proof that another device has not since saved. Notes Save never triggers Run/Submit or changes progress. Reset code never resets notes.

**Alternatives:** Autosave or optimistic concurrency changes the reference workflow and adds scheduling or conflict UI. Those can be separately specified later; this slice does not promise offline or collaborative synchronization.

### 6. Reuse workspace presentation and verify the real editor

Keep existing tabs, Sheet focus restoration, Notes icon active state, 42px panel header, and semantic tokens. Scope editor CSS in app globals under a notes class; toolbar wraps within the existing 256–360px tools column. Code blocks scroll inside the editor. Mount a single visible editor, reserve loading space, and clean up event listeners/DOM on remount. Theme changes use CSS without reconstructing the editor. Give formatting buttons accessible names and pressed state; preserve selection while applying formatting and support ordinary Tab focus escape.

Update the Sheet description to distinguish available notes from the still-unavailable AI tutor. No UI should imply notes are saved before persistence exists. Use current shared Buttons and icons; add a shared primitive only if implementation actually needs one. Review the lazy editor chunk through `pnpm analyze`, and verify mount/unmount in React's development lifecycle rather than relying only on an editor stub.

**Alternatives:** Copying the reference's snow theme globally can override Code Atlas panels. Replacing the workspace shell creates unrelated layout risk. An isolated mock can test state but cannot prove actual rich-text round trips or keyboard behavior.

## Risks / Trade-offs

- [Formatted documents introduce untrusted structure] → Validate the restricted versioned document on requests and responses; render no HTML; test malformed structures, disallowed links, media, Unicode bounds, and literal markup.
- [Reference combines public and private note storage] → Separate personal model/services and assert recognizable note content never appears in other payloads. Do not copy generic learning-notes queries.
- [Explicit Save leaves session-only drafts] → Keep state across panel changes, show the lifetime clearly, and restore only confirmed server data after navigation/reload. Browser backups and unload prompts are outside scope.
- [Two devices can overwrite each other] → Document last-write semantics; do not imply live sync. Add conflict detection only in a separate change.
- [Lazy editor lifecycle or formatting normalization loses work] → Test full documents, real formatted save/load, dirty equality, Strict Mode remounts, tool/tab remounts, and edits during saves; keep the authoritative draft above the view.
- [External editor increases client cost] → Load on demand and inspect bundle analysis; keep the document validator editor-independent.
- [Authenticated browser/database checks need infrastructure] → Use an isolated Neon development branch and dedicated test identity; report blocked checks as unverified. Credential-free smoke cannot prove persistence or Electron behavior.

## Migration Plan

1. During implementation, create/update the short `docs/features/personal-problem-notes.md` brief from these artifacts and record verification there. Do not duplicate every OpenSpec artifact into the brief.
2. Create an additive Prisma migration with the note table, unique pair, and account cascade; regenerate the client. Review SQL and validate create/update/empty-save/ownership/concurrent-first-save on an isolated Neon development branch. No CodeDrill import or existing progress backfill is required.
3. Deliver Sleep end to end through API, provider, and editor before checking the remaining existing problems. Existing generic problem routes make the same notes capability available without per-problem content changes.
4. Run root lint/typecheck/tests/build, including a credential-free build. With port 3000 free and the build complete, run `pnpm test:e2e`. Extend/run `pnpm test:e2e:auth` with a dedicated development learner when configured; it currently matches `learning.spec.ts`, so add the notes journey there unless its discovery configuration is deliberately extended.
5. Review Notes save/reload and recovery in a signed-in browser, keyboard/light/dark/320px layouts, source/result preservation, and the online Electron runtime. Update README, development API documentation, ui-registry, and the brief with actual results and limits.
6. For a later authorized deployment, apply the additive migration before exposing the new handlers/editor. If application rollout is rolled back, retain the note table/data and restore the prior UI; do not drop learner notes as part of code rollback. No deployment or migration runs in this proposal workflow.
