# Spec Delta

## Purpose

Let learners keep private, formatted notes for each practice problem, save them to their account explicitly, and continue editing without losing drafts when workspace tools change layout.

## ADDED Requirements

### Requirement: One private note per learner and problem

The system SHALL maintain at most one saved personal note for each authenticated learner and published problem. Every read and write MUST derive ownership from verified server identity and restrict access to that owner.

#### Scenario: Notes are isolated between learners and problems

- **WHEN** learner A saves a note for Sleep and learner B opens Sleep or learner A opens Counter
- **THEN** neither operation returns learner A's Sleep note
- **AND** returning to Sleep as learner A returns that learner's saved note

#### Scenario: Ownership cannot be supplied by the caller

- **WHEN** a caller attempts to read or overwrite another learner's note using an owner identifier in the URL, query, or payload
- **THEN** that identifier never changes the authenticated owner
- **AND** extra PUT payload fields are rejected with HTTP 400

### Requirement: Existing Notes tool opens an accessible editor

The workspace SHALL open the current problem's notes from its existing Notes icon and tab in the desktop panel or narrow-screen drawer. The editor and formatting controls MUST be labeled, keyboard-operable, and usable in light and dark themes without document-level horizontal overflow.

#### Scenario: Open and close Notes with the keyboard

- **WHEN** a learner activates Show notes using the keyboard
- **THEN** the Notes tab is selected and the labeled notes editor becomes available after loading
- **AND** closing the narrow-screen drawer restores focus to the Notes trigger

#### Scenario: Notes fit narrow layouts

- **WHEN** a learner uses Notes at a 320px viewport width or changes the theme
- **THEN** the toolbar, editor, status, and Save action remain usable
- **AND** long links and code scroll or wrap within the notes panel

### Requirement: Bounded formatted content

Notes SHALL support bold, italic, blockquotes, ordered and bulleted lists, code blocks, HTTP/HTTPS links, and clearing formatting. Saved content MUST use the versioned document contract and contain at most 65,536 UTF-8 bytes when its content object is JSON-serialized. Media embeds, executable content, unsupported attributes, and non-HTTP/HTTPS link schemes MUST be rejected by the API.

#### Scenario: Formatting survives a round trip

- **WHEN** a learner saves a note containing every supported format and reopens the problem
- **THEN** its text, paragraph order, lists, code, and links are restored with their formatting

#### Scenario: Unsupported or dangerous content is rejected

- **WHEN** a caller submits media embeds, executable markup as document structure, unsupported formatting attributes, an unsupported format version, or a link using a disallowed scheme
- **THEN** the API returns HTTP 400 without changing the saved note
- **AND** literal markup entered as ordinary text remains inert text

#### Scenario: Oversized content is rejected

- **WHEN** submitted content exceeds the document limit or the request exceeds the 512 KiB transport limit
- **THEN** the API returns HTTP 413 without changing the saved note
- **AND** the editor keeps the draft and displays a size error

### Requirement: Authenticated notes API

GET and PUT `/api/problems/{problemId}/notes` SHALL verify identity and request origin before accessing account data, resolve a published stable problem ID, and return uncached responses. PUT MUST accept only `{content}`; both successful methods MUST return `{content, updatedAt}`, where content contains `formatVersion: 1` and a full document, and updatedAt is an ISO timestamp or null for an absent note.

#### Scenario: First read and subsequent save

- **WHEN** an authenticated learner reads a published problem without a saved note
- **THEN** GET returns HTTP 200 with the canonical empty document and updatedAt null
- **AND** a valid PUT returns HTTP 200 with the stored document and a server-generated timestamp
- **AND** another GET returns the saved content

#### Scenario: Access and input failures deny data access

- **WHEN** a request has no session, an unavailable authentication service/configuration, a foreign origin, an unknown problem, or malformed JSON
- **THEN** it returns HTTP 401, 503, 403, 404, or 400 respectively
- **AND** rejected access or input never reaches note persistence
- **AND** every notes response includes Cache-Control no-store

### Requirement: Explicit save and truthful status

Editing SHALL change only the session draft until the learner activates Save. Save MUST be unavailable before a successful initial read, for an unchanged document, and while a save is pending. Saved status MUST describe only server-confirmed content; clearing a previously saved note and saving MUST replace its content with an empty document.

#### Scenario: Empty state becomes a saved account note

- **WHEN** a successful initial read finds no note and the learner types and selects Save
- **THEN** the UI progresses from No saved notes yet to Unsaved changes, Saving, and Saved with the confirmed timestamp
- **AND** typing alone does not issue a write

#### Scenario: Clearing a note persists the empty state

