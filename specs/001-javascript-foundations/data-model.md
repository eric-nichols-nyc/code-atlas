# Data model: one Scope and shadowing lesson

This is a content and UI-state model, not a database schema. No migration is required.

## Subject and topic

Subject fields: stable `id`, `slug`, `title`, introduction, and ordered lesson references. Initial subject identity and slug are `javascript`.

Topic fields: stable `id`, concise `label`, and semantic badge variant. The mappings are basics/Basics/blue, functions/Functions/amber, and async/Async/rose. Topic grouping must not alter curriculum order or create accordion groups.

## Catalog entry

Fields: stable `id`, `slug`, `subjectId`, `topicId`, `title`, `summary`, `order`, and `status` (`published` or `planned`). Published entries have a registered lesson definition; planned entries do not receive a usable lesson href.

The review catalog has seven illustrative entries in eventual curriculum order:

| Order | Slug                         | Topic     | Status    |
| ----- | ---------------------------- | --------- | --------- |
| 10    | values-and-types             | basics    | planned   |
| 20    | variables-with-let-and-const | basics    | planned   |
| 30    | scope-and-shadowing          | basics    | published |
| 40    | functions-and-returns        | functions | planned   |
| 50    | closures                     | functions | planned   |
| 60    | promises-and-async           | async     | planned   |
| 70    | event-loop                   | async     | planned   |

Stable lesson identity for the published entry: `javascript.scope-shadowing`. Slugs are URL-facing; display titles and paths are not the identity used for session state. Start learning resolves to the first published entry, currently order 30. Optional prerequisite hints are informational and cannot block this sole available lesson.

Validate unique IDs/slugs/orders, valid topic/subject references, nonempty titles/summaries, and exactly the intended published set for this review. Filter by trimmed case-insensitive title/summary text and optional topic; preserve order. Counts expose available and planned matches separately.

## Published lesson definition and body registry

Definition fields: lesson ID, objective, body identity, example ID, exercise IDs, optional scenario ID, and capability flags derived from actual references. A server-only map provides the explicit MDX importer for the published body.

The MDX body contains prerequisite primer and explanation. The typed definition also contains concise, nonempty takeaway bullets for the separate Takeaways view. Title/objective/topic chrome belongs to the shared lesson frame. MDX does not carry duplicate catalog metadata or activity lookup IDs in this first slice. Planned entries have no body loader. Unknown and unpublished lookups are unavailable, not partly hydrated lessons.

Validation has two boundaries: pure cross-reference checks over authored data and published body identities, followed by Next's compile/type checks over the explicit MDX import registry. No runtime path interpolation, directory glob, or remote compilation is used.

## Source example and highlighted lines

Example fields: stable ID, language `javascript`, exact source string, and optional authored title. It is one canonical source for read-only display and scenario line references. Do not duplicate a modified copy inside the visualizer.

The planned eight-line example is:

```javascript
let message = "Outside";

{
  let message = "Inside";
  console.log(message);
}

console.log(message);
```

Line splitting preserves blank lines and indentation. Source references are 1-based; client playback indices are 0-based. Highlight DTOs contain line number and tokens with text plus light/dark colors. They exclude grammar state, module importers, filesystem paths, and highlighter instances. Concatenated tokens must reproduce each original source line.

## Prediction exercise

Fields: ID `scope-final-output`, lesson ID, type `single-choice`, prompt, options, correct option ID, and per-result explanatory feedback. The prompt asks what the final console.log prints. Options are `outside`/Outside and `inside`/Inside. Correct feedback explains that the inner declaration shadows but does not reassign the outer binding; incorrect feedback addresses that specific misconception.

Validate distinct option IDs, at least two options, one valid correct option, nonempty labels, and useful correct/incorrect feedback. Answers are formative and visible to the learner client; they are not secret grading records or authoritative course completion.

Session transition:

