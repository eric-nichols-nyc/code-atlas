# Design

## Context

See [proposal.md](proposal.md) for the three product options and the recommended first release, and [research.md](research.md) for evidence. This design describes the recommendation for review; it does not record a user selection among the alternatives.

Observed integration points:

- React Learn uses the shared `LearningCatalog` and `LearningModuleOverview`, typed metadata in `content/react/learn/catalog.ts`, and lazy trusted MDX loaders in `overviews.ts`.
- `/react/learn/[moduleSlug]/page.tsx` checks setup and learner identity before resolving content. It can host the new module without a second page hierarchy or API.
- The shared overview currently hardcodes **Module preview** and says interactive exercises are coming later. That copy needs an explicit module presentation override; defaults must preserve existing previews.
- The content checker validates metadata, outlines, overview publication, and optional walkthrough references. Existing React tests assume exactly one published module and must be revised around the new inventory.
- React Practice is a development-only hosted sandbox without production resource budgets or judging. An interview module must not silently enable it or send written answers to the existing tutor.

## Goals / Non-Goals

**Goals:** Reuse the catalog, authenticated reading route, themes, and responsive presentation while placing new rehearsal state in one feature. Keep authored prompts and feedback independently reviewable and verifiable.

**Non-Goals:** Build a general assessment engine, infer answer correctness, introduce a lesson-route system, or reuse practice solved/progress records for confidence labels. The proposed module displays source as text and never runs learner input.

## Decisions

### 1. Keep Interview Prep within React Learn

Add a recommended Medium module with stable ID `react.learn.interview-prep`, slug `interview-prep`, order 20, and topic `interview-prep` labeled **Interview Prep**. Give it one authored outline, **State, rendering, and effects**, representing the single rehearsal. The three drills are exercises inside that outline, not three separate lesson routes or completion counts.

The existing catalog supplies category/search/difficulty behavior. Recommended contains the Hooks preview and Interview Prep; Hooks remains scoped to its current lesson. Learn stays active and Back to Learn returns to `/react/learn`.

Alternative: add an Interview navigation section or place this in Practice. Both create a larger navigation/execution commitment than a module requires. A new section remains a possible future direction if the user chooses mock interviewing.

### 2. Separate authored content from rehearsal state

Use `content/react/learn/interview-prep/overview.mdx` for the introduction and `drills.ts` for a single typed pack with three stable drill IDs. Each drill declares its kind, prompt, optional source, model answer, reasoning checklist, common mistake, direct official reference, follow-up prompt, and follow-up explanation. State the source assumptions, including initial state and development/production behavior where relevant.

Add feature-owned types and validation under `features/react-interview-prep/lib`. Extend the existing content-check script to validate the registered pack: unique IDs, required nonempty fields, nonempty checklist, official HTTPS references, and an existing published owning module. Keep the pack in trusted source; answers are public teaching content, not private judging data.

The MDX overview composes a small `InterviewPrepSession` client component from `features/react-interview-prep/components`, passing authored data. Written answers remain ordinary textarea strings, never MDX, HTML, evaluated code, or model instructions. Use read-only code blocks with local overflow, rather than another editable runtime or editor dependency.

Alternative: reuse the judged-problem contract or build a generalized quiz schema. Neither represents optional free-form rehearsal plus self-assessment accurately; keep this feature specific until another real consumer exists.

### 3. Define a small, explicit session

Start on drill 1 of 3. Show a labeled optional answer field with a 4,000-character limit, **Reveal answer**, and Previous/Next controls. Answer reveal shows the model answer, checklist, common mistake, documentation, and a follow-up prompt; **Reveal follow-up** shows its explanation. Reveal never submits or grades text and remains available with an empty answer.

Store current drill and a map of answer text, main/follow-up reveal state, and optional self-review label by stable drill ID. Enable **Needs review** / **Comfortable** after revealing the rubric; an unanswered label remains **Not reviewed**. Revisiting a drill restores its state. Rating changes update the same record, without incrementing historical totals.

The last Next action opens a summary grouping all three prompts by their current self-review labels, including Not reviewed. Each summary item returns to its drill. Do not gate navigation on an answer or rating, and do not generate a percentage, pass/fail verdict, or hiring prediction. Prominently state that drafts and review labels last only for the mounted visit and are discarded on leaving/reload. No browser storage, account write, or analytics payload contains response text.

Alternative: mandatory answers, automatic grading, or saved schedules. Those require separate decisions about assessment quality and persistence; they are not needed to rehearse an explanation.

### 4. Extend the shared shell through an explicit presentation prop

Allow `LearningModuleOverview` an optional presentation value containing the badge label and introduction. Declare the new module's presentation alongside React overview registration and pass it through the existing dynamic page. Use **Interview rehearsal** and accurate visit-only/self-review copy for this module. Retain the default **Module preview** wording for existing subjects and the Hooks lesson.

Keep the feature-specific controls inside the existing reading surface, with shared Button/Badge and existing form primitives where suitable. Preserve semantic themes, heading hierarchy, visible focus, and document reading order. Drill changes focus the new drill heading; answer reveal retains focus on its disclosure and exposes expanded state. Announce drill number and review status politely. Contain code scrolling at 320px and keep session state above responsive/theme branches.

Alternative: change the shell copy globally or fork the entire overview. A scoped override communicates the new capability without misrepresenting existing previews or duplicating layout.

### 5. Keep production independent of execution and AI

Load the authored pack only through authenticated Learn pages. Reuse setup, error, loading, and unavailable-module behavior. This module has no sandbox/provider request and no persistence endpoint. Existing production exclusions for React Practice and its tutor remain effective.

The short rehearsal intentionally extends the earlier read-only Learn scope. Update availability wording in README, the UI registry, constitution, and feature brief during implementation to describe this specific interaction; preserve the execution and account-ownership rules. Earlier completed change artifacts remain historical context.

## Risks / Trade-offs

- Self-review can overstate confidence → show the rubric and the learner's own labels, retain an unreviewed state, and make no correctness or readiness claim.
- Model answers can imply one valid implementation → explain the behavior being evaluated and accept alternative reasoning that meets it; include explicit runtime assumptions and official sources.
- Short drills cover only part of interview practice → clearly describe the first pack and preserve practical challenges/mock sessions as alternatives, without advertising them as available.
- Navigation/reload loses drafts → disclose visit-only behavior beside the answer field and in the summary; persistence is a separately scoped enhancement.
- A shared-shell change can affect other subjects → preserve defaults and check JavaScript, Algorithms, and Hooks previews along with the new module.

## Migration Plan

No data migration or credential setup is needed. Before implementation, create the concise `docs/features/react-interview-prep.md` brief from this proposal. Deliver the authored pack, feature interactions, registry/presentation integration, validation, and focused checks as one reviewable slice. Use existing root scripts for lint/typecheck/tests/build and content checking, then review authenticated production behavior at desktop and 320px in all shared theme settings and with keyboard/reduced motion.

Use a completed build and a free production test port, preserving active user work. Separately report credential-free smoke checks and authenticated review; do not claim packaged Electron verification from browser evidence. Record actual results in the brief. Rollback removes the new module/feature/presentation registration and restores default content counts, while leaving existing Learn and Practice behavior intact.
