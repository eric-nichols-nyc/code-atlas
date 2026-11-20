# Code evaluation

Outcome: select **Evaluate** beside Run and Submit to review the latest unsaved
JavaScript against the current problem. **Feedback** owns the assessment; **Test
Result** owns Run/Submit verdicts. First review: Majority Element, mixed sample
scores, then tab/theme/layout changes with the draft intact.

Scope: published JavaScript and Algorithms practice, score out of ten with a fixed
rubric, correctness, complexity, quality, edge cases and actionable improvements.
Reports last for the visit. Evaluation neither executes nor saves code and does
not award solved status. Saved history, React evaluation and automatic edits wait.

Readability: green marks strong scores, amber marks partial scores and rose marks
missing criteria. Text labels and numbers convey the same meaning. Blue Time/Space
badges, bordered sections and grouped improvements help scanning in all themes.

Sample mode: **Use sample feedback** previews a fixed 6/10 Majority Element report
and its example source. While enabled, Evaluate makes no network call, execution
or account write; it does not assess or overwrite the learner's code. Sample labels
stay visible. Switching off restores the previous AI report, including stale-source
status. Controls are available in development or with the server setting
`CODE_ATLAS_EVALUATION_SAMPLES=true`; ordinary production defaults to real evaluation.

Architecture: `features/ai` owns provider access, bounded transport, cancellation
and shared per-process admission (10 requests/minute/learner, one active/learner,
four total). Features own their prompts, contracts and UI state. The authenticated
server projects public problem context; private tests, notes and authored solutions
never enter inference. Server/client validation checks the rubric and rejects
contradictory scores. Existing OpenAI configuration is reused; an optional evaluation
model override remains available. Sample mode is a separate local path and does not
alter the endpoint or its authentication. Distributed admission/spend storage is
future work; the current limiter is not a cross-server or monetary quota.

Current acceptance checks:

- [x] Evaluate selects Feedback; Run/Submit select Test Result; each result survives tab changes.
- [x] Strong, partial and zero scores have distinct colors and readable status labels.
- [x] Sample mode supports repeated Evaluate actions with zero AI calls/account writes.
- [x] Samples preserve source and prior live reports, and never claim to evaluate the current code.
- [x] Sample controls are opt-in in production; live evaluation stays the default.
- [x] Loading, Stop, errors, retry, stale source, keyboard and narrow layouts still work.

Implementation: split report presentation into Feedback; add semantic status colors,
feature-owned sample data and a visit-only sample toggle; pass server-controlled
availability through the existing session; check transitions and review the browser.
Use `CODE_ATLAS_DIST_DIR=.next-preview` for isolated review builds without replacing
the running app's build assets.

Initial delivery evidence (PR #18, before this feedback-tab revision): 620 tests,
68 public and 30 authenticated browser checks, lint/type checks and credential-free
builds passed. Four live model calls led to a stricter prompt and score validation;
final correct/incorrect solutions scored 10/10 and 0/10. Generated reviews remain
advisory; Run/Submit provide execution verdicts. Packaged Electron was not verified.

Current revision verification: lint, type checks, 623 tests / 71 files and a
credential-free isolated production build pass. All 31 authenticated browser checks
pass, including repeated sample evaluations with zero inference calls/account writes,
three-tab separation, restored live reports, keyboard operation and 320px layouts.
Manual browser review covered light, dark and dark purple; the preview is left in
sample mode with the original workspace untouched. Evidence is ignored under
`outputs/evaluation-feedback/`. No live inference was used for this revision.

Iteration preference: use browser review for styling and focused affected tests for
behavior changes. Reserve the full suite and production builds for broader changes
or pre-merge validation rather than repeating them for every visual adjustment.