| Event                          | Result                                               |
| ------------------------------ | ---------------------------------------------------- |
| Initial                        | No selection, idle, no feedback                      |
| Select choice                  | Selected choice; previous submitted feedback cleared |
| Check answer                   | Submitted result and explanation; selection retained |
| Try again                      | Clear selection and feedback only                    |
| Playback reset/layout reset    | Exercise state unchanged                             |
| Another lesson identity/reload | May start a fresh exercise session                   |

## Prepared scenario and state

Scenario fields: stable ID `scope-shadowing-walkthrough`, lesson ID, example ID, explicit state/renderer identity `scope-bindings`, title, optional summary, and ordered immutable steps. A subject adapter selects the registered scope view explicitly, never by matching a lesson slug prefix. Each step has a stable ID, active source line, explanation, and complete visible snapshot. There is no user-code evaluation.

Scope snapshot fields: stable scope ID, label, parent scope ID, active scope identity, and displayed bindings. Binding fields: stable ID, name, declaration kind, and a discriminated state: uninitialized, or initialized with a typed primitive value. Uninitialized is not the same as initialized `undefined`.

The first renderer supports the outer/block relationship and string values required here. Keep generic step metadata independent from this subject renderer. The state may be a typed, validated scope-specific payload; do not grow a speculative universal runtime model.

| Frame             | Active line | Visible state after the teaching transition            | Output          |
| ----------------- | ----------- | ------------------------------------------------------ | --------------- |
| outer-initialized | 1           | Outer message initialized to Outside                   | empty           |
| block-entered     | 3           | Block scope created; its message binding uninitialized | empty           |
| inner-initialized | 4           | Block message initialized to Inside; outer unchanged   | empty           |
| inner-logged      | 5           | Inner lookup reads Inside                              | Inside          |
| block-exited      | 6           | Only outer scope remains active/visible                | Inside          |
| outer-logged      | 8           | Outer lookup reads Outside                             | Inside, Outside |

These are prepared teaching transitions, not an exhaustive runtime trace. Label the outer region Outer scope so the diagram does not imply a browser window property. A before/after explanation must match the displayed snapshot semantics consistently.

Validate nonempty unique ordered steps; matching lesson/example IDs; active lines within the source; valid scope parent/binding references; discriminated binding values; valid active scope; and complete snapshot shape. Source output and every expected state need independent semantic review/testing rather than tests that merely restate array length.

Playback state is `stepIndex` within 0..steps.length-1. Previous/Next clamp at boundaries; Reset selects index 0; all rendered state derives from that selected immutable frame. No inverse animation or mutation history is needed.

## Local layout preferences

Record fields: `version: 1`, finite `lessonWidthPx`, finite `lastTutorWidthPx`, and finite `codeSharePercent`. Storage key: `code-atlas:learning-layout:v1`.

Desired defaults are 340px lesson, 288px tutor, and 54% code share. Readable minimums are 280px lesson, 480px center, 256px docked tutor, 240px code, and 260px visualization. Resolve maximums against actual remaining space; proposed side caps are 440px/360px. Store dimensions only, never answers, notes, user identity, scenario data, or tutor visibility.

Reject wrong versions, unknown shapes, non-finite or nonsensical values; use defaults when storage/JSON fails. Clamp otherwise valid desired sizes to current measured capacity without automatically replacing the learner's stored desktop preference with a narrow-screen clamp. Persist completed user resizing and explicit Reset layout.

## Lesson-session state and tool coordination

One provider keyed only by lesson identity owns exercise state, playback index, active authored/activity tabs, and temporary pane scroll positions. Layout readiness, viewport mode, theme, and tutor visibility cannot replace that provider.

Tutor starts closed on initial load. Session visibility determines whether the same unavailable tutor content is docked or shown as a drawer. Curriculum is a drawer on every layout. On compact layouts, opening either modal drawer closes the other. Tool visibility is not persisted. Mode transitions and tool changes preserve learning state.

MDX, exercises, and scenarios stay immutable; local dimension changes never write into authored content. No learner progress entity is introduced in this feature.
