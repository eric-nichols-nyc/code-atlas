# Spec Delta

## Purpose

Help authenticated learners discover React concepts through a familiar subject catalog and understand useEffect setup, dependencies, and cleanup through an authored Hooks lesson.

## ADDED Requirements

### Requirement: React learning discovery

The system SHALL provide an enabled React JS dashboard entry leading through `/react` to `/react/learn` in development and production. React Learn pages SHALL retain subject navigation with Learn active and a Dashboard destination. Navigation SHALL expose only available React destinations.

#### Scenario: Discover React learning

- **WHEN** an authenticated learner selects Explore React JS on Dashboard
- **THEN** the learner reaches React Learn at `/react/learn`
- **AND** Learn is active, Dashboard remains reachable, and unavailable React Practice routes are not advertised

#### Scenario: Preserve the available development practice entry

- **WHEN** React Learn is opened in development with the React Practice pilot enabled
- **THEN** navigation offers Learn and the existing development Practice destination
- **AND** production navigation continues to omit the development-only Practice destination

### Requirement: Hooks catalog and first lesson

React Learn SHALL contain Recommended and Hooks categories and exactly one initially published entry titled `useEffect lifecycle`, categorized as Hooks, recommended, and Easy. Its destination SHALL be `/react/learn/use-effect-lifecycle`. Published-entry counts, difficulty, topic, and one authored lesson outline SHALL follow the existing Learn presentation.

#### Scenario: Browse Hooks

- **WHEN** a learner selects Hooks
- **THEN** the catalog shows useEffect lifecycle with an Easy label, a Hooks topic, one lesson outline, and its React lesson destination
- **AND** Recommended and Hooks each count one published entry

### Requirement: Intersecting learning filters

React Learn SHALL combine the selected category, case-insensitive trimmed search, and difficulty filter using the existing learning behavior. No-match feedback SHALL offer a clear action that resets search and difficulty without changing the selected category. Theme and viewport changes SHALL preserve current filters.

#### Scenario: Search within Hooks

- **WHEN** a learner selects Hooks, searches for `  USEEFFECT  `, and selects Easy
- **THEN** useEffect lifecycle remains visible as the single result

#### Scenario: Recover from no matching results

- **WHEN** the learner selects Hard and then activates Clear filters
- **THEN** the single entry returns, search and difficulty reset, and Hooks remains selected

### Requirement: Independent learner authorization

The catalog and lesson SHALL each verify the learner before presenting learning content. Missing authentication configuration SHALL show setup guidance without protected content; a rejected session SHALL withhold that content even on direct navigation.

#### Scenario: Missing configuration

- **WHEN** a visitor opens the React catalog or lesson without authentication configured
- **THEN** authentication setup guidance appears and learning content is withheld

#### Scenario: Direct lesson access without identity

- **WHEN** a visitor without a valid session opens `/react/learn/use-effect-lifecycle`
- **THEN** the visitor must sign in before the lesson is shown

### Requirement: Accurate useEffect lifecycle lesson

The lesson SHALL explain synchronization with an external system through setup and cleanup, reactive dependencies, setup after commit, cleanup with previous values before changed-dependency setup, and final cleanup on unmount. It SHALL distinguish unchanged dependencies, an empty array, and omitted dependencies, describe dependency comparison with Object.is, and explain the additional development Strict Mode setup/cleanup check.

#### Scenario: Read the dependency-change explanation

- **WHEN** a learner reads the lifecycle lesson
- **THEN** a committed dependency change is explained as cleanup of the previous synchronization followed by setup with the new values
- **AND** unchanged dependencies are distinguished from an omitted dependency list
- **AND** empty dependencies are not described as an unconditional guarantee of one lifetime execution

#### Scenario: Understand client effects and cleanup

- **WHEN** the learner reads the setup, unmount, and Strict Mode sections
- **THEN** effects are identified as client behavior and cleanup is described as reversing setup, including before re-synchronization
- **AND** the text avoids promising that every Effect always runs after browser paint

### Requirement: Guided lifecycle code example

The lesson SHALL include one readable, numbered React code example with manual Previous, Next, and Restart controls and synchronized source highlights and explanations. The example SHALL illustrate an external timer whose reactive delay changes, with cleanup before replacement and on unmount. It SHALL be labeled as an authored explanation rather than a running component or captured trace.

#### Scenario: Step through the example

- **WHEN** a learner advances through the conceptual example
- **THEN** source highlights and explanations cover initial setup, the dependency list, unchanged dependencies, cleanup for a changed delay, new setup, and unmount cleanup
- **AND** Previous and Restart are disabled at the beginning and Next is disabled at the end
- **AND** Restart returns to the first step and theme or viewport changes retain the current step

### Requirement: React learning recovery

React learning SHALL provide destination-specific loading feedback, retryable error feedback, and unavailable-module content for unknown or unpublished lesson slugs. Lesson and recovery return links SHALL lead to `/react/learn`; foreign-subject lesson slugs SHALL not resolve as React lessons.

#### Scenario: Open a lesson from another subject

- **WHEN** an authenticated learner opens `/react/learn/two-pointers`
- **THEN** unavailable-module content is shown with Back to Learn pointing to `/react/learn`

#### Scenario: Recover from a catalog failure

- **WHEN** React learning fails to load
- **THEN** the learner sees an error with Try again and Back to Learn actions

### Requirement: Accessible and responsive shared presentation

The React catalog and lesson SHALL use the existing Learn presentation and semantic themes. Category selection, filters, links, and walkthrough controls SHALL work by keyboard with visible focus. Selected explanations SHALL be announced politely. At 320px, the document SHALL avoid horizontal overflow while code remains locally scrollable. Reduced-motion preferences SHALL be respected.

#### Scenario: Read on a narrow screen

- **WHEN** the learner uses the catalog and lesson at 320px in Light, Dark, Dark purple, or System
- **THEN** headings, Hooks labels, filters, lesson links, and manual walkthrough controls remain usable without document-level horizontal overflow
- **AND** keyboard focus remains visible and code scrolling stays inside its panel

### Requirement: Read-only learning boundary

React Learn SHALL make no execution, judging, saved-progress, or completion claims and SHALL issue no execution, tutor, notes, or progress writes. It SHALL remain available independently of the React sandbox, whose production execution restrictions SHALL remain effective. Existing JavaScript and Algorithms Learn and Practice behavior SHALL remain intact.

#### Scenario: Browse and step without account writes

- **WHEN** the learner filters React Learn, opens the lesson, and steps through the example
- **THEN** those actions neither execute learner code nor write practice progress, notes, or tutoring requests
- **AND** no completion, flag, Run, or Submit control is offered

#### Scenario: Keep sandbox production restrictions

- **WHEN** the application is built for production with React Learn enabled
- **THEN** the catalog and lesson are available to authenticated learners
- **AND** development-only React Practice pages and tutor endpoints remain unavailable under their existing guards
- **AND** obsolete prototype URLs do not become production execution entry points

### Requirement: Authored content integrity

Published React learning content SHALL have unique stable identities, valid topics and lesson outlines, a nonempty registered overview, and valid walkthrough source references. Content checking SHALL report malformed React entries without requiring a React practice problem or weakening JavaScript and Algorithms checks.

#### Scenario: Reject an invalid walkthrough reference

- **WHEN** a React walkthrough refers to a source line outside its example
- **THEN** content validation fails with a diagnostic identifying the offending walkthrough

#### Scenario: Validate a learning-only subject

- **WHEN** all three subjects' valid content is checked
- **THEN** React passes with its learning entry and no judged practice entry
- **AND** JavaScript and Algorithms practice publication checks still run
