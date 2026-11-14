# Spec Delta

## Purpose

Give Algorithms learners a complete Valid Anagram practice challenge with editable inputs, real execution, private submission judging, and the existing account tools.

## ADDED Requirements

### Requirement: Algorithms Practice publishes Valid Anagram

`/algorithms/practice` SHALL publish exactly one initial recommended Easy problem, Valid Anagram, in a Two Pointers category. Its row SHALL open `/algorithms/practice/valid-anagram`. Search, difficulty, categories, flags, and solved indicators SHALL follow the current practice pattern and show only this subject's catalog entries.

#### Scenario: Browse the first Algorithms problem

- **WHEN** a learner opens Algorithms Practice and selects Recommended or Two Pointers
- **THEN** Valid Anagram appears with Easy difficulty and the Two Pointers topic
- **AND** no JavaScript problems appear in the Algorithms table

#### Scenario: Filter and recover

- **WHEN** a learner filters by a nonmatching query or difficulty
- **THEN** the table reports zero matching problems and offers filter recovery
- **AND** clearing the filters restores Valid Anagram

### Requirement: Valid Anagram has a precise function contract

The problem SHALL ask for JavaScript `isAnagram(s, t)` returning `true` exactly when both strings contain the same characters with the same multiplicities, and `false` otherwise. Inputs SHALL be lowercase ASCII strings of 0–1000 characters each. Empty strings SHALL be valid; whitespace and case SHALL NOT be normalized.

#### Scenario: Evaluate representative string pairs

- **WHEN** the function is called with `("anagram", "nagaram")`, `("rat", "car")`, `("aab", "abb")`, `("ab", "a")`, `("", "")`, or `("", "a")`
- **THEN** the required outputs are respectively `true`, `false`, `false`, `false`, `true`, and `false`

#### Scenario: Reject unsupported testcase inputs

- **WHEN** a visible case contains a non-string value, uppercase letters, whitespace, punctuation, or more than 1000 characters in either string
- **THEN** Run reports an input validation error and does not execute that invalid case
- **AND** the server independently rejects invalid execution payloads

### Requirement: The problem teaches a two-pointer solution

The workspace SHALL include the statement, examples, constraints, starter function, hints, and a reference solution that sorts character copies and compares them using one forward pointer per string. The explanation SHALL include multiplicities and unequal lengths, and describe sorting plus the scan as O(n log n) time and O(n) additional space for equal-length inputs. Judging SHALL accept other correct implementations.

#### Scenario: Read hints and the solution

- **WHEN** a learner expands the problem's hints and solution
- **THEN** the content explains why sorting aligns matching characters and how both pointers advance through the sorted copies
- **AND** it distinguishes the linear comparison scan from the overall sorting cost

#### Scenario: Submit another valid algorithm

- **WHEN** a learner submits a correct character-frequency implementation
- **THEN** it can receive Accepted without using the reference solution's pointer names or sorting approach

### Requirement: Run uses current code and edited string inputs

The workspace SHALL provide labeled `s` and `t` string fields for visible cases, preserving the text exactly, including empty values. Run SHALL execute the current source against the selected visible case collection and display real boolean expected and actual values. Source or input edits SHALL mark prior relevant results stale. Existing case-count and concurrent-execution limits SHALL remain enforced.

#### Scenario: Run a changed case

- **WHEN** a learner changes a visible case to `s = "aab"` and `t = "aba"` and runs the current solution
- **THEN** the result uses those edited strings and reports boolean expected and actual outputs
- **AND** changing either string afterward marks that Run result stale

#### Scenario: Display false and empty values accurately

- **WHEN** a visible run expects or returns `false`, or either input string is empty
- **THEN** the result displays `false` and quoted empty strings explicitly rather than treating them as missing values

### Requirement: Submit uses private server-selected cases

Submit SHALL judge the current source against the full server-selected suite independently of client-edited cases or expectations. The suite SHALL cover permutations, repeated-character mismatches, unequal lengths, empty inputs, and boundary lengths. Hidden-case inputs, expected values, actual values, and logs SHALL remain private. Incorrect answers SHALL NOT mark solved.

