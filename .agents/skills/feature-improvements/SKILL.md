---
name: feature-improvements
description: Improve existing Code Atlas features by reusing their brief, refining success criteria, implementing a focused change, and checking existing behavior. Use for enhancements to an existing capability; handle small styling, copy, and localized bug fixes directly.
---

# Code Atlas feature improvements

Extend the existing feature and its documentation. Use the project conventions in
`AGENTS.md`, and read `ui-registry.md` for UI work. New capabilities use
[feature-workflow](../feature-workflow/SKILL.md).

## Choose the scope

For a small styling, copy, or localized bug fix, go directly to the relevant code
and proportionate verification. A small fix does not need a new feature brief or
specification set.

For a behavior or interaction change, use the improvement path below. The user's
latest requested behavior takes precedence over the old brief.

## Improve the existing feature

1. **Trace the current behavior.** Inspect Git status and preserve existing work.
   Find the owning feature, its current implementation and the most relevant brief
   in `docs/features/`. Identify the difference between current and desired behavior.
   If the requested element cannot be located, ask for its page or component before
   changing a similar-looking control.
2. **Update the brief.** Revise the existing scope and acceptance criteria in place
   so they describe the intended result. Record the improvement's before/after,
   what must keep working, and what can wait. Create one short brief only when the
   capability has none. Keep historical evidence labeled with its original context.
3. **Implement one complete change.** Follow the feature's existing folders,
   server boundaries and shared UI patterns. Keep unrelated behavior and the user's
   drafts/progress intact. Make the changed journey reviewable before expanding scope.
4. **Verify the acceptance criteria.** For each criterion, identify the automated
   test or browser check that demonstrates it. Use existing package scripts and
   targeted checks; broaden coverage when shared behavior, authorization,
   persistence or execution changes. Review changed UI in the browser. Keep fixture
   tests, public smoke tests and real signed-in checks clearly distinguished.
5. **Record the result.** Update the same brief with actual checks and outcomes.
   Leave unverified criteria unchecked and state what is needed to verify them.
   Public smoke coverage does not establish signed-in behavior or live persistence.
   Update `ui-registry.md` when a reusable visual convention changes. Finish with
   the resulting behavior, validation and material limits.

## Keep the loop lightweight

Small review adjustments return directly to code. Update requirements when the
behavior changes; preserve passing evidence when its scope still applies. Commit,
push, merge and deployment follow the user's instructions and are separate from
implementing an improvement.
