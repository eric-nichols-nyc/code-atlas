# Problem AI tutor

Outcome: ask “I'm stuck here” and receive a hint grounded in the current problem and
latest unsaved CodeMirror source. First review: Counter → edit without Run → ask →
receive a streamed hint → edit again → ask a follow-up using the new source.

Approved scope: hint-first guidance, full solutions only on explicit request, and
session-only chat. Reuse the existing tools panel/drawer, shared UI and Neon server
boundary. The server selects public problem text/examples/constraints/callbacks;
private notes, hidden cases and authored solution fields stay outside tutor context.
Only Send or explicit Retry starts a request. Asking never runs, saves or edits code.

Configuration: existing ignored server key plus `OPENAI_TUTOR_MODEL=gpt-5.4-mini`.
Model access and representative live replies were verified on 2026-11-14.
Source is limited to 32 KiB, question 4 KiB, recent dialogue 4 exchanges/16 KiB,
optional Run feedback 8 KiB, output 2,000 tokens, request lifetime 60 seconds.
Limits per Node process: 10 questions/minute/learner, one active/learner, four total.
The provider uses no tools, no automatic retries, and `store: false`.

- [x] Latest code is captured synchronously at Send, including empty/invalid code.
- [x] Editing, Reset, Run/Submit, panel/tab/theme/layout changes make zero tutor calls.
- [x] Chat/drafts/stream survive panel lifecycle and end on workspace/account exit.
- [x] Streaming, Stop, fresh-code Retry and errors preserve learner work.
- [x] Auth, limits, context/output filtering and credential-free builds are verified.
- [x] Browser and native Electron review distinguish fixtures from live model results.

Implemented contracts/source accessor, server context and provider boundary, session state,
panel and production verification. Detailed work is tracked in
the [OpenSpec change](../../openspec/changes/add-context-aware-ai-tutor/proposal.md).
Saved chats, AI editor actions, retrieval, attachments and agent tools remain deferred.

## Verification

Verified on macOS Apple Silicon, 2026-11-14:

- `pnpm typecheck` passed. `pnpm test`: **409 tests / 46 files passed**; the final
  prompt-only adjustment also passed the six focused context/provider tests.
- Forced credential-free `pnpm build --force` passed with Neon, database and OpenAI
  settings empty. `pnpm test:e2e`: **46 passed**. All thirteen authored statements
  are production-traced; live production requests loaded Counter and Map statements.
- `pnpm test:e2e:auth`: **13 passed**, including three tutor journeys with deterministic
  streams/validation. Four explicit Send/Retry actions produced exactly four requests;
  typing and panel/layout changes produced none. Existing auth, notes and judging passed.
- `pnpm test:e2e:desktop:auth`: **1 passed**, verifying real signed-in Run/Submit and
  exact saved source/solved restoration after a full process quit/reopen. Native fixture
  smoke, unsigned local packaging and its exact ASAR allowlist also passed.
- Live model review: **eight explicit question attempts** across browser and actual
  compiled Electron, seven completed replies and one deliberate Stop. Unsaved Counter
  code was captured exactly; its follow-up used edited code and recent dialogue. Map
  replies correctly explained supplied callbacks. Progress and notes were unchanged;
  route/reload/quit cleared chat, while native authentication survived reopening.
- Initial live review found excessive solution detail. After tightening first-hint
  instructions, final browser/native replies were **68/70 words**, referenced `return n`,
  ended with a guiding question and supplied no replacement solution. These samples
  establish representative behavior, not a guarantee for every generated answer.
- Desktop light/dark and 320/390px drawer review passed: contained prose/code, no page
  overflow, keyboard/focus restoration and independent workspace drafts. Browser live
  reviews reported no page errors. Shared UI patterns are recorded in `ui-registry.md`.
  A separate deterministic layout review confirmed editor selection and Undo survive
  responsive remounts, Notes retains an unsaved draft, and a 2,000-character code line
  scrolls inside its code block in both themes at 320px, with no account writes.
- `pnpm analyze` passed. Tutor renderer dependencies are lazy: two chunks total
  **43.1 KiB gzip**; the practice route chunk is 16.8 KiB gzip including existing code.
  This is a measured footprint, not an incremental comparison against an older build.
  All 56 browser chunks and the five-file native archive exclude the actual key,
  OpenAI configuration/server modules and private judging suites.
- During implementation, root `pnpm lint` reported four pre-existing `.obsidian/*.json`
  formatting errors. PR preparation now ignores that local editor metadata in Git;
  its contents are unchanged by this work, and root `pnpm lint` passes. Strict OpenSpec
  validation and `git diff --check` passed.

Review evidence/screenshots are ignored local artifacts under `outputs/ai-tutor/`,
including `live-evidence.json`, `hint-evidence.json` and the three `*-final.png` views.
Existing desktop auth harness/tests, root scripts, TypeScript setup and desktop brief
retain their pre-implementation hashes; earlier README/development changes are retained.
Ignored credentials were preserved; only the nonsecret model setting was appended.

- [ ] Manual signed-in packaged `.app` review from Finder: check tutor Send/Stop and
  empty chat after Quit/reopen; also complete the packaged Run/Submit and saved-progress
  checklist in [the desktop brief](electron-desktop.md). Compiled-runtime automation
  does not verify the packaged `app.isPackaged` path or Finder launch. Signing,
  notarization, hosted deployment and other operating systems remain outside this slice.
