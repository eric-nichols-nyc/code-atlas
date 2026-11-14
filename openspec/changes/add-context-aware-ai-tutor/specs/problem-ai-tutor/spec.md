# Spec Delta

## Purpose

Let learners ask a tutor for help with their current JavaScript practice problem and unsaved code, while controlling when AI requests occur and keeping the conversation scoped to one workspace visit.

## ADDED Requirements

### Requirement: Tutor requests require an explicit question action

The system SHALL start a tutor request only when the learner submits a nonblank question or explicitly retries a failed question. Opening the tutor, typing in the editor or question composer, restoring saved code, resetting code, Run/Submit, theme changes, tab switches, and layout changes MUST NOT start a tutor or provider request. Automatic client, provider, and stream-reconnection retries MUST be disabled.

#### Scenario: Editing without asking

- **WHEN** the learner edits code and a question draft, waits, resets code, and opens, closes, or resizes the tutor
- **THEN** no tutor endpoint request or model request occurs
- **AND** the current code and draft remain locally available

#### Scenario: Empty question

- **WHEN** the learner submits an empty or whitespace-only question
- **THEN** no provider request occurs and the interface identifies that a question is required

#### Scenario: One deliberate submission

- **WHEN** the learner submits a valid question once
- **THEN** at most one tutor request and one upstream model attempt start for that action
- **AND** a failure does not automatically start another attempt

### Requirement: Every question captures the latest editor source

Each question SHALL capture the complete current editor source at submission, including unsaved, incomplete, invalid, or empty code within the source limit. Context MUST NOT depend on the last Run, Submit, or account save. Edits made after submission SHALL belong to later questions and MUST NOT mutate an in-flight question's context.

#### Scenario: Asking without executing or saving

- **GIVEN** the learner changes the editor after the last Run or saved source
- **WHEN** the learner asks “I'm stuck here”
- **THEN** the submitted context contains the latest editor source rather than the last executed or saved code
- **AND** asking does not save, run, submit, or replace that source

#### Scenario: Immediate send after typing

- **WHEN** the learner types the final character and immediately sends a question
- **THEN** the captured source includes that character

#### Scenario: Code changes while an answer is pending

- **WHEN** the learner edits the code while an answer is being generated
- **THEN** the answer remains associated with the earlier source snapshot and the UI indicates that the code has changed
- **AND** the next deliberately submitted question uses the newly edited code

#### Scenario: Help with an empty editor

- **WHEN** the learner clears the editor and submits a valid question
- **THEN** an empty source snapshot is accepted as context rather than rejected as an execution request

### Requirement: Problem context comes from the published problem

For each question, the server SHALL select the published problem's authored statement, entry function, public examples, constraints, and applicable supplied callbacks by its canonical identity. The server MUST NOT accept client-provided problem instructions as authoritative or infer the problem from dialogue. Unknown and unpublished problems SHALL be rejected before provider access.

#### Scenario: Implicit problem reference

- **WHEN** a learner asks a question without naming the currently open problem
- **THEN** the model receives that problem's full authored statement and relevant public definition alongside the source

#### Scenario: Supplied callback behavior

- **WHEN** the current problem uses supplied callbacks or named transformations
- **THEN** the model context includes their public meanings or source so their identifiers are understandable

#### Scenario: Unsupported problem

- **WHEN** a request targets an unknown or unpublished problem
- **THEN** the request fails without a provider call

### Requirement: Tutor context has a limited data boundary

Tutor context SHALL exclude private notes, hidden test cases and their identifiers, inputs, outputs or logs, account records, credentials, and authored full-solution fields. Optional execution feedback SHALL contain only allowlisted visible Run information matching the current source and inputs. Learner code, questions, dialogue, and diagnostics MUST be treated as untrusted data rather than system instructions.

#### Scenario: Matching visible Run feedback

- **WHEN** the learner asks after a Run whose source and inputs still match the workspace
- **THEN** bounded visible feedback can accompany the code and problem context
- **AND** the tutor does not execute or judge the learner's code itself

#### Scenario: Stale or hidden feedback

- **WHEN** the last execution is a Submit, belongs to earlier source or inputs, or contains hidden cases
- **THEN** those diagnostics are excluded from tutor context
- **AND** the learner can still ask about the latest source without running again

#### Scenario: Private content and injected instructions

- **GIVEN** a private note, hidden-case marker, authored solution, and instruction-like code comment exist
- **WHEN** the tutor request is assembled
- **THEN** private fields and the separate authored solution fields are absent
- **AND** the comment remains inside the learner-data boundary rather than becoming a privileged instruction

### Requirement: Session-only chat survives panel lifecycle

The current learner/problem conversation and question draft SHALL remain in memory across panel closing, Notes tab switches, resizing between docked and drawer layouts, and theme changes. They MUST be cleared when the workspace visit ends, the authenticated learner changes, or the problem changes. Tutor transcripts, drafts, and request snapshots MUST NOT be persisted in a database, browser storage, or provider conversation resource.

#### Scenario: Panel and layout changes

- **WHEN** the learner closes and reopens the tutor, switches Notes tabs, and moves between desktop and mobile layouts
- **THEN** the same transcript, pending answer, and unsent question draft remain available
- **AND** no additional tutor request starts

#### Scenario: Visit or identity ends

- **WHEN** the learner leaves the problem, reloads, signs out, changes account, or quits Electron
- **THEN** the next workspace visit starts with an empty tutor conversation and draft
- **AND** saved practice progress and notes retain their independent persistence behavior

### Requirement: Follow-up questions receive bounded recent dialogue

