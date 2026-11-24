# Proposal

## Why

Learners need a place to try their own JavaScript snippets alongside Learn and Practice. Code Atlas already has an isolated JavaScript runtime and an editor that can support a focused scratchpad.

## What Changes

- Add **Playground** to JavaScript navigation and a workspace at `/javascript/playground`. Show one editable `script.js` and a console beside it on desktop and below it on narrow screens.
- Run the current source on demand with **Run** or the editor shortcut. Show logs, errors, resource limits, and when output belongs to an earlier version of the draft.
- Use the existing QuickJS worker infrastructure for standalone scripts. Keep the draft and output for the current visit. Defer saved snippets, browser previews, and package imports.

## Capabilities

### New Capabilities

- `javascript-playground` covers discovery and authenticated, isolated execution of learner-authored JavaScript scripts with console output.

### Modified Capabilities

None.

## Impact

The JavaScript subject navigation, a new page and Run API, the shared CodeMirror adapter, and the existing QuickJS worker build and deployment tracing are affected. The Playground needs a verified Neon Auth session. It requires no new dependency or data migration.
