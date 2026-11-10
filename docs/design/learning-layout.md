# Code Atlas learning interface

**Status:** Draft for approval · **Version:** 0.4 · **Date:** 2026-11-09

**Canonical document:** `docs/design/learning-layout.md`

**Current editable design:** [JavaScript workspace and landing in Paper](https://app.paper.design/file/01M711E7M7T5NWFH0KCQJQT1SP/p-2-0)

**Earlier exploration:** [Learning interface draft and dashboard](https://app.paper.design/file/01M711E7M7T5NWFH0KCQJQT1SP/p-1-0)

## Purpose and current direction

Create a JavaScript subject landing page and a reusable learning workspace, following the user's two Codedrill screenshots. The desktop workspace has a resizable lesson panel on the left, a center column split vertically into code/practice and visualization/output, and an optional tutor/notes panel on the right. This replaces the earlier proposal that permanently occupied the left column with curriculum navigation.

The learning experience leads with guided concepts and short exercises. Reuse the same outer workspace for future subjects, while allowing subject-specific examples, practice, and visualizations.

This is a design proposal. Paper frames, resize grips, buttons, exercises, and visualization steps illustrate intended states; they are not working application controls. No lesson route, editor runtime, AI connection, progress persistence, or Electron integration is implemented by this design task.

Reviewed inputs: the supplied workspace and catalog screenshots, relevant Codedrill workspace/visualizer source, the existing Code Atlas shell, `ui-registry.md`, shared theme tokens, and constitution version 1.1.1.

## 1. Navigation and subject landing

Proposed journey: Dashboard → JavaScript landing → lesson workspace.

The JavaScript landing is a subject overview/catalog, separate from the existing public home page. Reuse GlobalNav, the compass brand, Dashboard link, theme switcher, and account controls. Do not add a separate Home item. The brand remains a link to the public home page.

The subject introduction contains a title, a short learning promise, and Start learning. That action opens the first published lesson; a resume action should appear only when real saved progress exists.

Below the introduction, provide lesson search, a topic filter, and one ordered list. There are no accordion groups or category header rows. A lesson title and its concise topic tag share one line. Descriptions may occupy a second line. Use a fixed-width ordinal slot and trailing-action slot so repeated rows align.

Topic colors remain stable: Basics uses blue, Functions amber, and Async rose. The text label carries the category meaning; color is supplementary. Desktop rows may show a format label such as Concept + practice or Visual walkthrough. Mobile omits the separate format column.

Published rows have an entry action. Planned rows say Coming soon, use a clock rather than a permission/paywall lock, and do not link to missing lesson routes. Counts derive from actual catalog data. The seven rows in Paper are illustrative curriculum entries, not a claim that seven lessons have shipped.

Search and topic filtering retain curriculum order. Clearing filters restores the full list. An empty result includes a clear-filters action. Do not add difficulty, ranking, timers, submission counts, or favorite controls without their own requirements.

## 2. Desktop workspace

Keep the existing global header. A compact context toolbar below it contains Lessons, subject/topic/current-lesson context, Reset layout, and Show/Hide tutor. It is a lesson toolbar, not a second branded global navigation.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ GlobalNav: Code Atlas · theme · Dashboard                    account  │
├──────────────────────────────────────────────────────────────────────┤
│ Lessons · JavaScript / Basics / Current lesson    Reset layout Tutor │
├───────────────────┬─┬──────────────────────────────┬─┬───────────────┤
│ Lesson            │ │ Example / Practice           │ │ Tutor / Notes │
│ Takeaways         │ │                              │ │               │
│                   │ │ Code example or activity     │ │ Lesson context│
│ Explanation       │ ├──────────────────────────────┤ │               │
│ Checkpoint        │ │ Visualization / Output       │ │ Optional help │
│                   │ │                              │ │               │
│ Previous / next   │ │ State, explanation, controls  │ │               │
└───────────────────┴─┴──────────────────────────────┴─┴───────────────┘
```

The left and right vertical boundaries resize column widths. The center horizontal boundary resizes the upper and lower panels. These are splitters, not draggable cards or reorderable columns.

At the 1440px reference size, use 12px outer padding, a 340px lesson panel, a 288px tutor, and the remaining width for the center. The two vertical separator hit regions are 10px each. The center starts approximately 54% code and 46% visualization after its separator is accounted for. These are defaults, not rigid dimensions at every viewport.

Proposed minimums are 280px for the lesson, 480px for the center, and 256px for a docked tutor. Suggested lesson/tutor upper bounds are 440px/360px, further clamped to preserve the center minimum. Code and visualization retain at least 240px and 260px respectively on desktop; short viewports allow appropriate scrolling rather than clipping content.

All panes use zero minimum CSS width where necessary. Long code scrolls within its code surface and must not force document-level horizontal overflow. Each desktop pane can scroll independently below its own toolbar. Keep the global header and context controls reachable.

## 3. Resizing, collapsing, and state

- Dragging a vertical separator changes adjacent column widths. Dragging the horizontal center separator changes panel heights.
- Use a visible grip plus a sufficiently large pointer target. Hover and focus receive clear feedback from existing interaction tokens.
- Splitters are keyboard focusable. Left/Right adjust a vertical separator; Up/Down adjust the center horizontal separator. Provide accessible names, orientation, current/min/max values, and visible focus.
- Clamp resizing at minimums rather than making content unreadable. Closing a pane is an explicit action.
- Hiding the tutor removes its full column and separator. The center receives the released width. Reopening restores the previous usable width, clamped to the current viewport.
- Restore focus to the tutor trigger when the panel closes. A curriculum drawer similarly restores focus to Lessons.
- Save dimensions as local layout preferences, independently of lesson content and learner progress. Revalidate saved sizes when the viewport changes; ignore invalid preferences and use defaults.
- Reset layout restores default proportions without clearing code, answers, notes, visualization steps, or the current lesson. It does not silently change which optional panels are open.
- Resizing, closing tools, changing tabs, and responsive transitions preserve the active activity and playback state.

Paper includes both tutor-open and tutor-closed states. Closed is the proposed initial state while the tutor remains deferred; the open frame demonstrates geometry and an honest Coming soon state. A connected AI experience and saved notes require their own feature scope.

## 4. Lesson and activity panels

The lesson panel contains one page-level title, introduction, authored explanations, and a short prediction checkpoint. Lesson and Takeaways are distinct authored views. Avoid duplicating a Practice tab in this panel when Practice already exists in the center.

The upper center offers Example and Practice. Example can be a read-only syntax-highlighted sample with Copy and Reset example. Practice hosts the lesson's declared exercise type. Designing this slot does not require an arbitrary-code runner or imply that the pictured code is executable.

The lower center offers Visualization and Output. A prepared visualization provides a highlighted source line, explicit state, step explanation, Previous/Next step, and Reset. Playback must be deterministic and support backward navigation. Respect reduced-motion preferences. Automatic playback is not required by this first layout.

The illustrative scope scenario shows separate outer and block bindings for `message`. The displayed state is the state after the highlighted declaration. Prepared steps must never be presented as an execution trace of unrelated edited code. A code-driven tracing engine is a separate capability.

Checkpoints provide a prompt, answer controls, explanatory feedback, and retry. Do not infer saved completion from opening a lesson, choosing an answer, or pressing Run. Previous/next lesson destinations follow the same published curriculum order; omit unavailable destinations. The pictured last available lesson links to All lessons rather than an unpublished next lesson.

Tutor and Notes share the optional right panel. The first design shows Tutor coming soon and an unavailable composer. No fabricated conversation or saved learner note is shown.

## 5. Responsive behavior

Use available content space rather than assuming every tablet can display the desktop arrangement.

| Available workspace width    | Proposed treatment                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Approximately 1060px or more | Three columns may dock when their minimums, separators, and padding fit. Tutor remains optional.                      |
| Approximately 794–1059px     | Lesson and center can share the row when minimums fit; tutor opens as a drawer.                                       |
| Below approximately 794px    | Single-column lesson flow: explanation, prediction, example, visualization, and lesson navigation. No resize handles. |

These thresholds follow the proposed minimum sizes and must be validated against actual component measurement in the implementation plan.

On mobile, Lessons opens a flat curriculum drawer. Tutor opens a separate drawer; only one modal drawer is open at a time. Both trap focus, close with Escape, lock background scrolling, and return focus to their triggers. Stack variable/scope cards vertically when needed. Keep code readable with local scrolling rather than shrinking the entire workspace.

The header remains content-driven, including when mobile global navigation expands. Do not hard-code viewport offsets from the Paper header heights. Keep search/filter controls usable at narrow widths and allow supporting text to wrap.

## 6. Visual conventions and reusable components

Reuse the existing professional developer-tool direction: neutral dark surfaces, subtle borders, clear type, and restrained topic/syntax colors. The existing next-themes preference applies consistently across all routes and overlays; the new learning surface must support the same light palette rather than forcing dark mode.

Desktop subject content uses a centered 1200px maximum including horizontal padding. Subject title is 36/44px desktop and 28/36px mobile. Dense workspace body text is 14/23px, panel labels 13/20px, and code 13/26px. Use existing Arial and Menlo stacks and semantic token roles. Do not copy the reference site's orange branding or unrelated feature chrome.

Proposed feature-owned components:

- SubjectLanding and LessonCatalog: subject introduction, search/filtering, flat ordered rows.
- LearningWorkspace: panel arrangement, splitters, sizes, and responsive transitions.
- LessonNavigation: shared curriculum order, active lesson, drawer, and previous/next destinations.
- LessonPanel: title, prose, checkpoints, and takeaways.
- ExamplePracticePanel: example/activity presentation, independent of a particular editor library.
- VisualizationPanel: playback controls and explanations through a subject-provided state renderer.
- TutorPanel: optional help/notes surface and unavailable state.

Generic shadcn primitives belong in `packages/ui`. Routes and feature behavior belong in `apps/web`. Subject-specific visualizers stay separate from the generic learning shell. Authored lesson content, exercise definitions, prepared scenarios, and learner state retain separate contracts.

## 7. States and convention changes

The eventual feature must define loading, not-found, content-load error, empty catalog, no filter matches, malformed optional activity, unavailable tutor, and unauthenticated behavior. One optional activity failure should not hide the lesson explanation.

The following earlier design decisions are superseded:

| Earlier direction                       | Updated direction                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| Permanent curriculum column on the left | Lesson content on the left; curriculum available through Lessons and the subject catalog |
| Single central reading workspace        | Vertically resizable code/practice and visualization/output panels                       |
| Fixed proposed side-panel sizes         | Initial sizes with bounds, keyboard resizing, and saved local proportions                |
| One reading flow on all desktop layouts | Consistent multi-panel desktop shell and a single-column narrow-screen adaptation        |

The existing GlobalNav already supports full-width containers and always-visible utilities. Reuse it. Add only the shared splitter, tab, and drawer primitives needed by the scoped implementation. Select their exact libraries/APIs in the feature plan.

## 8. Minimal implementation plan after design review

1. Use Spec Kit to scope the JavaScript learning journey, starting with one complete lesson and its landing-to-workspace navigation. Use this document and the current Paper page as design inputs.
2. Define validated subject/topic/lesson IDs, published ordering, content and activity references, access policy, and the meaning of completion. Confirm MDX and structured scenario authoring in the plan.
3. Build the shared responsive shell, keyboard-accessible splitters, local layout preferences, curriculum navigation, and honest unavailable-tool states.
4. Connect an authored lesson, highlighted example, prediction exercise, and one prepared visualization. Prove a second lesson can reuse the same components.
5. Test resizing bounds, panel collapse/restore, reset behavior, preference reload, direct lesson links, empty/error states, keyboard flow, and narrow-screen overflow. Run repository checks for implementation, not for this design-only revision.

Acceptance includes: all three desktop splitters work with pointer and keyboard; tutor close releases its entire column; resizing preserves lesson/activity state; narrow layouts expose the same learning content without overflow; title and topic tag stay aligned; unavailable lessons have no dead links; current theme reaches all panes and portals; prepared visualization behavior is accurately described.

AI integration, arbitrary-code execution, server-synced progress, a visual scenario-authoring editor, and Electron packaging remain separate features unless explicitly included during scoping.

## Review deliverables

The current Paper page contains JavaScript landing desktop/mobile, workspace tutor open, workspace tutor closed, and mobile lesson flow. Sample curriculum entries and playback states are illustrative. Review the panel arrangement, density, resize behavior, landing structure, and responsive adaptation before generating the implementation specification.
