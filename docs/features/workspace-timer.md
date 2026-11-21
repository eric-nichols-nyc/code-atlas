# Workspace timer

**Outcome:** Time a JavaScript or Algorithms practice session from the workspace
toolbar, using CodeDrill's stopwatch/countdown popup as the interaction reference.
**First review:** Open Move Zeroes, select the timer icon, start a stopwatch, then
pause, resume, reset, collapse, and configure a countdown.

## Scope and decisions

- Add a compact toolbar control beside the AI tutor. The popup has Stopwatch and
  Timer mode cards, hour/minute countdown fields (default one hour), and Start.
- Starting expands an inline `HH:MM:SS` readout with pause/resume, reset, and
  collapse. Reopening a collapsed session preserves its time and controls.
- Reset stops and restores zero or the configured countdown duration. Changing
  mode starts a fresh session. Countdown completion stops at zero and announces
  “Time's up”; restart reuses the chosen duration.
- Compute elapsed time from timestamps so throttled background-tab callbacks do
  not slow the clock. Only the timer subtree updates on a tick.
- State lasts for the current problem visit. Tabs, tutor, layout, and theme changes
  preserve it. Navigation/reload ends it; there is no account persistence, sound,
  OS notification, automatic judging integration, or React pilot integration.
- Use shared themed shadcn primitives with accessible labels, keyboard dismissal,
  focus restoration, validation, and a popup that fits a 320px viewport.

## Acceptance and implementation

- [x] Implement timestamp-based timing, pause/resume/reset, and zero completion.
- [x] Compose popup and inline controls in the practice toolbar.
- [x] Verify invalid countdown input, background catch-up, collapsed controls,
  keyboard/focus, and preservation of learner work across workspace changes.
- [x] Review desktop/narrow layouts and existing themes in Chrome.
- [x] Run root lint, typecheck, relevant tests, and production build.

## Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `git diff --check` passed.
- `pnpm test --maxWorkers=1`: all **722 tests across 80 files passed**.
  The initial concurrent suite had two judge timing/resource failures while the
  dev preview compiled. Their isolated rerun passed all 66 tests, followed by the
  successful complete single-worker run. Judge limits were unchanged.
- Focused timer/workspace/render-isolation/shared-button checks passed **35 tests**.
  Coverage includes fractional pause/resume, background catch-up, countdown zero
  completion/restart, changed durations, invalid input, unmount cleanup, collapsed
  control access, focus restoration, and retained code/case drafts across tabs
  and tutor changes.
- Direct signed-in Chrome review passed on Move Zeroes: stopwatch operation,
  collapse/reopen, a real one-minute countdown finishing at zero, restart/reset,
  keyboard mode selection, Escape focus restoration, Light/Dark/Brown themes,
  and 320px layout transitions. Both popup and page fit the narrow viewport.
  No learner code or notes were saved during review. Original theme restored.
- Browser captures live in ignored `outputs/workspace-timer/`; the review preview
  runs separately on port 3002. Automated authenticated Playwright and actual
  Electron checks were not run for this slice. The timer is visit-only.

Working branch: `codex/workspace-timer`. Existing uncommitted work was preserved.
