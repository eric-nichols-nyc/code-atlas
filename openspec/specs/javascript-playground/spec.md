# javascript-playground Specification

## Purpose

Give JavaScript learners an authenticated scratchpad where they can run their own code and see console output.

## Requirements

### Requirement: JavaScript learners can open Playground

The JavaScript subject navigation SHALL offer a Playground page at `/javascript/playground` with one editable `script.js` and a console. The console SHALL sit beside the editor on desktop and below it on narrow screens. The page SHALL follow the learner's active theme.

#### Scenario: Open Playground from Practice

- **WHEN** a signed-in learner selects Playground from JavaScript Practice
- **THEN** the Playground heading and starter code appear and Playground is the current navigation item
- **AND** the console is ready for the first run

#### Scenario: Use Playground on a narrow screen

- **WHEN** a learner opens Playground at 320 pixels wide
- **THEN** the editor appears above the console and code overflow stays inside the editor

### Requirement: Run executes a snapshot of standalone JavaScript

Run and the editor's platform shortcut SHALL execute the current editor contents as a single standalone script in a fresh guest. Each run SHALL show its own bounded logs and final status. Promise callbacks and timers supported by the guest SHALL run within its execution budget.

#### Scenario: Run the starter script

- **WHEN** the learner selects Run on the starter script
- **THEN** the console displays the logged arrays and a finished status

#### Scenario: Run async code and rerun it

- **WHEN** the learner reruns a snippet that logs from a Promise callback and a timer
- **THEN** the console shows the current run's output in execution order and guest state starts fresh

### Requirement: Preserve drafts and report honest output

Playground SHALL retain the draft and latest output during the visit and communicate failures without discarding source. A pending run SHALL prevent overlap. Output from a different source snapshot SHALL be identified as coming from the last run.

#### Scenario: Edit during or after a run

- **WHEN** the learner changes the draft while it is running or after it completes
- **THEN** the result belongs to the source captured at Run and the console identifies earlier output
- **AND** rerunning the current code replaces the earlier result

#### Scenario: Correct a failed script

- **WHEN** a script produces a syntax error, runtime error, or timeout
- **THEN** the console displays the failure and the learner can correct and rerun the same draft

#### Scenario: Start another visit

- **WHEN** a learner reloads or leaves and returns to Playground
- **THEN** Playground starts with the starter draft and an empty console

### Requirement: Run is authenticated and bounded

The page and Run endpoint SHALL independently verify the learner session. Run SHALL enforce origin, input, output, resource, and concurrency limits. Guests SHALL have no browser, filesystem, module, network, or account access. Playground SHALL make no practice or account progress writes.

#### Scenario: Reject an unauthorized or oversized request

- **WHEN** a Run request lacks a verified session, comes from a foreign origin, or exceeds the supported source or request limit
- **THEN** the request is rejected before guest execution

#### Scenario: Recover after a resource limit

- **WHEN** a script exceeds a resource limit
- **THEN** its execution ends and the learner can run a valid script afterward

### Requirement: Playground provides on-demand tutoring

The Playground SHALL open an AI tutor on request, with a collapsible dock on wide screens and an accessible drawer on narrow screens. The tutor SHALL stream hint-first answers and support follow-up questions, Stop, and explicit Retry. The conversation and question draft SHALL last for the workspace visit and survive opening, closing, and resizing the panel.

#### Scenario: Ask for help

- **WHEN** a learner opens the AI tutor and sends “I'm stuck here”
- **THEN** the tutor provides a hint grounded in their code and a guiding question
- **AND** the learner can ask a follow-up in the same conversation

#### Scenario: Hide or resize the tutor

- **WHEN** the learner hides, reopens, or resizes an open tutor
- **THEN** its conversation and unsent question remain available
- **AND** the workspace keeps its editor and console state

#### Scenario: Return to Playground

- **WHEN** the learner leaves or reloads the workspace and opens the tutor again
- **THEN** it starts with an empty conversation and question

### Requirement: Questions capture the current script at Send

The tutor SHALL use the live editor source and bounded recent completed exchanges on explicit Send or Retry. It SHALL include a bounded error from the latest Run only when its source matches the question's script. The learner SHALL see what context accompanies Send and whether their script has changed since a question.

#### Scenario: Ask about unexecuted changes

- **WHEN** the learner edits or clears the source and asks a question without executing it
- **THEN** the question uses the latest draft and excludes any error from older code
- **AND** asking leaves the source and console intact

#### Scenario: Ask about a matching error

- **WHEN** the learner asks about a failed Run against their current source
- **THEN** the tutor may use the matching error as supporting context

#### Scenario: Use the editor without asking

- **WHEN** the learner opens the tutor, types, changes theme, or runs a script
- **THEN** no tutor request starts until they send or retry a question

### Requirement: Tutor requests use the protected tutor boundary

Playground tutoring SHALL use verified learner identity, origin checks, and the existing tutor request, stream, and concurrency limits. The server SHALL control the prompt and provider configuration. The tutor SHALL treat script and run error text as learner data and preserve the learner's source and question if the tutor is unavailable.

#### Scenario: Reject an unauthorized or invalid question request

- **WHEN** a request lacks an authenticated session, has a disallowed origin, or includes unsupported context or provider settings
- **THEN** it fails before the provider is called

#### Scenario: Tutor is unavailable

- **WHEN** the configured tutor cannot answer
- **THEN** the learner sees a recoverable failure and can still edit and run their script