Each question SHALL include a bounded recent sequence of completed user/assistant messages from the same learner/problem visit and one latest code snapshot. Older dialogue SHALL be omitted at complete exchange boundaries when its context budget is reached. Trimming MUST NOT trigger background summarization, silently truncate the current source/question, or substitute an old code snapshot.

#### Scenario: Follow-up after trying a suggestion

- **WHEN** the learner edits their code following an answer and asks a follow-up
- **THEN** the request includes recent completed dialogue plus the newly captured source as the current code

#### Scenario: Long conversation

- **WHEN** recent dialogue exceeds its context budget
- **THEN** older complete exchanges are omitted without another model call
- **AND** the full transcript remains visible for the current visit with a notice that only recent messages are sent

### Requirement: Replies support an honest request lifecycle

The tutor SHALL show sending, streaming, completed, stopped, and failed states. Learners SHALL be able to stop an active answer and explicitly retry a failed question with a fresh current-code snapshot. Only a confirmed completed answer SHALL count as completed dialogue; interrupted, empty, refused, or failed output MUST NOT appear as a successful answer.

#### Scenario: Streamed answer

- **WHEN** the model produces an answer incrementally
- **THEN** text appears in the corresponding conversation turn as it arrives and becomes completed only on confirmed completion

#### Scenario: Stop or disconnect

- **WHEN** the learner selects Stop, the request times out, or the stream disconnects before completion
- **THEN** any partial text is marked as stopped or incomplete, the request is cancelled where possible, and no automatic retry occurs
- **AND** source, transcript, and question drafts are preserved

#### Scenario: Explicit retry

- **GIVEN** a question failed and the learner subsequently edited their code
- **WHEN** they select Retry with current code
- **THEN** a single new attempt uses the latest source and the same question without duplicating the failed user turn

#### Scenario: Response arrives after navigation

- **WHEN** the learner changes problem or account before an old request finishes
- **THEN** that request is cancelled and its events cannot populate the new conversation

### Requirement: Tutor access is authenticated and server-owned

Every tutor request SHALL verify the learner's server session and allowed origin before provider access. Credentials, model selection, system instructions, context selection, and provider destination MUST remain server-owned. Client-supplied identity or privileged message roles SHALL NOT grant access or alter those settings. Responses MUST be noncacheable.

#### Scenario: Access denial

- **WHEN** a tutor request lacks a valid session or presents a disallowed origin
- **THEN** it returns the appropriate authentication or authorization error without a provider call

#### Scenario: Client attempts to select privileged settings

- **WHEN** a request includes a client identity, API key, provider URL, model override, or system/developer history role
- **THEN** it is rejected without passing those settings or roles upstream

### Requirement: Requests and provider work are bounded

The system SHALL bound source, question, history, request body, diagnostics, output, duration, per-learner frequency, and concurrent provider work. It SHALL reject oversized source or questions clearly rather than silently truncate them, permit only one in-flight question per conversation, and release active-work limits after success, failure, or cancellation.

#### Scenario: Duplicate submit or excessive usage

- **WHEN** a learner double-submits while an answer is active or exceeds the tutor request limit
- **THEN** no duplicate provider work starts and a clear busy or rate-limit state is shown

#### Scenario: Oversized input

- **WHEN** source, question, or request payload exceeds its limit
- **THEN** the request is rejected with recoverable feedback and without a provider call
- **AND** the learner's source and question remain intact

### Requirement: Tutor configuration does not block existing features

Absent or invalid provider configuration SHALL produce an explicit tutor-unavailable state without exposing provider errors or secrets. Installation, production builds, public pages, editing, Run/Submit, notes, and saved progress MUST remain independent of tutor credentials. Adding tutoring MUST NOT change native Electron permissions or add a native bridge.

#### Scenario: Provider is unavailable

- **WHEN** the learner asks while the provider is unconfigured, inaccessible, or rate-limited upstream
- **THEN** the tutor explains the failure and retains the question and source for deliberate recovery
- **AND** existing non-tutor features remain usable

#### Scenario: Build without an OpenAI key

- **WHEN** the project is installed or built without tutor credentials
- **THEN** those operations succeed without contacting OpenAI

### Requirement: Tutor guidance leaves the learner in control

The proposed initial tutor SHALL offer concise, problem-specific hints and explanations before a full solution unless the learner explicitly requests the full solution. It MUST NOT automatically insert, execute, submit, save, or mark code solved. Model output MUST be rendered as inert text and supported formatting rather than executable HTML, scripts, or components.

#### Scenario: Stuck without a detailed question

- **WHEN** the learner asks “I'm stuck here” with incomplete code
- **THEN** the tutor is instructed to explain a relevant next step using the supplied problem and code
- **AND** the editor and account progress are unchanged

#### Scenario: Code-like or HTML-like output

- **WHEN** an answer contains code fences, HTML, links, or instruction-like text
- **THEN** supported formatting is readable but cannot execute code, render raw HTML, load images, or invoke application actions

### Requirement: Tutor fits the existing accessible workspace

The tutor SHALL use the existing tools tab, docked panel and mobile drawer with a labeled question composer, keyboard-operable actions, visible focus, readable contained code blocks, and text status feedback. Chat, notes, editor undo/selection, inputs, hints, and results MUST survive supported layout and theme changes without page-level horizontal overflow.

#### Scenario: Keyboard and narrow review

- **WHEN** a learner composes and sends a multiline question, stops a reply, and closes the mobile drawer using the keyboard
- **THEN** actions are accessible, focus returns to the invoking tool control, and content fits supported narrow widths
- **AND** the editor and notes keep their independent state
