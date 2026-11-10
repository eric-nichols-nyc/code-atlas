# Workspace interaction contract

## Shared shell and responsive modes

Retain the root GlobalNav, theme provider, and account menu. A separate compact lesson toolbar contains Lessons, subject/topic/title, Reset layout where useful, and Tutor visibility. It is not another branded navigation header.

Desktop composition follows the Paper reference: lesson left; example/practice above visualization/output in the center; optional tutor/notes right. Left tabs are Lesson/Takeaways. The single checkpoint lives in the Lesson view and appears before the example in mobile flow; it is not duplicated in the center. The upper center shows Example, with the illustrative Practice tab omitted until a separate central activity exists. The scope renderer receives the selected prepared snapshot through a subject-owned slot and does not own playback history.

Measure the host's available width and remaining viewport height after the actual header/toolbar, observing their size changes. Avoid fixed header-height subtraction. A wide split mode requires enough measured height for both center panels and their handle; otherwise use the readable flow/scrolling adaptation.

| Capacity                                                    | Mode                                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Inner width at least 1036px and inner height at least 510px | Three docked columns may fit when tutor is open                                             |
| Inner width at least 770px and inner height at least 510px  | Lesson + center; tutor uses a drawer when three columns cannot fit                          |
| Less available space                                        | Single-column explanation, checkpoint, example, visualization, and navigation; no splitters |

Inner capacity excludes the 12px outer inset on each side. Width thresholds derive from 280px lesson + 480px center + optional 256px tutor + 10px separators. Recompute with actual component measurements; do not force a third column just because a device is called a tablet.

SSR and initial hydration render the same readable flow. Browser-only sizing begins after guarded preference loading and measurements. Keep the lesson session provider stable above that branch. No blank page or whole-workspace key change is allowed as a hydration shortcut.

## Current splitter interface

Use shared wrappers around react-resizable-panels 4.21.0 Group/Panel/Separator. Main panel IDs are `lesson`, `center`, and optional `tutor`; nested center IDs are `code` and `visualization`. Write size units explicitly. Numeric Panel sizes are pixels; Group layout maps are percentages.

Side panels preserve pixel size during group resizing; the center preserves relative size. Leave its default size unset to receive remaining space. No panel is drag-collapsible. The library handles separator space; do not calculate percentages against total viewport width.

Default desired dimensions are 340px lesson, 288px tutor, and 54% code share. Clamp against readable minimums and current capacity. If tutor cannot retain 256px while preserving the lesson and 480px center, use a drawer.

Before tutor visibility changes, capture measured lesson width and any usable tutor width. After the new panel set has registered, reapply side widths through pixel resize calls. Reconcile once per configuration change after expected IDs and nonzero sizes exist; the handles are not ready in the pre-commit click handler. Do not run repeated setLayout calls inside every callback.

When hiding tutor, its panel and separator are both absent. The lesson width stays unchanged within rounding tolerance, and all released width goes to the center. Opening restores the bounded previous tutor width. The nested height split is retained independently.

## Persistence and reset

Use the versioned preference record in data-model.md. Catch getItem, JSON parsing, and setItem failures; ignore invalid records. Do not use unguarded useDefaultLayout storage reads.

Save on completed `onLayoutChanged` interactions only when metadata identifies a user interaction. Read actual side widths and center percentage from imperative handles/layout. Automatic viewport clamps do not overwrite the desired desktop preference. Explicit Reset layout persists default desired dimensions, because imperative changes do not report user interaction.

Tutor visibility starts closed on each initial page load and is not stored. Reset layout changes dimensions only; it does not close tools or clear the current answer, feedback, source, step, or notes placeholder.

## Session ownership

One provider keyed to lesson identity owns the answer/feedback, playback index, and tab selections. Temporary panel scroll records can preserve reading position when content changes parent layout. Resizing, theme changes, tab changes, tutor close, and desktop → mobile → desktop transitions do not replace this provider or reset its state.

Keep components controlled by that provider rather than relying on local state inside a layout branch that unmounts. Switching to another lesson initializes its own state; a non-published test fixture proves that boundary without shipping another lesson.

## Keyboard, drawers, and focus

Separator names identify the panels being resized. Preserve library ARIA value/orientation and native Left/Right or Up/Down behavior, Home/End, and separator traversal. Shared focus/hover styling remains visible in both themes. Explicit close controls avoid enabling Enter/drag collapse.

Use shared Sheet primitives for curriculum and tutor drawers. Only one modal drawer is active at a time; desktop docked tutor is not a second modal. Opening curriculum on compact screens closes the tutor drawer. Escape closes a modal and returns focus to its persistent toolbar trigger. Keep those triggers mounted through mode changes. Coordinate responsive focus changes without focusing a hidden/unmounted element.

Use pointer targets larger than the visible 4px grip and configure coarse/fine minimum targets through the library. Narrow flow contains no draggable handles. Modal controls, choices, tabs, copy actions, and step controls have accessible names and keyboard operation.

## Required proof cases

- Drag and keyboard-adjust each displayed splitter to both bounds.
- Show/hide tutor: lesson width change no more than 2px measurement tolerance, center receives released width, active answer/step unchanged.
- Resize upper/lower center, reload, and verify usable stored dimensions; tutor is initially closed.
- Corrupted JSON, wrong version, non-finite values, denied reads, and denied writes retain a usable default.
- Reset dimensions with a selected answer, submitted feedback, and intermediate step: those remain intact.
- Transition 1440 → 390 → 1440 with active learning state and open/closed tools; no state or duplicate-content/focus leak.
- Check both themes, reduced motion, short viewport, 200% zoom, long labels, local code scrolling, and document overflow at every target width.
