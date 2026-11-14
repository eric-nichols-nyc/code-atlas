# Spec Delta

## Purpose

Let authenticated learners discover JavaScript learning modules and read their previews through a catalog consistent with Practice, while leaving the individual lesson experience open for later design.

## ADDED Requirements

### Requirement: Learning catalog follows the established practice layout

The system SHALL present `/javascript/learn` as a JavaScript Learn catalog using Practice's page spacing, category sidebar, bordered table, compact rows, search, difficulty filter, and result count. The table SHALL describe learning modules with Module, Difficulty, Topic, and Lesson outlines columns.

#### Scenario: Open the initial learning catalog

- **WHEN** an authenticated learner opens `/javascript/learn`
- **THEN** the page shows a JavaScript Learn heading and a table containing the Two Pointers module with Easy difficulty, Arrays topic, and three lesson outlines
- **AND** Recommended and Arrays categories each show one published module
- **AND** the result count reports one module, rather than a count of practice problems or individual lessons

### Requirement: Categories and filters reflect published modules

The system SHALL derive category counts from published modules, show Recommended and populated topics, and intersect category, case-insensitive trimmed title/summary search, and difficulty filters. Results SHALL retain authored order. Clearing filters SHALL retain the selected category. Planned modules SHALL have no navigable row or contribution to counts.

#### Scenario: Match the sample module across filters

- **WHEN** a learner selects Arrays, searches for `  TWO POINTERS  `, and selects Easy
- **THEN** Two Pointers remains the only matching module
- **AND** the Arrays category remains selected

#### Scenario: Recover from no matching modules

- **WHEN** search or difficulty excludes every module
- **THEN** the result count reports zero modules and the table explains that no modules match
- **AND** an available clear action resets search and difficulty without changing the selected category

#### Scenario: Catalog has no published modules

- **WHEN** the learning catalog contains no published modules
- **THEN** it presents a learning-specific empty state and zero module count without broken links or fabricated sample rows
- **AND** empty topic categories are absent

### Requirement: Two Pointers has a readable module preview

The system SHALL let the published Two Pointers title open `/javascript/learn/two-pointers`. The preview SHALL include an introduction, an original read-only JavaScript example with a stated result, three sample lesson outlines, and a semantic Back to Learn link. It SHALL identify the content as a preview and SHALL NOT create individual lesson destinations.

#### Scenario: Open and leave the module preview

- **WHEN** a learner activates Two Pointers in the catalog
- **THEN** the module preview explains using two indices to traverse an array and shows a JavaScript example
- **AND** Introduction, Opposite-end pointers, and Same-direction pointers each have a short outline
- **AND** Back to Learn returns to `/javascript/learn`

#### Scenario: Direct module navigation

- **WHEN** an authenticated learner opens `/javascript/learn/two-pointers` directly
- **THEN** the same module preview is available without first visiting the catalog

#### Scenario: Invalid module navigation

- **WHEN** an authenticated learner opens an unknown or unpublished module slug
- **THEN** a not-found state provides a route back to Learn

### Requirement: Learning access is verified independently on each page

The system SHALL verify the learner's session before rendering protected catalog or module content on every learning page, independently of navigation redirects. When authentication is unconfigured it SHALL show the existing setup state without learner content. Learning SHALL work without database-backed progress, and production builds SHALL remain credential independent.

#### Scenario: Rejected learner session

- **WHEN** a signed-out visitor requests either the learning catalog or a module preview with authentication configured
- **THEN** the visitor is sent to sign in and protected learning content is withheld

#### Scenario: Authentication setup is missing

- **WHEN** either learning page is requested without authentication configuration
- **THEN** the existing authentication setup information appears without module content or an attempt to access the database

### Requirement: Learning and practice retain separate navigation and state

The system SHALL retain the global Learn/Practice navigation on the learning catalog and previews, with Learn active on both. `/javascript` and existing practice links SHALL keep their current destinations. Learning SHALL NOT expose practice judging controls, solved indicators, bookmarks, or saved-completion claims.

#### Scenario: Navigate between learning and practice

- **WHEN** a learner opens the module preview and selects Practice in global navigation
- **THEN** `/javascript/practice` opens the existing coding-problem catalog
- **AND** selecting Learn opens `/javascript/learn` with its module catalog
- **AND** no learning preview is treated as a solved coding problem

### Requirement: Learning remains accessible across widths and themes

The learning catalog and preview SHALL use the existing theme preference, semantic colors, keyboard-operable controls, visible focus, and labeled search/filter inputs. At narrow widths categories SHALL stack above the table, metadata SHALL remain readable, and code/table overflow SHALL stay inside their surfaces without document-level horizontal overflow.

#### Scenario: Read and navigate on a narrow screen

- **WHEN** a learner uses the catalog and preview at a 320px viewport width
- **THEN** module titles, filters, counts, lesson outlines, and Back to Learn remain usable without page-wide horizontal scrolling
- **AND** category selection, filtering, module navigation, and returning to Learn work using the keyboard

#### Scenario: Preserve the selected theme

- **WHEN** a learner visits Learn and opens Two Pointers with Light, Dark, Dark purple, or System selected
- **THEN** the catalog, preview, code surface, and filter popup follow the existing theme preference
- **AND** changing theme or width does not clear mounted catalog filters

### Requirement: Published learning content has consistent references

The system SHALL validate unique module identifiers, slugs, and ordering, valid topic metadata, nonempty lesson outlines with unique identifiers within each module, and available nonempty authored previews for every published module before a production build succeeds. Outline counts SHALL come from the actual authored outlines.

#### Scenario: Reject an invalid published module

- **WHEN** a published module has duplicate identity/order, an invalid topic, malformed outlines, or a missing or empty preview
- **THEN** content validation reports the invalid content and the build fails rather than publishing a broken module destination

### Requirement: Learning loading and failure states provide recovery

The system SHALL present named loading feedback and recoverable error states for learning routes. A content load failure SHALL offer an explicit retry and a route back to the learning catalog without substituting a successful preview or completion state.

#### Scenario: Preview content fails to load

- **WHEN** loading a published module preview fails
- **THEN** the page reports that the learning content could not load and offers Try again and Back to Learn
- **AND** it does not claim the module was completed
