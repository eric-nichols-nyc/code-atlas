# Proposal

## Why

The Two Pointers preview explains the pattern but presents its JavaScript example as one static block. A guided walkthrough will connect each part of that function to its purpose, giving learners one small, reusable interaction before the full lesson format is designed.

## What Changes

- Replace the static `findPair` example on `/javascript/learn/two-pointers` with a read-only, numbered code walkthrough embedded in the existing preview.
- Author six conceptual steps: initialize pointers, check the loop condition, calculate the sum, return a matching pair, move the appropriate pointer, and return no match. Each step highlights its source lines and shows a matching explanation.
- Provide Previous, Next, and Restart controls, a visible step count, and decorative progress indicators. Navigation stops at the first/last step; the last step does not navigate away or claim course completion.
- Keep authored source and explanations separate from a reusable learning-owned component. Maintain one canonical copy of the example, validate its step references during content checking, and reuse existing syntax colors and shared UI controls.
- Arrange code beside the explanation when space permits and stack them on narrow screens. Preserve the current step through theme/width changes, provide keyboard access and readable inactive code, and respect reduced motion.
- Retain the current learning catalog, surrounding strategy content/diagrams/problem links, authentication boundaries, and navigation/loading behavior. Remove the lesson-outline section at the bottom of the preview, as requested during implementation.
- Defer array/pointer-state visualization, quizzes, automatic playback, execution of edited code, saved walkthrough progress, additional examples, full-screen lesson routing, and the outer multi-section curriculum.

The interaction reference is the [TraceCode sliding-window lesson](https://tracecode.app/learn/sliding-window), inspected in the browser on 2026-11-14. Its template has a six-step line walkthrough; a subsequent section adds state diagrams and a checkpoint. This change adopts the first interaction with original JavaScript content and Code Atlas styling. It does not depend on TraceCode's internal implementation.

## Capabilities

### New Capabilities

- `guided-code-walkthroughs`: Read-only authored code examples with synchronized line emphasis, explanations, and deterministic manual step navigation.

### Modified Capabilities

None. `openspec list --specs` currently reports no main specs. The completed, unarchived `scaffold-javascript-learning` change and its working branch files supply the learning catalog/preview baseline. Its deferred lesson work remains historical scope; this separate capability adds one guided example without redefining the full curriculum.

## Impact

- Add walkthrough contracts, validation/presentation helpers, and the interactive component under `apps/web/src/features/learning/`; add authored data under `apps/web/src/content/javascript/learn/two-pointers/` and compose it through the trusted overview MDX.
- Extend the existing learning-content validator and relevant component/access/browser checks. During apply, update `docs/features/javascript-learning.md`, README availability wording, and `ui-registry.md` to describe the delivered guided example while keeping individual lessons deferred.
- Reuse existing Buttons, semantic tokens, and installed JavaScript parsing/highlighting packages. No new dependency, API, credential, database model, or judging change is required.
- Preserve all existing uncommitted branch work. This proposal phase writes only this change's OpenSpec planning artifacts; implementation and its verification follow separately.