- **WHEN** a learner clears a nonempty saved note and successfully saves
- **THEN** reopening returns an empty document with a saved timestamp
- **AND** unrelated progress and saved code remain unchanged

### Requirement: Session drafts survive workspace transitions

An unsaved draft SHALL survive closing/reopening Notes, switching between tool tabs, resizing between desktop and drawer layouts, and theme changes within the current learner/problem session. These operations MUST preserve the existing code, editor state, inputs, help expansion, and results. Unsaved notes MUST be identified as session-only; leaving the problem or reloading restores saved account content.

#### Scenario: Resize and tool switching preserve both drafts

- **WHEN** a learner edits notes and code, runs code, toggles Notes and AI tutor, and resizes between desktop and narrow layouts
- **THEN** the notes draft and unsaved status are preserved
- **AND** the code, its editing state, test inputs, help expansion, and latest results remain intact

#### Scenario: Reload restores saved content rather than unsaved edits

- **WHEN** a learner changes a saved note without saving and reloads the problem
- **THEN** the last server-saved document is restored
- **AND** the UI does not claim that the discarded session edits were saved

### Requirement: Responses cannot overwrite later editing or another session

Read and write completions SHALL apply only to the learner/problem session that initiated them. A save MUST acknowledge its submitted snapshot while preserving any later typing as unsaved. Notes state MUST reset on learner or problem changes, and a delayed read or retry MUST never overwrite newer user edits.

#### Scenario: Typing continues during a save

- **WHEN** the learner saves draft A and types draft B before A's success response arrives
- **THEN** draft B remains in the editor and is marked unsaved
- **AND** the saved baseline becomes the server-confirmed version of A

#### Scenario: Account or problem changes during a request

- **WHEN** a pending read or save completes after the learner or problem changes
- **THEN** it cannot populate or alter the new session's document or saved status
- **AND** the former learner's note is not displayed in the new session

#### Scenario: Late reads preserve current work

- **WHEN** a delayed read or retry completes after newer draft edits exist
- **THEN** the draft remains unchanged

### Requirement: Recoverable loading and persistence failures

The UI SHALL distinguish initial loading, initial-read failure, save failure, and expired authentication. Initial-read failure MUST block editing/saving until a successful explicit retry. A failed save MUST preserve the draft and expose retry or sign-in guidance without claiming persistence. Server errors MUST omit database and credential details.

#### Scenario: Initial read fails

- **WHEN** the first notes request fails or returns a malformed successful response
- **THEN** the UI shows a load error and Retry loading notes
- **AND** it does not present the failure as an empty saved note or allow an overwrite

#### Scenario: Save fails and is retried

- **WHEN** a save fails because of a network, malformed response, or persistence error
- **THEN** the current draft remains visible with Not saved and a retry action
- **AND** retry submits the current draft and only success establishes a saved baseline

#### Scenario: Authentication expires

- **WHEN** a read or save receives HTTP 401
- **THEN** the UI stops automatic retries, explains that sign-in is required, and does not report success
- **AND** an already-loaded session draft remains available until the learner/problem session ends

### Requirement: Concurrent sessions have defined save semantics

For saves from different sessions to the same learner/problem note, the last successful database write SHALL determine saved content. The system SHALL prevent duplicate in-flight saves within one session and SHALL NOT imply live synchronization, merging, or conflict detection.

#### Scenario: Two devices save the same note

- **WHEN** device A saves one version and device B subsequently saves another version for the same learner/problem
- **THEN** the next fresh read returns B's version
- **AND** the database contains one note for the pair

### Requirement: Personal notes stay outside authored and execution data

Personal note content SHALL be exposed only through its owner-scoped notes API and editor. Public problem definitions, catalog and progress responses, authored hints/solutions, judge inputs/results, and tutor context MUST exclude personal notes. Saving notes MUST NOT change solved, flag, or saved-code state.

#### Scenario: A saved note cannot enter another delivery path

- **WHEN** a learner saves a recognizable private note and then loads the catalog, progress, problem definition, or executes Run/Submit
- **THEN** those payloads contain no personal note content
- **AND** saving notes alone does not change progress or saved code

### Requirement: Protected persistence remains independent of builds

Notes persistence SHALL remain unavailable without verified identity and runtime configuration, while production builds and public setup routes continue to work without credentials. Browser and online desktop clients MUST use the same authenticated server contract without receiving server credentials or database code.

#### Scenario: Build and setup work before credentials exist

- **WHEN** authentication and database environment values are absent
- **THEN** the production build and public setup routes remain usable
- **AND** protected notes requests fail explicitly without attempting a database connection
