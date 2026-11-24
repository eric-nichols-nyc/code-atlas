# Design

## Context

Practice separates its shared `TutorSession`, transcript, and authenticated streaming handler from the adapter that adds a published exercise and judge feedback. Playground owns the editor state and keeps each Run result with the source used for it.

## Goals / Non-Goals

Bring the same hints and conversation flow to standalone JavaScript. A question send captures editor text and optionally a matching run error. Saved chats, automated execution, and assistant-driven code edits are outside this change.

## Decisions

- Use an **AI tutor** control near the heading. Dock a 320px panel at desktop widths of 1280px and above. Use the shared right Sheet below that width. Keep one shared `TutorSession` mounted with the Playground visit, with a single chat body mounted according to the open state and width. Restore focus after closing the drawer.
- Capture CodeMirror's live document when sending a question. Add the latest bounded error message only if the failed Run's source equals that document. Disclose this context by the composer. Retain Practice's hint-first instruction and label the context as a standalone `script.js`.
- Use `POST /api/javascript/playground/tutor` with the existing `createTutorHandler` and a Playground prompt adapter. Reuse the existing limits and streaming provider. Parse Playground's optional string error alongside the shared question, source, and dialogue contract. Pass it as learner-supplied data. Practice judge fields are rejected by the Playground endpoint.
- Reuse the chat body with customizable context copy. The Practice adapter remains responsible for published exercise metadata and judge feedback.

## Risks / Trade-offs

- Run can finish or the source can change during a reply. Snapshots are captured independently, and a reply remains associated with the source sent in its request.
- The narrow layout uses one dialog so the editor and console stay readable and keep their state after closing. Browser checks cover switching sizes while the conversation is open.
- Tutor provider failures are independent of the runner. Validate streaming with deterministic fixtures and check the configured provider separately using a test script.

## Migration Plan

The new route uses existing tutor server settings. Chat state lives in memory.
