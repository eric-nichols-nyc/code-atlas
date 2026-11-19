# Spec Delta

## Purpose

Help authenticated React learners rehearse technical explanations through authored interview prompts, compare their reasoning with a reference rubric, and identify concepts they want to review.

## ADDED Requirements

### Requirement: Discover Interview Prep within React Learn

React Learn SHALL publish a recommended Medium module titled Interview Prep at `/react/learn/interview-prep`, under the Interview Prep topic. Its single authored outline SHALL describe the State, rendering, and effects rehearsal. The existing Learn category, search, and difficulty filters SHALL apply to the module.

#### Scenario: Browse the new topic

- **WHEN** a learner selects Interview Prep in React Learn
- **THEN** one published Interview Prep module appears with Medium difficulty and one authored outline
- **AND** Recommended contains both the existing Hooks module and Interview Prep, while Hooks contains only its existing module

#### Scenario: Filter interview content

- **WHEN** a learner searches for `  INTERVIEW  ` and selects Medium within Interview Prep
- **THEN** the new module remains visible
- **AND** selecting Easy produces existing no-match feedback and Clear filters restores the result without changing the topic

### Requirement: Enforce independent learner access

The module page SHALL independently verify learner identity before displaying rehearsal content. Missing authentication configuration SHALL show setup guidance. Unknown or unpublished React module addresses SHALL retain the existing React-local unavailable experience.

#### Scenario: Open the module directly without a session

- **WHEN** a visitor without a valid learner session opens `/react/learn/interview-prep`
- **THEN** sign-in is required before the content is displayed

#### Scenario: Missing configuration or unavailable content

- **WHEN** authentication is not configured or an authenticated learner requests an unknown module
- **THEN** the applicable setup or unavailable experience appears without exposing the requested protected rehearsal
- **AND** unavailable-module return navigation leads to React Learn

### Requirement: Present accurate rehearsal identity

The module SHALL identify itself as an Interview rehearsal with authored self-review and visit-only responses. Learn SHALL stay active, and Back to Learn SHALL return to `/react/learn`. Existing module previews SHALL retain their established presentation.

#### Scenario: Enter the session

- **WHEN** a learner opens Interview Prep
- **THEN** the page identifies the rehearsal and does not state that all interactive exercises are unavailable
- **AND** opening the existing useEffect lifecycle lesson still presents its module preview and walkthrough

### Requirement: Provide three source-grounded drills

The initial rehearsal SHALL contain three ordered drills covering queued state updates, unnecessary derived-state Effects, and Effect cleanup/dependencies/Strict Mode. Each SHALL include a prompt, model answer, reasoning checklist, common mistake, official documentation link, and one follow-up prompt with an explanation.

#### Scenario: Rehearse state updates

- **WHEN** a learner reads the prediction drill and reveals its answer
- **THEN** the answer explains the stated initial state, state snapshots, and the difference between repeated direct setters and functional updater functions
- **AND** the result is an authored explanation rather than a claimed execution trace

#### Scenario: Rehearse Effect decisions

- **WHEN** a learner reads the other two drills and their answers
- **THEN** derived render data is distinguished from external synchronization
- **AND** old cleanup before changed-dependency setup, unmount cleanup, and the extra development-only Strict Mode check are explained without an unconditional once-only or paint-timing guarantee

### Requirement: Allow optional written rehearsal

Each drill SHALL offer a labeled optional response field limited to 4,000 characters. Written responses SHALL remain plain text and SHALL neither execute nor be rendered as markup. Reading or editing a response SHALL cause no grading, provider request, or account write.

#### Scenario: Write a response containing code or markup

- **WHEN** a learner enters source code or markup in a response
- **THEN** it remains editable plain text within the stated limit
- **AND** it does not execute or become rendered HTML

### Requirement: Reveal teaching material on demand

Each drill SHALL initially conceal its model answer and follow-up. Reveal answer SHALL disclose the answer, checklist, common mistake, reference, and follow-up prompt without requiring a written response. Reveal follow-up SHALL disclose the follow-up explanation only on request.

#### Scenario: Compare without typing

