---
name: feature-workflow
description: Build or revise Code Atlas features with a short feature brief, consistent feature folders, one working slice, and direct browser review. Use for feature work in this repository; handle small fixes directly.
---

# Code Atlas feature workflow

Read `AGENTS.md`, the relevant existing feature, and `ui-registry.md` for UI work. Keep the user's latest interaction model and scope as the source of intent.

## Decide the size

For a small bug, copy edit or styling adjustment, implement and verify directly. For new behavior, keep one brief at `docs/features/<feature-name>.md`. Update the existing brief when revising the same capability. Aim for one page containing:

- Outcome and the first working example the user will review.
- Included scope and explicit later work.
- Observable acceptance checks.
- A short implementation checklist.
- Actual verification results and any remaining limitation.

Give a short plan in chat and proceed within the authorized scope. Ask a focused question only when the answer changes what the user will receive and cannot be inferred. The brief is a working note, not an approval gate. Use the installed Spec Kit workflow when the user requests it or chooses a more formal planning process.

## Keep a repeatable code pattern

Routes compose and enforce access. Feature folders own their components, state/hooks, pure helpers and colocated tests. Follow the existing feature's names; add a subfolder only when there are files for it.

- `apps/web/src/features/<capability>/`: learner behavior and UI.
- `apps/web/src/app/api/**/route.ts`: thin Next.js App Router API entry points.
- `apps/web/src/features/<capability>/server/`: authenticated server behavior, private judging and persistence.
- `apps/web/src/content/<subject>/<problem>/`: trusted authored prose.
- `packages/ui/`: reusable visual primitives and theme tokens.
- A shared domain package only when real consumers need the same contract/data. Keep privileged entry modules guarded by `server-only` and private data out of browser imports.

A feature can span client/server/shared contracts while keeping each layer's ownership clear. Prefer extending an existing feature to creating another abstraction. Keep product-specific state out of shared UI primitives.

## Build one reviewable outcome

Wire the primary journey with real behavior before expanding content. Review the actual browser as soon as that journey works. A control counts as working only when its outcome is implemented: a placeholder Submit message is not judging, and a prepared animation is not code execution.

Let the user review the first complete example before adding more. Change layout and copy directly during review without regenerating a document set. Keep existing source and user work intact while testing.

## Close the loop

Run checks from root `package.json` appropriate to the change. Use meaningful tests for behavior and boundaries; verify changed UI in the browser. Preserve the architecture/security constraints in `AGENTS.md` and the constitution. Larger risks can justify focused research or design notes within the same brief.

Update the brief with what works and what was actually verified. Update `ui-registry.md` when a reusable visual pattern changes. End with the working result, key checks and material limits. Keep existing Spec Kit artifacts as history unless the user requests changes to them.
