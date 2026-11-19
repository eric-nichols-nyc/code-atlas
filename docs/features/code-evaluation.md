# Code evaluation

Outcome: select **Evaluate** beside Run and Submit to review the latest unsaved
JavaScript against the current problem. The existing Test Result tab shows an AI
evaluation above the preserved judge results; no new tab is added. First review:
Majority Element, then an incorrect version and an edit during an active request.

Scope: published JavaScript and Algorithms practice, score out of ten with an
explicit rubric, correctness, time/space complexity, quality, edge cases and
actionable improvements. Evaluation is static analysis, makes no execution or
persistence calls, and does not award solved status. Reports last for this visit.
Saved history, React evaluation, automatic edits and additional providers are later
work. Use the existing server OpenAI key; an optional `OPENAI_EVALUATION_MODEL`
overrides the existing tutor model for this capability.

Architecture: `features/ai` owns provider access, bounded streaming transport,
failure normalization, cancellation and one shared per-process AI admission limit
(10 requests/minute/learner, one active/learner, four total across tutor and
evaluation). Features own prompts, input/output contracts and UI state. Public
problem context is projected once in a problem-owned server module; private tests,
notes and authored solutions never enter inference. Structured evaluation output
is validated on the server and client before presenting a score. All protected
routes authenticate and validate origin/payload before inference. Runtime-only
configuration keeps builds independent of credentials. Scale-out requires shared
admission/spend accounting; the in-process limiter is not a distributed quota.

Acceptance checks:

- [x] Evaluate captures current source synchronously, only on explicit click/retry.
- [x] Only Testcase/Test Result tabs exist; judge results and editor drafts survive.
- [x] Score is derived from correctness /4, efficiency /3, quality /2, edge cases /1;
  findings explain evidence and uncertainty without claiming executed tests.
- [x] Editing marks the captured report stale, including edits while evaluating.
- [x] Stop, failure, invalid output, sign-in and fresh-code retry preserve work.
- [x] Auth, context filtering, cross-capability admission and tutor regressions pass.
- [x] Keyboard, mobile, themes and production browser journeys are reviewed.

Implementation: extract shared AI infrastructure; add evaluation contract/prompt and
protected endpoint; wire visit-owned state and inline result; update UI registry
and setup documentation; run repository checks and browser review.

Verified 2026-11-19:

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (620 tests / 70 files), and forced
  credential-free `pnpm build --force` pass. No dependencies or database changes.
- Production Playwright: 68 public checks and 30 authenticated checks pass. Browser
  inference uses deterministic fixtures; actual endpoint validation is also checked.
  Port 3100 leaves the existing development server on 3000 intact. The default test
  port remains 3000; `PLAYWRIGHT_PORT` permits an isolated verification server.
- Live production review: four explicit evaluations in two rounds; final correct
  Majority Element **10/10**, incorrect **0/10** with `[1,2,2]` as a valid failing
  case. Initial review exposed unearned efficiency points and inaccurate examples;
  the revised prompt requires tracing examples, and server/client validation rejects
  contradictory criterion scores. No automatic inference retries were added.
- Actual compiled Tutor rejects concurrent Evaluate work with 429. Progress/notes
  remain unchanged, browser reports zero page errors, and light/dark/320px screenshots
  were inspected. All 76 browser chunks exclude the real key, provider configuration
  and evaluation prompt. Local evidence is ignored under `outputs/code-evaluation/`.

Generated reviews remain advisory and can vary; Run/Submit provide execution verdicts.
History and distributed budget storage remain deferred. Packaged Electron was not
verified by these browser checks. UI conventions are recorded in `ui-registry.md`;
the shared module interface and scale-out requirements are in `docs/development.md`.
