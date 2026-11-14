# Proposal

## Why

JavaScript Practice already establishes the app's catalog layout, but Learn opens a coming-soon page. Learners need a matching entry point for learning modules, starting with sample Two Pointers content so the section can be reviewed before deciding how individual lessons work.

## What Changes

- Replace `/javascript/learn` with a JavaScript learning catalog using Practice's page dimensions, category sidebar, searchable table, difficulty filter, counts, theme tokens, and responsive behavior.
- Publish one sample **Two Pointers** module under Arrays, also visible in Recommended. Display Module, Difficulty, Topic, and Lesson outlines; use real metadata and omit account flags and solved indicators until learning progress is defined.
- Let the module title open `/javascript/learn/two-pointers`, a small read-only module preview with an introduction, an original JavaScript example, and three sample lesson outlines: Introduction, Opposite-end pointers, and Same-direction pointers. These are content previews, without lesson links or completion claims.
- Preserve the existing Learn/Practice navigation and verified Neon Auth access on both catalog and module routes. Keep `/javascript` opening Practice and preserve existing practice destinations and behavior.
- Keep module metadata and trusted authored content separate from rendering. Extend content validation and update the affected availability copy, feature brief, and UI registry during implementation.
- Defer the individual lesson layout, lesson routes, interactive exercises, visualization, learning-specific AI/notes, bookmarks, progress persistence, and additional modules.

This request is interpreted as scaffolding **JavaScript Learn using the existing Practice layout**. The last reference to scaffolding Practice does not introduce a second practice catalog. Two Pointers is a JavaScript sample module here; the future Algorithms subject stays deferred.

## Capabilities

### New Capabilities

- `javascript-learning`: Authenticated discovery of JavaScript learning modules and access to their read-only previews, independently of coding practice.

### Modified Capabilities

None. The main OpenSpec capability inventory is empty. Existing documentation and tests reserve Learn as coming soon; this proposal deliberately replaces that placeholder while leaving the full guided-lesson experience deferred.

## Impact

- App routes under `apps/web/src/app/javascript/learn/`; new feature-owned catalog and preview components/helpers under `apps/web/src/features/learning/`; trusted content under `apps/web/src/content/javascript/learn/`.
- Reuse `packages/ui` primitives and existing semantic tokens. Keep learning metadata independent of the current practice types, which derive their topics from executable problem definitions.
- Update the content-check script, access/component tests, navigation/browser coverage, and docs that describe Learn's availability. Implementation will add one concise brief at `docs/features/javascript-learning.md`.
- No new API, Prisma model, migration, external service, dependency, or change to judging is needed. Existing uncommitted UI/tutor changes must be preserved.

Only OpenSpec planning artifacts are created in this proposal phase. App implementation and its verification remain pending.
