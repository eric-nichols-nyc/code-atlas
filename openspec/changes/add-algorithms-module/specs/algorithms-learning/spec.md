# Spec Delta

## Purpose

Let learners enter Algorithms from the dashboard and study the existing Two Pointers lesson through the same learning experience available in JavaScript.

## ADDED Requirements

### Requirement: Algorithms is an available dashboard subject

The dashboard SHALL offer an enabled Explore Algorithms link. `/algorithms` SHALL redirect to `/algorithms/practice`. JavaScript SHALL retain its current entry point and React JS SHALL retain its unavailable state.

#### Scenario: Enter Algorithms

- **WHEN** a learner selects Explore Algorithms from the dashboard
- **THEN** the Algorithms practice catalog opens at `/algorithms/practice`
- **AND** the dashboard does not describe Algorithms as coming soon

#### Scenario: Preserve other subject entry points

- **WHEN** a learner selects Explore JavaScript or views React JS
- **THEN** JavaScript still opens its existing practice catalog and React JS remains unavailable

### Requirement: Section navigation belongs to the current subject

Algorithms catalog and learning-preview pages SHALL offer Learn and Practice links targeting `/algorithms/learn` and `/algorithms/practice`. The current section SHALL be identified accessibly. Dashboard navigation, mobile disclosure behavior, and pending-navigation feedback SHALL match the existing subject pattern.

#### Scenario: Switch sections from the preview

- **WHEN** a learner opens `/algorithms/learn/two-pointers`
- **THEN** Learn is active and Practice links to `/algorithms/practice`
- **AND** Back to Learn links to `/algorithms/learn`
- **AND** selecting Dashboard returns to `/dashboard`

#### Scenario: Use mobile navigation

- **WHEN** a learner opens the Algorithms navigation disclosure at 320px width
- **THEN** its links are keyboard operable, Escape restores focus to the disclosure trigger, and choosing a section closes the disclosure
- **AND** pending navigation retains a visible destination label until navigation completes or is interrupted

### Requirement: Algorithms Learn has a real module catalog

`/algorithms/learn` SHALL present Algorithms Learn with one published, recommended Easy Two Pointers module. Recommended and Arrays categories, search, difficulty, counts, and empty-filter recovery SHALL use the JavaScript Learn interaction pattern. The module link SHALL open `/algorithms/learn/two-pointers`.

#### Scenario: Filter and open the copied module

- **WHEN** a learner selects Arrays, searches for `  TWO POINTERS  `, and chooses Easy
- **THEN** the catalog reports one matching module with the copied lesson-outline count
- **AND** activating its title opens the Algorithms Two Pointers preview

#### Scenario: Recover from no matches

- **WHEN** search or difficulty excludes Two Pointers
- **THEN** the catalog reports zero matches and provides a clear-filter action
- **AND** clearing filters restores the module without changing the selected category

### Requirement: Algorithms preserves the current Two Pointers lesson

The Algorithms preview SHALL copy the current JavaScript Two Pointers lesson's prose, strategy diagrams, example links, code example, and guided walkthrough. It SHALL retain the current preview labels and omit the bottom lesson-outline section. Any existing embedded lesson interaction included in the copy SHALL retain its current behavior; this change SHALL NOT invent new lesson interactions.

#### Scenario: Read the copied lesson directly

- **WHEN** an authenticated learner opens `/algorithms/learn/two-pointers` directly
- **THEN** its teaching content and available example interactions match the JavaScript lesson copied during implementation
- **AND** subject navigation and return links stay within Algorithms
- **AND** the original JavaScript lesson remains available at its existing URL

#### Scenario: Navigate the guided explanation

- **WHEN** a learner uses Next, Previous, and Restart in the Algorithms walkthrough
- **THEN** the selected explanation, source emphasis, and step count stay synchronized with the copied authored steps
- **AND** boundary controls disable as in JavaScript, theme or width changes preserve the mounted position, and reloading resets the position
- **AND** stepping does not execute learner code, update practice progress, or claim saved lesson completion

### Requirement: Algorithms learning pages verify their own access

Every Algorithms learning page SHALL verify the learner's session before loading protected content. Missing authentication configuration SHALL show the existing setup state. Unknown or unpublished module slugs SHALL show a not-found state with an Algorithms Learn return link. Loading and content failures SHALL provide named feedback and recovery.

#### Scenario: Request learning content without access

- **WHEN** a signed-out visitor requests the catalog or preview with authentication configured
- **THEN** protected content is withheld and sign-in is required

#### Scenario: Authentication has not been configured

- **WHEN** either learning page is requested without authentication configuration
- **THEN** setup information appears without loading protected lesson content or accessing account data

#### Scenario: Recover from an invalid or failed preview

- **WHEN** an authenticated learner requests an unknown module or a published preview fails to load
- **THEN** the appropriate not-found or retryable error state appears
- **AND** its return link targets `/algorithms/learn`

### Requirement: Copied learning remains accessible and validated

Algorithms learning SHALL retain shared themes, labeled controls, keyboard focus, reduced-motion behavior, and readable content at 320px width without document-level horizontal overflow. Published module metadata, overview references, and authored example data SHALL be validated before production delivery.

#### Scenario: Review the lesson across themes and widths

- **WHEN** a learner changes among Light, Dark, Dark purple, and System at desktop and 320px widths
- **THEN** controls and copy remain readable, long code scrolls within its panel, and mounted filters and walkthrough position remain intact

#### Scenario: Reject broken published content

- **WHEN** Algorithms has a duplicate module identity, invalid topic, missing overview, or invalid copied example references
- **THEN** content validation fails before a production build publishes the broken destination
