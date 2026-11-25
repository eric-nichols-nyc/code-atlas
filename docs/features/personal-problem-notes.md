# Personal problem notes

**Outcome:** Keep one private formatted note per account and published practice problem.
**First review:** Open Sleep, select the Notes icon beside AI tutor, and write a
takeaway. Switch to AI tutor and back to check the draft, then save and reload.

## Scope and decisions

- Move Notes from the problem tabs to the right-side tools panel. Put its icon
  immediately after AI tutor in the workspace toolbar. Selecting either tool
  displays only that tool in the docked panel or narrow-screen drawer. Include
  both icons in the modal drawer so switching is available while it is open.
- Keep Problem and Solution in the left pane, with Problem selected by default.
  Notes uses BlockNote with a slash menu for headings, quotes, lists, checklists,
  and code blocks. Rich-text formatting and links remain available. Load on demand.
- Explicit Save persists a validated versioned document through authenticated Next.js
  GET/PUT `/api/problems/{problemId}/notes` and a separate Prisma user/problem model.
  Ownership comes only from the verified Neon identity. Notes never enter public
  content, progress payloads, judging, or tutor context.
- Notes drafts and tutor conversations survive switching tools, closing the panel,
  resizing, and theme changes in the current session.
  Unsaved changes end on navigation/reload; confirmed saves follow the account.
  Concurrent sessions use last successful database write wins.
- Failed initial reads block editing until retry. Failed saves preserve edits. Late
  responses cannot overwrite later typing or another learner/problem session.
- Media/uploads, autosave, browser backups, offline sync, conflict merging, history,
  sharing/export, curated notes, CodeDrill imports, and connected AI remain deferred.
  Desktop retains its existing HTTPS-only external navigation policy.

## Acceptance and implementation

- [x] Verify icon order, exclusive tool switching, and preserved panel width in
  the desktop workspace.
- [x] Verify tool switching inside the drawer, keyboard dismissal and focus
  restoration, and draft and chat retention across tool and layout changes.

### Original Notes acceptance

- [x] Validate formatted documents, links, operation count, and byte bounds.
- [x] Add an additive migration and owner-scoped services/API.
- [x] Deliver real rich-text Save/reload/clear with safe failure recovery.
- [x] Preserve notes, code, inputs, hints, and results across workspace transitions.
- [x] Verify keyboard/focus, narrow layouts, web, and online Electron behavior.
- [x] Run repository checks and separate credential-free and signed-in results.

## Right-side tools panel verification (2026-11-25)

- Lint, typecheck, the credential-free production build, and all 802 repository
  tests passed. All 73 public production browser checks passed.
- The targeted signed-in Chromium run passed 13 checks plus sign-in setup. It
  verified desktop icon order and panel width, keyboard switching and focus
  restoration in the drawer, and retained notes, tutor drafts, and replies across
  switches and resizing. Save, reload, and recovery used the dedicated development
  account. Tutor replies in the switching test used deterministic streams.
- Direct Chromium review confirmed the desktop panel layout and that the Notes
  drawer and BlockNote slash menu work at 320 px.

## Problem pane tabs — 2026-11-19

Notes moved from the tutor panel and toolbar into the problem pane on desktop
and mobile. Problem opens first and contains the description, hints, and
solution. The AI tutor opens independently from its toolbar icon.

- Lint, typecheck, web production build, and 77 focused tests passed.
- Signed-in Chromium review confirmed tab order, keyboard switching, desktop
  placement, and mobile rendering. Authenticated checks passed for note
  formatting, saving, reload, retry, account isolation by problem, draft
  retention across resizing and tab switches, and independent tutor behavior.
- An initial fresh-context check timed out before restoring the dedicated test
  learner's Sleep and Counter fixtures. The corrected check passed.

## BlockNote editor update

Replace Quill with BlockNote in the Notes tab. Typing `/` opens the block
menu. Keep explicit Save, problem-specific account storage, and in-session drafts.
New edits save as versioned blocks in the existing JSON column. Existing Quill
documents can open in BlockNote and are converted when the learner edits and saves.
The supported document schema excludes media and embeds.

Lint, typecheck, the web production build, and all 608 repository tests passed.
Signed-in Chromium checks passed for slash commands, safe paste, save and reload,
retry, problem-specific storage, and draft retention across tabs and resizing.
Direct browser review confirmed that the slash menu fits a 320px viewport.

## Original verification — 2026-11-13

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
