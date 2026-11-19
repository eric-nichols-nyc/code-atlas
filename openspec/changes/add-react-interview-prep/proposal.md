# Proposal

## Why

React Learn explains concepts, but learners do not yet have a focused way to rehearse explaining, predicting, and defending React behavior in an interview. Add an **Interview Prep** module that turns the existing reading experience into short, active rehearsals with authored feedback.

## What Changes

This is a proposed direction for review, not a selected implementation or a delivered feature. Three approaches were considered:

| Idea                                             | Learner experience                                                                                                                        | Strength and tradeoff                                                                                                                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Explain, Predict, Fix — recommended first** | A 10–15 minute set of short code and reasoning prompts; write an answer, reveal a rubric and model explanation, then try a follow-up.     | Fits production React Learn and builds explanation skills with modest engineering scope; self-review does not verify coding ability.                                           |
| **2. Debugging and component challenges**        | A 20–30 minute task such as fixing a stale request or building an accessible accordion; inspect behavior and discuss tests and tradeoffs. | Closest to hands-on work; production needs a defined React execution and evaluation boundary beyond today's development pilot.                                                 |
| **3. Structured mock interviews**                | A 30–45 minute sequence: clarify requirements, outline an approach, solve a task, explain tests, and review the attempt.                  | Rehearses communication under realistic constraints; authored branching is possible, while adaptive AI and live coding add evaluation, runtime, cost, and session design work. |

The recommended initial change specifies idea 1 only:

- Publish **Interview Prep** in React Learn, under a new Interview Prep category and Recommended, at `/react/learn/interview-prep`. Keep Learn active; reuse the existing subject catalog and reading shell.
- Deliver one coherent **State, rendering, and effects** rehearsal with three authored drills: predict queued state updates, replace unnecessary derived-state Effects, and explain Effect cleanup/dependencies/Strict Mode.
- For each drill, show the prompt and optional read-only source; accept an optional written rehearsal; reveal a concise model answer, reasoning checklist, common mistake, official reference, and one follow-up on demand.
- Allow Previous/Next, per-drill self-review labels **Needs review** / **Comfortable**, and an end summary of those labels. Preserve visit state across layout/theme changes; explain that leaving or reloading discards it. Labels are learner opinions, not scores or proof of readiness.
- Make the module available after authentication in production without loading the development sandbox or contacting an AI provider. Introduce a module-specific presentation option so its page does not say interactive exercises are still unavailable.
- Defer account persistence, spaced repetition, automatic correctness scores, timers, generated questions, AI interviewing, live execution, and the other two approaches. These are separate product choices, rather than hidden prerequisites for this first release.

Technical and interview-format evidence, with direct primary-source links and limits, is recorded in [research.md](research.md). The durations and first-release scope above are product recommendations, not claims established by research.

## Capabilities

### New Capabilities

- `react-interview-prep`: Authenticated discovery and authored React interview rehearsal, including answer reveal, self-review, visit-state behavior, and accessible navigation within React Learn.

### Modified Capabilities

None. The main capability inventory is empty. Completed React Learn and React sandbox change artifacts provide context; this proposal extends Learn with an explicitly scoped interactive module while preserving the sandbox's production restrictions.

## Impact

Add trusted content under `apps/web/src/content/react/learn/interview-prep` and feature behavior under `apps/web/src/features/react-interview-prep`. Extend the React learning catalog/overview registry, shared overview presentation through an optional explicit prop, and content validation. The existing authenticated dynamic Learn route owns entry; no new API, Prisma model, credential, runtime, or dependency is proposed.

Implementation will first create the required one-page `docs/features/react-interview-prep.md` brief, then deliver one complete rehearsal for browser review. Focused content/component/route coverage and production browser checks must confirm accurate content, visit-only self-review, accessible rendering, and regression safety for existing Learn, Practice, and sandbox gates. Availability documentation must distinguish the new interactive rehearsal from older read-only module previews.