#### Scenario: Defeat a visible-example shortcut

- **WHEN** a learner submits code that hardcodes the public examples or checks only string length
- **THEN** private cases reject the solution and the problem remains unsolved
- **AND** the response exposes bounded verdict feedback without hidden values or logs

#### Scenario: Accept a complete solution

- **WHEN** the submitted source passes every server-selected case
- **THEN** Submit returns Accepted and makes the problem eligible for account-backed solved status
- **AND** passing Run alone does not mark it solved

### Requirement: Algorithms reuses authenticated isolated execution

The problem page and every protected API operation SHALL verify the learner independently. Learner code SHALL execute only inside the existing resource-bounded isolated runtime with no host filesystem, modules, or network access. Missing configuration, malformed source, exceptions, and resource exhaustion SHALL retain explicit failures and preserve current editor content.

#### Scenario: Reject unauthenticated execution

- **WHEN** a signed-out visitor requests Run or Submit
- **THEN** the request is denied before learner code executes or account data is accessed

#### Scenario: Handle source failures

- **WHEN** submitted code has invalid syntax, throws, loops indefinitely, or returns a non-boolean value
- **THEN** judging returns the appropriate bounded failure instead of accepting a truthy substitute
- **AND** the learner's editor source remains available for correction

### Requirement: Account tools identify the Algorithms problem independently

The Algorithms problem SHALL have a stable identity distinct from all JavaScript problems. Flags, solved state, latest executed code, and private notes SHALL use the existing authenticated persistence rules. Tutor context SHALL use the Algorithms statement and current unsaved source, with existing unavailable-service feedback and privacy rules.

#### Scenario: Restore account work

- **WHEN** a learner flags Valid Anagram, saves notes, and executes a solution before reopening the workspace
- **THEN** successful account writes restore for that learner and Algorithms problem
- **AND** another learner's records and all JavaScript records remain independent
- **AND** unsuccessful persistence is shown as unavailable rather than saved

#### Scenario: Ask the tutor about this problem

- **WHEN** a learner asks for help from the Valid Anagram workspace
- **THEN** the existing tutor receives the public Algorithms statement, examples, and current source
- **AND** it does not receive hidden suites, another problem's statement, or private notes

### Requirement: Algorithms workspaces retain subject navigation and responsive behavior

The focused workspace SHALL omit global navigation and provide Back to Practice targeting `/algorithms/practice`. It SHALL preserve source, inputs, results, and tool state across existing responsive layouts and themes. Loading, setup, error, and not-found states SHALL provide correct Algorithms destinations. JavaScript catalogs and workspaces SHALL retain their existing behavior.

#### Scenario: Return from the focused workspace

- **WHEN** a learner opens Valid Anagram, changes theme or width, and then selects Back to Practice
- **THEN** the mounted workspace retains its working state through the layout changes and the Back link opens Algorithms Practice
- **AND** no workspace control accidentally navigates to JavaScript

#### Scenario: Review on a narrow viewport

- **WHEN** the problem is used at 320px width with keyboard navigation and reduced motion
- **THEN** string fields, case results, editor, Run, Submit, and existing tools remain usable without page-wide horizontal overflow

#### Scenario: Reject a foreign subject slug

- **WHEN** a learner requests a JavaScript problem slug under `/algorithms/practice/` or Valid Anagram under `/javascript/practice/`
- **THEN** the route shows its subject's not-found state rather than opening another subject's problem

### Requirement: Production validates content across subjects

Production validation SHALL check both subjects' published catalogs against their own public definitions and statements, require globally distinct problem IDs, and permit the new string inputs and boolean sample outputs. Production builds SHALL remain independent of runtime credentials.

#### Scenario: Validate multiple subjects

- **WHEN** a published Algorithms statement is missing, a problem ID is duplicated, or its sample output is not boolean
- **THEN** content validation fails before publishing the broken content
- **AND** valid JavaScript and Algorithms content together passes without assuming every problem belongs to JavaScript
