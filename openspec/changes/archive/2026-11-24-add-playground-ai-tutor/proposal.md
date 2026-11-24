# Proposal

## Why

Learners can run their own snippets in Playground and need help understanding the code they are writing. The Practice tutor already provides question-driven, hint-first guidance.

## What Changes

- Add an **AI tutor** control to Playground with a collapsible desktop panel and a drawer at narrower widths.
- Reuse the Practice chat, streaming replies, stop and retry, and visit-only follow-ups.
- Send the current `script.js` and a matching run error when the learner submits a question. Keep questions usable before any Run.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `javascript-playground` gains an authenticated tutor conversation grounded in the current draft.

## Impact

A Playground-specific tutor endpoint and prompt adapter use the existing authenticated tutor handler and provider. The shared chat receives Playground context copy. The feature uses the existing tutor configuration.
