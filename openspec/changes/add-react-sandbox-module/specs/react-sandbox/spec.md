# Spec Delta

## Purpose

Let learners explore a React TypeScript exercise through editable source, a rendered interface, browser diagnostics and current-code tutoring in an authenticated development pilot.

## ADDED Requirements

### Requirement: Discover a bounded React pilot

In development, the system SHALL provide a React Practice entry containing one Stale Closure Counter exercise. It SHALL present the goal, requirements and editable starter, with a return path inside React Practice. React Learn lessons and account completion controls SHALL remain unavailable for this pilot.

#### Scenario: Open the first exercise

- **WHEN** a signed-in learner opens React Practice in development
- **THEN** the learner can open Stale Closure Counter and see its requirements, TSX editor, preview, console and tutor
- **AND** no saved, solved or accepted state is implied

### Requirement: Protect pilot access and exclude production execution

The system MUST verify learner identity independently on the React page and tutor endpoint. State-changing requests MUST enforce same-origin and payload checks. Production builds MUST NOT expose executable pilot pages, tutor endpoints or active pilot navigation.

#### Scenario: Anonymous access

- **WHEN** an unauthenticated visitor opens the pilot page or posts a tutor question
- **THEN** the page requires sign-in and the API denies the request before provider work

#### Scenario: Foreign origin

- **WHEN** a signed-in client posts a tutor question from a foreign origin
- **THEN** the server rejects it before preparing a prompt or calling the provider

#### Scenario: Production build

- **WHEN** the application runs a production build
- **THEN** the pilot page displays unavailable/not-found content, its tutor endpoint returns not found, and dashboard navigation does not offer the pilot

### Requirement: Edit one React TypeScript source file

The workspace SHALL expose one editable `/App.tsx` with TSX syntax highlighting, undo/redo and keyboard focus exit. Supporting files and dependency versions SHALL be trusted configuration without editing controls. Source, editor history and tutor conversation SHALL survive tab, theme and responsive-layout changes within the visit.

#### Scenario: Change theme and width after editing

- **WHEN** the learner edits the source, changes the theme, switches output tabs and narrows the viewport
- **THEN** the current source, undo history and conversation remain available
- **AND** Tab can move focus out of the editor

### Requirement: Render the latest source below the editor

The workspace SHALL render React output beneath the editor after a short typing pause. An edit made during compilation SHALL eventually replace the earlier preview without another edit. The counter sample SHALL reset its mounted effects when its code changes so an old interval does not obscure a fix.

#### Scenario: Fix the stale closure

- **WHEN** the learner replaces the starter's captured-count update with a functional state update
- **THEN** the preview counter advances past 1 without a page reload

#### Scenario: Edit while compiling

- **WHEN** another edit arrives before the previous compilation finishes
- **THEN** the preview eventually reflects the latest source rather than silently retaining the earlier version

### Requirement: Show recoverable browser diagnostics

The workspace SHALL provide Preview and Console / errors views. Console messages SHALL remain bounded to the latest 100 entries, and syntax/runtime errors SHALL be visible as text. The preview SHALL remain mounted when viewing console output. Correcting the source SHALL recover the preview without discarding the draft or chat.

#### Scenario: Runtime error then correction

- **WHEN** the current source throws during rendering and the learner subsequently corrects it
- **THEN** the error is visible in the output area and valid React output returns without reloading the workspace

#### Scenario: Invalid TSX then correction

- **WHEN** the source has mismatched JSX tags and is then corrected
- **THEN** the output identifies a syntax failure and recovers after the valid edit

#### Scenario: Inspect interval logs

- **WHEN** the learner selects Console / errors while the counter is running
- **THEN** interval logs continue and switching back to Preview retains the same running frame

### Requirement: Preserve work during preview service failures

The workspace SHALL show loading and unavailable states for the preview service. A connection attempt SHALL time out within 30 seconds. Restart SHALL retry an unavailable preview using the current draft; Reset code SHALL restore the authored starter. Preview failures SHALL leave editing and question composition usable.

#### Scenario: Hosted runtime unavailable

- **WHEN** the preview service cannot connect within 30 seconds
- **THEN** the output explains that the service is unavailable and offers a retry
- **AND** the current source and tutor draft remain intact

#### Scenario: Reset explicitly

- **WHEN** the learner selects Reset code
- **THEN** `/App.tsx` returns to the starter and recompiles while the existing tutor conversation remains available

### Requirement: Tutor uses a fresh source snapshot on demand

Each tutor question SHALL include the exact current `/App.tsx` text, trusted exercise context and bounded recent completed exchanges. Typing SHALL NOT itself contact the tutor provider. A later question or retry SHALL capture fresh editor text even if compilation is pending. Existing streaming, stop, retry and stale-context notices SHALL remain available.

#### Scenario: Ask immediately after editing

- **WHEN** the learner sends a question immediately after an edit and before the preview recompiles
- **THEN** the request contains that edit and the authored exercise context
- **AND** no tutor request was made solely because the learner typed

#### Scenario: Follow up after another edit

- **WHEN** the learner edits again and sends a follow-up question
- **THEN** the request contains the new source and bounded completed conversation history
- **AND** the earlier reply can indicate that its code context has changed

### Requirement: Bound and separate tutor context

The server MUST select authored React context and retain existing question, source, history, body, prompt, timeout and concurrency limits. It MUST reject client authority fields and fabricated judge feedback. The pilot SHALL NOT automatically send console output or preview DOM to the tutor, and SHALL NOT claim the tutor has observed either.

#### Scenario: Forged feedback or authority

- **WHEN** a client adds judge results, model selection or authored instructions to a pilot tutor request
- **THEN** the server rejects the payload without calling the provider

#### Scenario: Source exceeds context limit

- **WHEN** source exceeds the existing 32 KiB UTF-8 tutor source limit
- **THEN** the tutor reports a bounded-input error while retaining the source for editing

### Requirement: Distinguish preview behavior from verification

The pilot SHALL describe source and chat as visit-only. Successful rendering SHALL NOT create a submission, saved progress or accepted verdict. The interface SHALL state that TypeScript is transpiled without semantic type checking and that the tutor receives code only when a question is sent.

#### Scenario: Semantic type mismatch

- **WHEN** syntactically valid TSX contains a semantic TypeScript mismatch
- **THEN** the pilot can render it without presenting a type-check success or judged completion

### Requirement: Isolate the preview from privileged application context

Guest React code MUST run in a separate-origin iframe without application credentials, privileged host APIs or private judge data. The iframe MUST grant only scripts and its own origin; camera, microphone, geolocation and clipboard access MUST be denied. The pilot SHALL disclose that sandbox files are sent to the hosted preview service.

#### Scenario: Attempt parent document access

- **WHEN** guest code attempts to read the host document
- **THEN** the browser denies access and the host editor and tutor remain usable

### Requirement: Fit the existing accessible interface

The workspace SHALL reuse shared panel, control, type and theme patterns. It SHALL show the exercise, editor/output and tutor in desktop columns, and stack them at narrow widths with a bounded tutor scroller. At 320px, code overflow SHALL stay inside its panel without document-level horizontal scrolling.

#### Scenario: Review on a narrow screen

- **WHEN** the viewport is 320px wide
- **THEN** the panels stack in reading order, controls remain named and keyboard operable, and the document has no horizontal overflow
