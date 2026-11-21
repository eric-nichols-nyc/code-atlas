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
