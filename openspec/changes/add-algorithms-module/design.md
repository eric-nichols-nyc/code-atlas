# Design

## Context

See `proposal.md` for the outcome and the two capability specs for acceptance behavior.

Observed implementation:

- `DashboardContent` enables only JavaScript even though subject data already lists Algorithms.
- JavaScript App Router pages perform their own session checks, then compose content catalogs and feature components. The proxy already handles protected nonpublic routes generally.
- `JavaScriptLearn`, `LearningModuleOverview`, `learningModuleHref`, `JavaScriptPractice`, `SiteNav`, and the focused workspace contain JavaScript-specific headings, topic imports, or return paths. Practice row links already derive from `subjectId`.
- The current JavaScript lesson is the Two Pointers preview with strategy prose, diagrams, links, and a six-step authored walkthrough. The newer walkthrough behavior removes the bottom outline section; the older scaffold spec's outline rendering is superseded. Lesson-related files are being edited in the existing working tree, so the copy must follow the coherent content actually referenced by the preview when implementation starts.
- Public problem definitions have string `subjectId` values, but their topic/kind unions, input/output unions, validators, and testcase drafts lack the proposed problem. Current outputs do not include booleans.
- Judging selects private suites by kind and delegates to bounded QuickJS worker adapters. Account progress and notes use stable problem IDs and existing learner ownership rather than subject-specific tables.
- Tutor publication checks, statement paths, content validation, and production statement tracing assume JavaScript. Adding routes alone would leave Algorithms incomplete.

The working tree contains substantial unrelated and in-progress changes. Implementation must preserve them and avoid resets, generated rewrites, or edits to unrelated features.

## Goals / Non-Goals

**Goals:** Introduce a second subject through explicit catalog/navigation inputs, deliver the entire anagram problem through the existing judge, and preserve JavaScript behavior and account identity. Maintain server access checks, credential-independent builds, and the current UI registry conventions.

**Non-Goals:** Build a generic curriculum engine, replace content publishing, add a language/runtime, enforce a particular learner algorithm, redesign account storage, or extend the copied lesson with new interaction features. No new dependencies or schema migration are expected.

## Decisions

### 1. Keep explicit subject routes and parameterize the existing features

Add thin Algorithms route entries mirroring JavaScript:

| Route                                | Behavior                                  |
| ------------------------------------ | ----------------------------------------- |
| `/algorithms`                        | Temporary redirect to Algorithms Practice |
| `/algorithms/learn`                  | Authenticated module catalog              |
| `/algorithms/learn/[moduleSlug]`     | Authenticated published preview lookup    |
| `/algorithms/practice`               | Authenticated problem catalog             |
| `/algorithms/practice/[problemSlug]` | Authenticated published problem workspace |

Declare the root redirect in Next's redirect configuration as well as the route entry, following the existing JavaScript solution for streaming redirect status. Add matching loading, error, and not-found boundaries with subject-correct return destinations.

Refactor the existing Learn and Practice renderers only as needed to accept subject title, topics, and base destinations. Topic-dependent category helpers accept explicit topic data. Keep current JavaScript call sites compatible with wrappers or update all callers together. Add an explicit learning base path to module link creation and preview rendering; pass a practice return path into the workspace through `ProblemExperience`.

`SiteNav` resolves the current supported subject by complete path segment, derives Learn/Practice destinations, and suppresses the header on focused practice routes for both subjects. Preserve its pending-link feedback, accessible names, Dashboard leading item, and mobile disclosure. Enable Algorithms in the dashboard without changing React availability.

Alternative: copy all JavaScript components into parallel Algorithms components. Rejected because fixes to navigation, filters, tools, and responsive layout would immediately diverge. A dynamic `[subject]` route overhaul is unnecessary for two explicit subjects.

### 2. Copy authored lesson content; share the renderer

Create `apps/web/src/content/algorithms/learn/catalog.ts`, `overviews.ts`, and `two-pointers/` content assets. Give the copied module ID `algorithms.learn.two-pointers`, retaining slug `two-pointers`, the Arrays topic, Easy difficulty, ordering, outlines metadata, and teaching content. Copy the overview and every local data asset it references, including example and walkthrough definitions. Keep source references internally consistent and register copied authored interactions for validation using the same scope rules as JavaScript.

Copy the lesson as delivered by the JavaScript preview at implementation time. Preserve any already integrated embedded interaction and its existing behavior; do not activate unreferenced draft assets or expand their capabilities. Record which content was copied in the feature brief. The six-step walkthrough remains an explanation, not judging or saved progress.

Alternative: import the JavaScript overview directly from the Algorithms page. Although visually similar, that would make future JavaScript-specific lesson edits silently redefine Algorithms content and would not satisfy the requested subject-owned copy.

### 3. Define a bounded Valid Anagram contract with truthful teaching content

Add a public `valid-anagram` definition with stable ID `algorithms.valid-anagram`, subject `algorithms`, topic `two-pointers`, kind `valid-anagram`, Easy difficulty, and entry function `isAnagram`. Extend the public topic/kind contracts, add `{ s: string; t: string }` to `ProblemInput`, and add boolean to `ProblemOutput`. Register the definition in existing exports and lookup while keeping route membership checks specific to the requested subject.

Interpret the user's “anagram two pointer” as Valid Anagram. The reference solution checks lengths, creates sorted character copies, and advances one forward pointer through each copy, returning false on the first mismatch. Its scan is linear; sorting makes overall time O(n log n), with O(n) copied storage. Hints connect this same-direction scan to the Two Pointers lesson. Correct frequency-count solutions remain acceptable because judging checks behavior.

