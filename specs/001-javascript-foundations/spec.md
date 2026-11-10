> Superseded for implementation by [JavaScript Coding Problems](../002-javascript-coding-problems/spec.md) after the user corrected the experience on 2026-11-09: editable JavaScript, Run/Submit and test results; no visualization or multiple-choice checkpoint. This document records the earlier design, not the active product requirement.

# Feature Specification: JavaScript Foundations

**Feature Branch**: Not created; the existing working branch is unchanged.

**Feature Directory**: `specs/001-javascript-foundations`

**Created**: 2026-11-09

**Status**: Implemented for one-lesson review; remaining browser-verification limits are recorded in quickstart.md

**Input**: Build the first JavaScript subject around guided concepts and short exercises. Use the reviewed JavaScript landing and resizable workspace designs: lesson content on the left, code/practice above visualization/output in the center, and optional tutor/notes on the right. Keep the experience consistent across subjects and responsive on mobile. The first review delivery contains only one complete published lesson: Scope and shadowing; additional lessons wait until after that review.

**Design references**: [Learning layout v0.4](../../docs/design/learning-layout.md) and [Paper: JavaScript workspace and landing](https://app.paper.design/file/01M711E7M7T5NWFH0KCQJQT1SP/p-2-0). The design describes intended states; it does not establish that those controls already work.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Learn a JavaScript foundation (Priority: P1)

As a signed-in learner, I can open a complete JavaScript lesson, understand its explanation and example, and move through the available curriculum without encountering placeholder lesson pages.

**Why this priority**: A complete, understandable lesson is the core learner outcome. The workspace and catalog must serve actual content.

**Independent Test**: Open each published lesson directly with an authorized session. Verify its title, objective, explanation, example, and valid navigation without requiring the subject landing or tutor.

**Acceptance Scenarios**:

1. **Given** an authorized learner opens a published lesson directly, **When** it loads, **Then** the correct title, topic, learning objective, explanation, example, and activity are shown within the shared application shell.
2. **Given** the initial curriculum, **When** a learner starts learning, **Then** Scope and shadowing is the single complete published lesson, including the brief prerequisite explanation needed to use it without opening other lessons.
3. **Given** the first or last available lesson, **When** lesson navigation is shown, **Then** only valid published destinations appear; the last lesson offers All lessons rather than linking to unpublished material.
4. **Given** no valid signed-in session, **When** a protected subject or lesson is requested, **Then** the existing sign-in flow is used and protected lesson content is withheld. With authentication unconfigured, the existing setup state is shown instead.
5. **Given** an unknown or unpublished lesson address, **When** it is requested, **Then** the learner sees a clear unavailable/not-found state with a valid route back to the JavaScript catalog.

---

### User Story 2 - Discover the JavaScript learning path (Priority: P1)

As a learner, I can enter JavaScript from the dashboard, understand what the subject teaches, and find an available lesson using a flat ordered catalog.

**Why this priority**: The dashboard must lead to a real subject experience instead of a topic-preview dialog. Learners need a clear starting point and a predictable way to return.

**Independent Test**: Open the JavaScript landing with a catalog fixture and verify introduction, Start learning, ordered rows, search, topic filtering, availability, and links independently of lesson activity behavior.

**Acceptance Scenarios**:

1. **Given** the dashboard, **When** Explore JavaScript is selected, **Then** the JavaScript subject landing opens. Start learning opens the first published lesson.
2. **Given** the catalog, **When** it is displayed, **Then** lessons appear in one ordered list without accordion groups; each title and its concise topic tag share one line.
3. **Given** a search or topic selection, **When** it changes, **Then** matching rows retain curriculum order and displayed counts reflect the matching entries. Combining search and topic selection applies both conditions.
4. **Given** no matching entries, **When** filters are active, **Then** a no-results message and clear-filters action are available. Clearing filters restores the full ordered list.
5. **Given** planned lessons, **When** their rows are displayed, **Then** they say Coming soon and provide no action to a missing lesson. Categories and counts do not imply that planned lessons are available.

---

### User Story 3 - Predict, observe, and practice (Priority: P1)

As a learner, I can answer a short question, understand feedback, and step through a prepared scope example to see why the behavior occurs.

**Why this priority**: Active explanation and feedback distinguish this feature from a collection of articles or an interview problem list.

**Independent Test**: Use each lesson activity with a correct and incorrect answer. Separately load the scope scenario and verify every forward, backward, reset, state, explanation, and highlighted-line transition.

**Acceptance Scenarios**:

1. **Given** a lesson checkpoint, **When** a learner submits an answer, **Then** the result and an explanatory reason are shown; incorrect answers can be retried without leaving the lesson.
2. **Given** the scope walkthrough at its initial step, **When** Next step is selected, **Then** the highlighted source line, visible bindings, and explanation agree with the prepared teaching step.
3. **Given** an intermediate step, **When** the learner moves forward and then backward, **Then** the original state and explanation return exactly. Reset returns to the initial step without clearing the learner's checkpoint answer.
4. **Given** the first or final step, **When** controls are displayed, **Then** navigation cannot move outside the scenario's range.
5. **Given** a lesson without a visualization, **When** it opens, **Then** its explanation and practice remain complete and no empty visualization panel or inactive splitter occupies space.
6. **Given** a prepared example, **When** it is presented, **Then** the learner can tell it is a guided walkthrough; it does not claim to trace arbitrary edited code or provide a judged submission result.

---

### User Story 4 - Arrange the learning workspace comfortably (Priority: P2)

As a learner, I can resize the desktop panels, close optional tools, and use the same content on a small screen without losing my current activity.

**Why this priority**: The supplied layout requires working splitters and usable narrow-screen behavior, not a static reproduction of its appearance.

**Independent Test**: Load the scope lesson with a selected answer and intermediate playback step. Exercise each splitter by pointer and keyboard, collapse and reopen the tutor, change viewport size, reset layout, and reload saved dimensions.

**Acceptance Scenarios**:

1. **Given** enough desktop space and a visible tutor, **When** the left or right vertical divider is dragged, **Then** adjacent widths change within readable bounds. Dragging the center horizontal divider changes the code/visualization heights.
2. **Given** a focused divider, **When** its orientation-appropriate arrow keys are pressed, **Then** its position changes within bounds and its accessible current value updates.
3. **Given** a visible tutor, **When** Hide tutor is selected, **Then** its column and divider disappear and the center expands into the released space. Show tutor restores a usable previous width and closing returns focus to its trigger.
4. **Given** adjusted panel dimensions, **When** the page is reloaded in the same browser, **Then** usable saved dimensions return. Invalid or unavailable saved preferences safely fall back to defaults without preventing lesson use.
5. **Given** an active answer and playback step, **When** panels resize, tools close, tabs change, or the viewport crosses a layout boundary, **Then** that learning state remains unchanged. Reset layout restores proportions without clearing learning state or changing optional-panel visibility.
6. **Given** a narrow screen, **When** the lesson opens, **Then** explanation, checkpoint, example, and visualization form a usable single-column flow with no desktop drag handles. Lessons and Tutor open accessible drawers, one at a time, with focus restoration on close.
7. **Given** the current theme preference, **When** moving between the dashboard, catalog, lesson, and overlays, **Then** the chosen appearance remains consistent.

---

### Edge Cases

- Empty curriculum: show an informative empty state and no Start learning action.
- Invalid lesson/topic/activity references or duplicate identifiers: reject invalid authored content before publishing it; provide a readable fallback for unexpected runtime failures.
- Long titles, long code lines, and 200% zoom: keep navigation operable and contain any necessary code scrolling locally.
- Short or narrow viewports: preserve readable panel minimums through the responsive adaptation rather than clipping content.
- Saved dimensions from a larger screen or a different panel configuration: clamp or reset them to usable values.
- Browser storage disabled or corrupted: keep lessons, resizing, and current-session interactions usable.
- Optional visualization failure: retain the lesson and exercise with a clear local fallback and recovery action where applicable.
- Sign-in expires while a lesson is open: protected follow-up requests use the existing access flow; no protected operation succeeds solely because the page was previously visible.
- Lesson route changes: update title, active curriculum item, example, and activity together; do not display one lesson's content under another lesson's title.
- Account or browser changes: do not imply that local panel preferences or unsaved answers are synchronized progress.
- Unavailable tutor and notes: do not show a working composer, fabricated reply, or successful save state.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a JavaScript subject landing reachable from the dashboard and published lessons reachable both from that landing and by direct address.
- **FR-002**: The first review delivery MUST contain exactly one complete published lesson, Scope and shadowing, with an objective, a short prerequisite primer, explanation, highlighted code example, and at least one short exercise with feedback. Additional lessons MUST remain unavailable until the user reviews this complete learning experience.
- **FR-003**: The catalog MUST use one stable curriculum order, flat lesson rows, title/topic alignment, and consistent Basics, Functions, and Async tag meanings across the subject experience. Planned entries MAY appear only with explicit unavailable status.
- **FR-004**: Search MUST match lesson titles and summaries case-insensitively; topic selection MUST combine with search. Counts MUST distinguish or clearly label available versus planned entries. Clear filters MUST restore the full order.
- **FR-005**: Start learning MUST open the first published lesson. No resume, completion, favorite, difficulty, or progress indicator may imply capabilities or learner records that this feature does not provide.
- **FR-006**: Lesson context, curriculum selection, previous/next navigation, and All lessons MUST use the same published order and stable lesson identities. Unavailable destinations MUST not be rendered as active lesson links.
- **FR-007**: Subject and lesson access MUST inherit the existing dashboard sign-in requirement. Access MUST be verified before returning protected content, and missing configuration MUST preserve the existing setup behavior.
- **FR-008**: The desktop workspace MUST arrange lesson content on the left, example/practice above visualization/output in the center when those capabilities exist, and optional tutor/notes on the right. The curriculum MUST be available through Lessons rather than permanently replacing the left lesson pane.
- **FR-009**: Where all relevant panels are visible, the workspace MUST provide two width splitters and one center height splitter. Resizing MUST respect readable minimums, expose accessible values, support pointer and keyboard use, and never force horizontal page overflow.
- **FR-010**: Optional panels MUST close explicitly, release their entire occupied space, and restore a usable previous size when reopened. Tutor MUST be closed on initial page load; this release persists panel dimensions, not tool visibility.
- **FR-011**: The system MUST retain usable panel dimensions locally across reloads and provide Reset layout. Storage failures MUST not block learning. Layout preferences MUST remain separate from lesson answers and completion records.
- **FR-012**: Resizing, collapse/restore, tool tabs, theme changes, and responsive transitions MUST preserve current lesson answers and visualization position within the active page session. Layout reset MUST affect proportions only.
- **FR-013**: Narrow layouts MUST present a single-column lesson flow and accessible curriculum/tutor drawers. Only one modal drawer may be open at once; it MUST contain focus, close with Escape, and restore focus to its trigger.
- **FR-014**: Exercises MUST provide a prompt, answer controls, submission, correct/incorrect explanatory feedback, and retry. Validation MUST not execute arbitrary learner code or imply that an answer establishes saved lesson completion.
- **FR-015**: Scope and shadowing MUST include one prepared walkthrough showing how distinct outer and inner bindings affect name lookup and displayed output. Every step MUST define its source highlight, explanatory text, and visible state consistently.
- **FR-016**: The walkthrough MUST support bounded Previous/Next step and deterministic Reset. Moving backward MUST restore the exact corresponding state. State transitions and explanations MUST remain understandable with reduced motion and without color alone.
- **FR-017**: A prepared walkthrough MUST remain associated with its authored example and MUST not be presented as an execution trace of unrelated edited code. Lessons without a visualization MUST remain complete without empty optional panels.
- **FR-018**: The system MUST show an honest unavailable state for tutor and notes in this release. It MUST not send tutoring requests, accept notes as saved, or present invented learner history.
- **FR-019**: The subject experience MUST reuse the existing global navigation, theme preference, account controls, typography, and semantic surface conventions. It MUST not introduce a second branded global header or a route-forced theme.
- **FR-020**: Learning controls MUST have accessible names, visible focus, and keyboard operation. Feedback MUST be available without relying on color or moving focus away from the learner's current activity.
- **FR-021**: Authored lesson prose, catalog metadata, exercises, visualization scenarios, and learner state MUST remain distinct. Catalog and activity references MUST be checked for missing or duplicate identities before content is published.
- **FR-022**: The system MUST define recoverable loading, empty, no-results, missing/unpublished lesson, content-load error, optional-activity error, and authentication states. An optional activity failure MUST not remove the readable explanation.
- **FR-023**: Learning presentation MUST support a second lesson without duplicating the workspace layout. Verify this through a non-published test fixture; do not author or publish another production lesson in this review delivery. Lesson-specific content and specialized visuals MUST not become requirements of every subject.
- **FR-024**: Only controls supported by the current lesson capability may be presented as operational. The first release MUST not show functional-looking Run, Submit, arbitrary code editing, or example-reset actions that have no implemented behavior.

### Key Entities _(include if feature involves data)_

- **Subject**: A learning area with a stable identity, title, introduction, and curriculum. JavaScript is the first subject.
- **Topic**: A named category with a stable identity, concise label, and consistent visual treatment; it does not create a separate accordion group.
- **Lesson**: A stable identity and address, title, summary, objective, topic, publication state, curriculum position, prose, and optional activity references.
- **Exercise**: A lesson-linked prompt, permitted answers, correct-answer definition, hints or explanations, and retry behavior.
- **Prepared visualization scenario**: An authored example with an ordered set of teaching steps. Each step has a source highlight, explanation, and complete visible state sufficient for deterministic backward navigation.
- **Local layout preference**: Usable workspace dimensions associated with the browser and panel arrangement, separate from learning completion.
- **Active lesson session**: The current answer/feedback and playback position while the lesson is open; not an account-synchronized progress record.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Scope and shadowing is the sole published lesson and can be opened directly and from the catalog. It contains all required learning sections and at least one exercise with verified correct and incorrect feedback; all other catalog entries are clearly unavailable.
- **SC-002**: A signed-in learner can reach the first JavaScript lesson from the dashboard in at most two navigation actions. No catalog or lesson-navigation action opens unpublished or missing content as if it were available.
- **SC-003**: Every query/topic combination in the reference catalog returns the expected ordered entries and counts; a no-match result can be cleared in one action.
- **SC-004**: Every prepared scope step has a verified highlight, state, and explanation. Forward-then-backward playback restores identical visible state at every intermediate step, and Reset always returns to the same initial state.
- **SC-005**: Every displayed desktop splitter can be adjusted by pointer and keyboard without crossing its usable bounds. Closing the tutor gives the center all released width; reset and viewport changes preserve an active answer and selected playback step.
- **SC-006**: At 320, 390, 768, 1024, 1280, and 1440 CSS pixels and at 200% browser zoom, all learning content and controls remain reachable with no document-level horizontal overflow. Required code scrolling stays within the code surface.
- **SC-007**: All primary navigation, exercise, playback, splitter, and drawer operations are keyboard-completable with visible focus and correct focus restoration. The same journeys remain understandable in both existing themes and with reduced motion enabled.
- **SC-008**: Saved usable dimensions survive reload in the same browser, while invalid or unavailable storage never prevents access to lesson content. A non-published second-lesson test fixture uses the same workspace structure and does not display stale content from the previous lesson; it is not exposed through production navigation.

## Assumptions

- Guided concepts with short exercises is the user-confirmed learning direction. The reviewed Paper layout and the supplied Codedrill screenshots establish the panel arrangement and subject landing direction.
- The user narrowed the delivery on 2026-11-09 to one complete Scope and shadowing lesson for review before adding others. Its full prose, examples, and exercise are authored and reviewed during implementation; placeholder content does not satisfy this specification.
- Values and types, Variables with let and const, and all Functions or Async entries are planned content only. This feature does not commit to implementing those subjects' lessons or a complete JavaScript curriculum.
- The existing sign-in flow, global navigation, and theme selection are dependencies and are retained. Public preview lessons are not introduced by this feature.
- Initial curriculum authoring is maintained in the project by trusted authors; a browser-based content editor is deferred. The implementation plan records the concrete authoring and content validation choices.
- Learner answers and playback state are maintained during the active lesson session. Reload may restart those activities; only layout preference persistence is required here. No account-synchronized completion is claimed.
- Entering a different lesson initializes that lesson's own activity state; no answer or highlighted line from the previous lesson may appear as the new lesson's state. Returning to an earlier lesson may start its activities fresh in this release.
- Manual prepared playback is sufficient for this release. Automatic code-to-visualization generation, arbitrary-code execution, and a visual animation-authoring editor are separate capabilities.
- Tutor and Notes are unavailable tool surfaces. Connected AI, saved notes, synced progress, bookmarks, a judged submission system, and a content-management interface are excluded.
- Delivery is the browser experience. Offline synchronization, Electron packaging, desktop permissions, installers, and deployment infrastructure are outside this feature and are not implied by browser validation.
