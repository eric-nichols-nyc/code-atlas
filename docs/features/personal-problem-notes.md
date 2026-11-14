# Personal problem notes

**Outcome:** Keep one private formatted note per account and published practice problem.
**First review:** Open Sleep → Notes, write a takeaway with a list/code block/link,
select Save, reload, and see the confirmed account note restored.

## Scope and decisions

- Reuse the tools panel and mobile drawer with bold, italic, quotes, ordered/bulleted
  lists, code blocks, links, and clearing formatting. The editor loads on demand.
- Explicit Save persists a validated versioned document through authenticated Next.js
  GET/PUT `/api/problems/{problemId}/notes` and a separate Prisma user/problem model.
  Ownership comes only from the verified Neon identity. Notes never enter public
  content, progress payloads, judging, or tutor context.
- Drafts survive tools, tabs, resizing, and theme changes in the current session.
  Unsaved changes end on navigation/reload; confirmed saves follow the account.
  Concurrent sessions use last successful database write wins.
- Failed initial reads block editing until retry. Failed saves preserve edits. Late
  responses cannot overwrite later typing or another learner/problem session.
- Media/uploads, autosave, browser backups, offline sync, conflict merging, history,
  sharing/export, curated notes, CodeDrill imports, and connected AI remain deferred.
  Desktop retains its existing HTTPS-only external navigation policy.

## Acceptance and implementation

- [x] Validate formatted documents, links, operation count, and byte bounds.
- [x] Add an additive migration and owner-scoped services/API.
- [x] Deliver real rich-text Save/reload/clear with safe failure recovery.
- [x] Preserve notes, code, inputs, hints, and results across workspace transitions.
- [x] Verify keyboard/focus, narrow layouts, web, and online Electron behavior.
- [x] Run repository checks and separate credential-free and signed-in results.

## Verification — 2026-11-13

- `pnpm lint`, `pnpm typecheck`, `pnpm test`: **378 tests across 37 files passed**.
  Credential-free `pnpm build` passed. A concurrent build/test attempt hit two existing
  judge execution failures; the final sequential test run passed without changing judge limits.
- `pnpm test:e2e`: **45 credential-free production checks passed** on free port 3000,
  including notes access denial and no-store behavior before authentication setup.
- `pnpm test:e2e:auth`: **10 authenticated production checks passed** with the dedicated
  development learner. Notes covers all formats, safe paste, Save/reload/clear, failure/retry,
  fresh-context Sleep/Counter restoration, keyboard, themes, and 320–1440px transitions.
  Code, test inputs, help expansion, results, and account progress remain intact.
- Direct browser review passed for desktop and mobile, long links/code, and Tab escape.
  Fixed Chromium's extra scroll-container Tab stop and ensured the drawer and desktop
  panel mount exclusively. Existing authenticated test fixtures now use explicit starting
  source and CodeMirror's displayed line text.
- `20261113210000_personal_problem_notes` was generated, reviewed, and applied only to
  isolated Neon branch `feature/neon-auth` (`br-polished-scene-bdmyupra`). Live checks
  passed for create/read/update/clear, concurrent first-save uniqueness, owner/problem
  isolation, unchanged progress, and account cascade. Temporary database test users were removed.
- Actual online Electron review passed formatting/links, Save, native-window recreation,
  session reuse, and external navigation. `pnpm desktop:smoke` separately passed native
  renderer isolation, popup policy, connection failure, and retry.
- `pnpm analyze` passed. Quill and its adapter are lazy chunks totaling approximately
  **60 KiB gzip JavaScript**. Final browser chunks contain no Prisma, account-service,
  credential-variable, worker, or private-suite markers.
- Review images: `outputs/personal-problem-notes/sleep-desktop.png`, `sleep-mobile.png`,
  and `sleep-electron.png`. These are ignored local review artifacts.

Working branch: `codex/personal-problem-notes`. Local credentials were preserved.
No production migration, hosted deployment, signed packaging, or physical-device review
is included. OpenSpec change `add-personal-problem-notes` records the reference mapping,
behavior contract, technical design, and completed implementation checklist.
