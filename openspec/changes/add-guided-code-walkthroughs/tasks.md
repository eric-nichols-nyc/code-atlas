# Tasks

## 1. Authoring and validation

- [x] 1.1 Extend the existing JavaScript learning brief with the guided-example scope, acceptance checks, and checklist; verify that individual lessons, execution, visualization, and saved progress remain deferred.
- [x] 1.2 Add the pure walkthrough contract, shared newline handling, and validation; verify node tests cover missing content, duplicate identities, empty/duplicate/fractional/out-of-range line references, and valid overlapping steps.
- [x] 1.3 Author the six-step Two Pointers definition and explicit module registry, and wire registry validation into the existing content checker; verify canonical source/step mappings in tests and run `pnpm --filter @workspace/web content:check`.

## 2. Reusable walkthrough presentation

- [x] 2.1 Add server-side syntax preparation and the defensive server wrapper; verify tests reconstruct complete normalized source, retain blank lines, safely render text, and preserve available source/prose when highlighting or walkthrough data is invalid.
- [x] 2.2 Build local Previous/Next/Restart navigation with synchronized emphasis, explanation, count, and indicators; verify component tests cover boundaries, backward/restart, independent instances, remount reset, and no execution or persistence calls.
- [x] 2.3 Add responsive feature styles, semantic syntax colors, non-color line markers, keyboard focus, polite announcements, and decorative accessibility handling; verify component accessibility assertions and document the reusable pattern in `ui-registry.md`.

## 3. Two Pointers integration

- [x] 3.1 Replace the MDX code fence with the canonical walkthrough and isolate its styles from ordinary prose code; remove the bottom lesson-outline section and update preview/README availability copy and access tests. Verify one source block, preserved surrounding content, absent bottom outlines, permitted walkthrough controls, and withheld content before learner authorization.
- [x] 3.2 Extend `tests/e2e-auth/learning.spec.ts` with the actual six-step journey, boundaries/restart/reload, keyboard operation, themes, width changes, reduced motion, local code overflow, and absence of execution/progress writes; verify the new tests run under the existing authenticated test configuration.

## 4. Integrated verification

- [x] 4.1 Run root lint, typecheck, unit/component tests, and a credential-free production build; verify successful results, preserving the existing development server and unrelated working changes.
- [x] 4.2 Run production smoke and authenticated learning coverage, review the actual preview in the browser at desktop/320px in shared themes, and record evidence and any unrelated failures in the existing feature brief; verify the completed journey matches the capability scenarios.
