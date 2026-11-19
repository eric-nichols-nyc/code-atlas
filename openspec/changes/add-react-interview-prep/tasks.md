# Tasks

These tasks describe the recommended Explain, Predict, Fix option. The proposal also preserves two alternative directions for discussion. Implementation starts only after a separate request to apply this change; no implementation task is complete yet.

## 1. Define and author the first rehearsal

- [ ] 1.1 Create the concise `docs/features/react-interview-prep.md` feature brief before coding; verify it records the first reviewable journey, included/deferred scope, acceptance checks, checklist, pending verification, and the distinction between self-review and correctness.
- [ ] 1.2 Add feature-owned drill/pack contracts and authored-content validation under `features/react-interview-prep/lib`; verify meaningful tests reject duplicate IDs, missing answers/follow-ups/checklist content, invalid official HTTPS references, and missing publication ownership.
- [ ] 1.3 Author the three-drill State, rendering, and effects pack plus trusted overview MDX under `content/react/learn/interview-prep`; verify the real pack passes validation and review each explanation against the linked React references, including explicit initial state, functional update queues, derived data, cleanup ordering, and development Strict Mode assumptions.

## 2. Build the self-review session

- [ ] 2.1 Implement the feature-owned session with optional bounded plain-text responses, answer/follow-up disclosure, and Previous/Next; verify component tests cover empty-answer reveal, 4,000-character enforcement, literal markup handling, independent per-drill state, navigation boundaries, and state restoration on revisit.
- [ ] 2.2 Add Needs review / Comfortable labels after rubric reveal and the three-group summary with return-to-drill links; verify tests cover Not reviewed defaults, skipped answers, rating replacement without double counting, and summary navigation restoring prior answers/reveals.
- [ ] 2.3 Add visit-only copy, keyboard/focus/disclosure semantics, polite position/status announcements, semantic themes, and contained code overflow; verify focused interaction tests and update the feature brief with the implemented interaction contract and pending browser review.

## 3. Integrate authenticated React Learn

- [ ] 3.1 Register the new Medium recommended module, Interview Prep topic, one authored outline, and lazy overview; add an explicit optional overview presentation prop and pass the new module's presentation through the existing authenticated dynamic page. Verify catalog/route/component coverage for two Recommended entries, unchanged Hooks membership, combined filters, rehearsal-specific copy, default preview copy, direct session denial, and missing configuration.
- [ ] 3.2 Extend the existing content-check script with the registered rehearsal pack and owning-module validation; verify `pnpm --filter @workspace/web content:check` and relevant validation tests pass for all subjects and fail with useful diagnostics for invalid rehearsal fixtures.
- [ ] 3.3 Add production browser journeys alongside the existing React learning coverage; verify drill/reveal/review flow, revisit, summary, theme/viewport retention, reload reset, React-local Back, no response transmission/account writes, and no sandbox/provider requests. Retain assertions for production React Practice/tutor exclusion and representative JavaScript/Algorithms/React preview behavior.
- [ ] 3.4 Update README, UI registry, constitution availability wording, and the feature brief to distinguish this interactive self-review module from read-only previews and development-only execution; verify documentation describes only implemented behavior and retains existing authorization, execution, and persistence constraints.

## 4. Review the complete slice and integration

- [ ] 4.1 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and strict OpenSpec validation; verify success or record the exact blocked/failed checks without claiming completion. Reuse the checks already run rather than repeating them without a new reason.
- [ ] 4.2 After a completed build and with the required production test port free, run `pnpm test:e2e` and relevant authenticated React learning journeys; verify credential-free and signed-in results separately, preserve active user work, and record any environment limitations in the brief.
- [ ] 4.3 Review the first complete rehearsal in the actual browser at desktop and 320px using keyboard, reduced motion, and Light/Dark/Dark purple/System; verify focus, disclosure semantics, response retention, local code scrolling, summary accuracy, and honest visit-only messaging. Record actual evidence and limitations in the brief, and let the user review this slice before expanding the curriculum or enabling another interview mode.