- **WHEN** a learner selects Reveal answer with an empty response
- **THEN** the authored feedback and follow-up prompt appear without a submission or correctness verdict
- **AND** the follow-up explanation remains concealed until Reveal follow-up is selected

### Requirement: Preserve state while moving through the rehearsal

Previous and Next SHALL navigate the ordered drills without requiring answers or ratings. Previous SHALL be unavailable on the first drill. Returning to a drill SHALL restore its response, reveal states, and self-review label. The last forward action SHALL open the review summary.

#### Scenario: Revisit an earlier answer

- **WHEN** a learner writes an answer, reveals its feedback, navigates forward, and returns
- **THEN** that drill retains its answer and reveal state
- **AND** moving between drills does not overwrite another drill's state

### Requirement: Record confidence as self-review

After revealing a drill's rubric, the learner SHALL be able to label it Needs review or Comfortable. The default SHALL be Not reviewed. Changing a label SHALL replace that drill's previous label. These labels SHALL be presented as learner self-assessment, without an objective score, accepted verdict, or hiring-readiness claim.

#### Scenario: Change a self-review label

- **WHEN** a learner labels a revealed drill Needs review and later changes it to Comfortable
- **THEN** the current label becomes Comfortable
- **AND** the drill is counted once in the summary

### Requirement: Review the session without forced completion

The end summary SHALL show all three drills grouped by their current Needs review, Comfortable, or Not reviewed label. Each drill SHALL be reachable from the summary. Opening the summary SHALL not mark unrated drills complete or imply saved progress.

#### Scenario: Review a partially attempted session

- **WHEN** the learner reaches the summary after rating only one drill
- **THEN** that label appears with the rated drill and the other two appear as Not reviewed
- **AND** selecting a listed drill restores its session state

### Requirement: Keep rehearsal data within the visit

Response text, reveal states, labels, and position SHALL exist only for the mounted module visit. Theme and viewport changes SHALL retain them; leaving the module or reloading SHALL discard them. The page SHALL explain this lifetime near the response field and summary and SHALL not persist or transmit response text.

#### Scenario: Change layout then reload

- **WHEN** a learner changes theme and narrows the viewport after writing and reviewing a drill
- **THEN** the session state remains intact
- **AND** reloading starts at the first drill with empty responses, hidden answers, and Not reviewed labels

### Requirement: Keep production rehearsal separate from execution

The authenticated rehearsal SHALL be available in production without starting a React sandbox, executing learner code, or contacting an AI provider. Existing production restrictions on React Practice and its tutor SHALL remain effective. Rehearsal interactions SHALL not alter practice flags, solved status, notes, or latest executed source.

#### Scenario: Use Interview Prep in production

- **WHEN** a learner opens and completes a rehearsal in a production build
- **THEN** no sandbox runtime, grading, tutoring request, or account progress write is initiated
- **AND** the existing React Practice execution routes and tutor endpoint remain unavailable under their production guards

### Requirement: Support accessible responsive rehearsal

Drill controls, response fields, disclosures, and self-review choices SHALL work by keyboard with visible focus and text labels. Drill changes SHALL focus the new heading and announce position politely; reveals SHALL retain disclosure focus and expose expanded state. The session SHALL support all shared themes, reduced motion, and 320px layouts without document-level horizontal overflow.

#### Scenario: Rehearse with a keyboard on a narrow screen

- **WHEN** the learner writes, reveals, navigates, labels, and reviews at 320px using the keyboard
- **THEN** focus follows the stated behavior and every control remains reachable and named
- **AND** code scrolls within its own panel, confidence does not rely on color, and theme changes preserve the answer

### Requirement: Validate authored rehearsal integrity

Content checking SHALL reject duplicate drill IDs, empty required teaching fields, empty checklists, invalid official-reference links, or a pack without a published owning module. Existing subject metadata, prose, and walkthrough checks SHALL remain active.

#### Scenario: Reject incomplete teaching content

- **WHEN** a registered rehearsal contains an empty model answer, duplicated drill ID, or invalid reference
- **THEN** content checking fails with a diagnostic identifying the offending pack or drill
- **AND** valid React, JavaScript, and Algorithms content continues to use its existing validation
