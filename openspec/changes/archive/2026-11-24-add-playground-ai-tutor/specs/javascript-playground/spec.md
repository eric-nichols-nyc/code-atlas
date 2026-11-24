# Spec Delta

## ADDED Requirements

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