Author the statement under `content/algorithms/practice/valid-anagram/problem.mdx`, with its own catalog and statement loader. Use lowercase ASCII input strings with lengths 0–1000, preserving empty strings. This bounded initial contract fits the existing practice runner and avoids introducing normalization or Unicode semantics. Include successful permutations, negative matches, repeated letters, unequal lengths, and empty inputs in public examples or explanations.

Alternative: require direct opposite-end comparisons in unsorted strings. Rejected because that does not correctly decide anagrams. A frequency-count reference solution is valid but would not teach the requested pointer approach.

### 4. Add string drafts and strict boolean judging within existing boundaries

Extend testcase draft handling with explicit string fields instead of reusing numeric conversion or JSON parsing. Add labeled shared Input controls for `s` and `t`, preserve exact values, and allow empty strings without trimming. Client and server validators enforce the same alphabet, lengths, and exact object shape. Update input formatting to display quoted strings. Existing result rendering uses explicit undefined checks; retain those and verify both boolean values render correctly.

Add `features/problems/server/adapters/valid-anagram.ts` and register it in the existing worker dispatch and private suite. Pass string arguments through QuickJS handles, never by interpolating learner inputs into host-evaluated source. Keep learner function calls and potentially adversarial behavior inside the timed guest. Accept only primitive boolean outputs; do not coerce truthy values, serialize arbitrary returned objects, or invoke learner-controlled getters on the host.

Use an independent server-side character-frequency oracle for expected booleans. Include repeated-character traps, same-length negatives, unequal lengths, empty cases, and 1000-character boundary cases in the private suite. Reuse existing memory, stack, CPU, wall-time, output, and concurrency limits, worker compilation, source snapshots, hidden-result redaction, and verdict conventions. Test compile errors, exceptions, nontermination, and invalid output types through the compiled worker.

Alternative: a page-only example or client-side evaluator would not provide the existing practice behavior or isolation contract.

### 5. Reuse account APIs and make content lookup subject-aware

Continue to use existing `/api/problems/[problemId]/...` and practice-progress endpoints. Resolve the known problem ID server-side, verify identity/ownership as today, and call `getDb()` only after authorization. Existing ID-based persistence supports Algorithms without changing the schema. Preserve the distinction between judge acceptance, saved progress, and failed persistence.

Replace the tutor's single JavaScript publication check with a static registry of supported published subject catalogs. Derive statement files from trusted registered problem metadata, not raw URL segments. Ensure Algorithms statements are included in Next production file tracing. Keep public tutor context projections, current-source behavior, hidden-data exclusion, and missing-provider feedback unchanged; adjust JavaScript-only subject wording where needed to describe Algorithms practice accurately. No provider/key setup or live external AI call is required to implement these lookups; validate with the existing injected provider pattern.

Extend `validate-learning-content.ts` to validate each subject independently and then compare the union of published problem IDs to public definitions. Require globally unique IDs and subject-scoped slug/order uniqueness, correct subject membership, complete statement mappings, valid string samples, boolean expectations, and copied lesson references. Avoid comparing the JavaScript-only catalog length to the now multi-subject global registry.

Alternative: introduce separate Algorithms progress APIs and models. Rejected because the existing stable-ID account model already serves this behavior.

## Risks / Trade-offs

- Shared-component regression → Cover both subjects' titles, category data, active links, back links, unknown/foreign slugs, loading states, and unchanged JavaScript journeys.
- Copied content can drift → Keep the copy subject-owned, verify initial parity against the actual source lesson, and document the source in the brief. Later edits are deliberate per subject.
- Concurrent edits to the JavaScript lesson → Re-read its referenced content immediately before copying; preserve existing edits and avoid copying unfinished, unreferenced assets.
- Boolean `false` or empty strings can be mistaken for missing values → Use explicit undefined checks and round-trip tests, with no trimming or truthiness fallback in draft parsing.
- New adapter could weaken execution isolation → Reuse guest boundaries and limits; test hostile return values, exceptions, and nontermination through the worker.
- Production tutor context could lack the new statement → Extend trace includes and verify registered Algorithms context loading without requiring a live provider.
- Browser authentication or database infrastructure can limit verification → Report credential-free smoke, authenticated automation, manual browser review, and any unavailable checks separately. Never replace real-journey results with mocked success claims.

## Migration Plan

1. At implementation start, add `docs/features/algorithms.md` with the short outcome, scope, acceptance checks, implementation checklist, and initially pending verification. Preserve current unrelated work.
2. Add subject-aware rendering/content, public problem contracts, compiled worker judging, Algorithms routes, and existing-tool integration as one reviewable slice.
3. Run content validation and root lint, typecheck, tests, and credential-independent build; then production Playwright using a completed build and a free configured port. Preserve any user-run development server, using ignored local test/config copies with an explicitly documented alternate port if necessary.
4. Review both Algorithms journeys in the browser at desktop and 320px widths with keyboard and shared themes. Verify JavaScript regression journeys and account isolation. Record actual results and limitations in the brief, then update README, UI registry, and constitution availability wording to reflect delivered behavior.

No database migration or account data rewrite is required. Rollback restores the prior application build and removes the Algorithms entry point; any existing Algorithms records can remain inert under their stable IDs. Do not delete learner data to roll back this feature. No packaged Electron claim is made without a separate desktop check.
