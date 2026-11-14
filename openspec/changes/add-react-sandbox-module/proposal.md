# Proposal

## Why

React exercises need a rendered interface and browser diagnostics alongside source code; the existing function-based JavaScript judge cannot provide that experience. A tested single-exercise prototype shows how to retain CodeMirror and the AI tutor while using Sandpack for React TypeScript execution.

## What Changes

- Introduce a development-only React Practice entry and one **Stale Closure Counter** exercise with a distinct workspace: requirements, TSX editor, preview underneath on Submit, Console / errors, and the existing AI tutor.
- Compose Sandpack's classic `react-ts` provider/client with the existing CodeMirror editor and shared UI. Keep one editable `/App.tsx`, a trusted scaffold, pinned React dependencies, and visit-only state. Separate the editable draft from the submitted preview snapshot; typing and Reset code do not execute it.
- Generalize the narrow editor/tutor adapters so the tutor captures current TSX on Send, while existing JavaScript/Algorithms behavior retains its numeric judge feedback and server protections.
- Define Submit/Mod-Enter execution, changed-since-submission notices, preview loading, network failure/retry, syntax/runtime error recovery, draft reset, responsive layout and theme preservation. Label the experience as a preview exercise; successful rendering is not a type check or judged completion.
- Keep the pilot unavailable in production. The hosted iframe isolates the parent origin but supplies no enforceable guest CPU/memory/network budgets; this conflicts with constitution principle VI. Public rollout requires a separate execution-policy decision and is outside this change.
- Defer React Learn lessons, multiple editable files, arbitrary dependencies, saved drafts/progress, automated judging, semantic TypeScript diagnostics, offline operation and packaged Electron support.

## Capabilities

### New Capabilities

- `react-sandbox`: Development-pilot React practice discovery, an authenticated single-file TSX workspace with rendered preview and diagnostics, current-source tutoring, and an explicit browser execution boundary.

### Modified Capabilities

None. The main OpenSpec capability inventory is currently empty; existing completed changes remain historical context. Numeric problem judging and account progress retain their existing behavior.

## Impact

Development-only routes under `/react/practice` and a feature-owned React tutor endpoint; a development-only React dashboard entry and subject navigation; `features/react-sandbox`, trusted `content/react`, and small adapters in the existing editor/tutor implementation. Add `@codesandbox/sandpack-react@2.20.0`, load it only for the React workspace, and keep Prisma/provider credentials on the server. No database migration is needed.

Exploration is captured on `codex/react-sandbox-spike`: initial commit `39440bb`, Dashboard entry `89ece2b`, and manual Submit revision `17be7ff`. Run it from `work/react-sandbox-spike` with `pnpm prototype:react` at port 3002. This proposal describes the pilot module still to apply to the main application; it does not claim production readiness.
