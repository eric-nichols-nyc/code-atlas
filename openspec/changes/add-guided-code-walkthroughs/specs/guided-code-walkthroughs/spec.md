# Spec Delta

## Purpose

Help learners understand authored JavaScript examples by moving through explanations that stay synchronized with highlighted source lines. Start with the Two Pointers example inside the existing authenticated learning preview.

## ADDED Requirements

### Requirement: Two Pointers includes an embedded code walkthrough

The system SHALL present the existing Two Pointers JavaScript example as one read-only code walkthrough at `/javascript/learn/two-pointers`. It SHALL display the complete numbered source, syntax colors, a current explanation, a step count, progress indicators, and manual navigation. The surrounding learning content SHALL remain available.

#### Scenario: Open the guided example

- **WHEN** an authenticated learner opens the Two Pointers preview
- **THEN** its JavaScript example starts at Step 1 of 6 with pointer initialization explained and its matching lines emphasized
- **AND** the function, usage example, strategy content, diagrams, and problem-name links remain available
- **AND** the preview does not display a lesson-outline section at the bottom
- **AND** the function body appears once rather than in duplicate static and interactive blocks

### Requirement: Each step synchronizes source emphasis and explanation

The system SHALL associate each authored step with a stable identity, a nonempty explanation, and explicit one-based source line numbers. Changing the current step SHALL update its line emphasis, explanation, visible step count, and progress indicators together while preserving the complete source text and numbering.

#### Scenario: Advance through the conceptual steps

- **WHEN** a learner advances through the Two Pointers walkthrough
- **THEN** the ordered concepts are pointer initialization, loop condition, sum calculation, matching-pair return, pointer movement, and no-match return
- **AND** each explanation emphasizes its declared source lines, including both movement branches in the pointer-movement step
- **AND** stepping backward restores the same source emphasis and explanation previously shown

### Requirement: Manual navigation has deterministic boundaries

The system SHALL provide keyboard-operable Previous, Next, and Restart controls. Previous SHALL be disabled on the first step, Next SHALL be disabled on the last step, and Restart SHALL return to the first step. The last step SHALL remain in the current preview without advancing a lesson, wrapping around, or marking saved completion.

#### Scenario: Reach and leave the last step

- **WHEN** a learner advances from the first step through all six explanations
- **THEN** Step 6 of 6 is shown and Next is disabled
- **AND** Previous and Restart remain available
- **AND** the route remains `/javascript/learn/two-pointers`

#### Scenario: Restart the explanation

- **WHEN** a learner selects Restart from a later step
- **THEN** the first explanation, its line emphasis, Step 1 of 6, and the initial indicator state are restored together
- **AND** Previous is disabled and the authored source is unchanged

### Requirement: Walkthrough navigation describes code rather than executing it

The walkthrough SHALL identify itself as a guided explanation of authored code, including alternative branches. Navigation SHALL NOT execute the displayed JavaScript, edit learner source, invoke judging, or imply that the numbered explanations are an execution trace. It SHALL NOT display a Run or Submit control.

#### Scenario: Explain the no-match branch after the successful usage example

- **WHEN** a learner reaches the no-match-return explanation
- **THEN** it describes what happens if no pair is found without claiming that the supplied target-9 example returned no match
- **AND** moving through the explanations causes no code execution or practice progress update

### Requirement: Walkthrough position lasts for the mounted example

The system SHALL preserve the current walkthrough step when theme or available width changes. Each mounted example SHALL maintain its own position. Opening the preview afresh or reloading it SHALL start at the first step; walkthrough position SHALL NOT be represented as account-backed progress or completion.

#### Scenario: Resize and switch themes midway through the explanation

- **WHEN** a learner on Step 4 changes between desktop and mobile widths or changes the shared theme
- **THEN** Step 4, its explanation, and its source emphasis remain selected

#### Scenario: Reopen the preview

- **WHEN** a learner reloads the preview after visiting a later step
- **THEN** the walkthrough starts at Step 1 of 6 without claiming that the prior position was saved

### Requirement: Code and controls remain readable and accessible

The system SHALL show code beside its explanation when space permits and stack them on narrow screens without document-level horizontal overflow. Inactive code SHALL remain readable. Active lines SHALL have a visible non-color-only indicator. Controls SHALL have visible focus; step changes SHALL announce the current step and explanation politely. Motion SHALL respect reduced-motion preferences.

#### Scenario: Navigate the example on a narrow screen

- **WHEN** a learner uses the walkthrough at 320px width
- **THEN** the source and explanation stack, controls and step count remain usable, and long source lines scroll inside their code surface
- **AND** all source lines remain available to assistive technology without decorative line numbers or dots being announced as controls

#### Scenario: Use keyboard navigation with reduced motion

- **WHEN** a learner tabs to the controls and activates them with the keyboard while reduced motion is enabled
- **THEN** stepping and Restart work, focus remains understandable, and the new step and explanation are announced without automatic playback or unnecessary motion

### Requirement: Published walkthrough data is validated before delivery

The system SHALL reject published walkthrough content with empty identity/title/source, an empty step list, duplicate walkthrough or step identities, empty explanations, or invalid line references before a production build succeeds. Every step SHALL name at least one distinct integer line number within its source. A malformed optional walkthrough SHALL preserve readable lesson prose and any available source.

#### Scenario: Reject invalid line references

- **WHEN** an authored step references line zero, a fractional or out-of-range line, duplicate lines, or no lines
- **THEN** content validation identifies the invalid walkthrough and step and prevents the build from publishing that content

#### Scenario: Handle malformed optional walkthrough data defensively

- **WHEN** invalid walkthrough data reaches rendering despite content validation
- **THEN** the lesson retains its surrounding prose and displays the available source with a guided-walkthrough-unavailable message
- **AND** it does not fabricate a step count or leave controls pointing to missing source

### Requirement: Existing learning access and practice boundaries remain enforced

The system SHALL verify the preview's learner session before loading protected overview/walkthrough content, retain the authentication-setup state when configuration is missing, and keep production builds independent of credentials. The walkthrough SHALL preserve existing Learn/Practice routes, loading feedback, account records, and practice behavior.

#### Scenario: Request the guided preview without learner access

- **WHEN** a visitor requests the guided preview without a verified session or with missing auth configuration
- **THEN** the current sign-in or setup behavior withholds the guided lesson content
- **AND** adding the walkthrough does not introduce a public route or bypass the page's own session verification
