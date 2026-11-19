# React Interview Prep research

Research date: 2026-11-14. Sources below are primary sources. Product formats,
session lengths and release sequencing are recommendations, not findings about
which questions employers ask most often.

## What the evidence supports

Microsoft describes technical interviews as assessing problem solving, design,
coding and testing. Its guidance explicitly encourages clarifying ambiguity,
forming a plan, writing executable code and checking boundaries and error cases.
This supports practicing an explanation process alongside technical knowledge.
[Microsoft technical interviewing](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html)

Amazon's Front-End Engineer guidance includes front-end coding and system design.
Its design objectives include usability, performance, user experience,
accessibility, security and scalability. This supports broader UI reasoning
alongside React API recall; it does not establish a universal interview format.
[Amazon FEE interview preparation](https://amazon.jobs/content/en/how-we-hire/fee-interview-prep)

React explains state as a snapshot associated with a render. Event handlers keep
that render's values even after a setter requests another render. Separately,
React documents queued updater functions as the way to apply successive changes
to previous state. These provide concrete material for prediction and debugging
questions.
[State as a Snapshot](https://react.dev/learn/state-as-a-snapshot),
[Queueing State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)

React recommends calculating derived values during rendering and keeping
interaction-specific logic in event handlers when appropriate. Effects serve
synchronization with external systems, rather than being a default location for
all state-related logic.
[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

For an Effect with changed dependencies, React runs the old cleanup before the
new setup, and runs cleanup on removal. Strict Mode adds a development-only
setup/cleanup cycle. React also demonstrates ignoring stale async responses in
cleanup and recommends framework data fetching when available.
[useEffect reference](https://react.dev/reference/react/useEffect)

## Three product directions

| Direction                                    | Proposed experience                                                                                                                                        | Main value                                                     | Tradeoff                                                                                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Concept and reasoning drills                 | A short Explain, Predict or Fix prompt; learner writes a response; authored answer, rubric and follow-up appear on request.                                | A focused first release with explicit reasoning practice.      | Self-review cannot verify coding skill or objectively grade an explanation.                                                              |
| Practical debugging and component challenges | A 20–30 minute task: fix an interval, build a filterable list, or complete a keyboard-accessible accordion; review behavior, edge cases and decisions.     | Demonstrates implementation and testing with visible outcomes. | Needs a production-ready React execution boundary, behavioral evaluation and richer task authoring.                                      |
| Structured mock interviews                   | A 30–45 minute guided session: clarify requirements, outline a design, solve a task, test it and explain a tradeoff; finish with evidence-linked feedback. | Rehearses sequencing, communication and time management.       | A convincing interviewer, useful feedback and fair scoring require substantially more work; any AI assessment needs separate validation. |

All three are design inferences from the evidence above. They are alternatives
with different first-release costs, and could later share a curriculum. The
suggested timings are adjustable product defaults.

## Recommended first slice

Parent-provided repository context: React Learn is available in production; the
React coding sandbox remains a development-only pilot. Therefore, recommend an
**Interview Prep module inside React Learn**, at `/react/learn/interview-prep`,
starting with three authored drills without executing learner code or requiring
AI. This is a repository-fit recommendation, not a learning-effectiveness claim.

1. **Predict — state snapshots and update queues.** Predict the outcome of
   repeated direct setters, then compare functional updates. The rubric checks
   both the resulting value and the reason; a follow-up changes the event timing.
2. **Explain — remove unnecessary derived state.** Explain where a filtered list
   belongs and when an external subscription really needs an Effect. The rubric
   checks the distinction between derivation, interaction and synchronization.
3. **Fix — interval cleanup and dependencies.** Read a timer snippet and write a
   corrected version or precise explanation. The rubric checks cleanup on
   dependency changes/removal and resilience to Strict Mode's extra development
   cycle. This is authored self-review, not executable verification.

Each drill should follow **attempt → reveal → compare with rubric → answer a
follow-up**. Label review as self-assessment; show no fabricated pass verdict or
job-readiness percentage. Link to the relevant React documentation and existing
Hooks lesson. Keep responses and review state visit-only for this first slice.
Those interaction and persistence choices are proposed scope.

## Content to add later

- **Identity and keys:** diagnose input moving to the wrong row after reordering.
  React documents stable keys and warns about index/random keys; component type,
  key and position also determine state preservation.
  [Rendering Lists](https://react.dev/learn/rendering-lists),
  [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- **Async UI:** reason about loading, empty, error and stale-response states,
  using the useEffect reference above as the narrow technical basis.
- **State and component design:** choose minimal state and component boundaries.
  [Choosing State Structure](https://react.dev/learn/choosing-the-state-structure),
  [Thinking in React](https://react.dev/learn/thinking-in-react)
- **Accessibility:** include keyboard behavior, focus and accessible semantics
  in component rubrics. W3C's accordion pattern specifies button headings,
  expanded state and keyboard activation.
  [W3C Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
- **Performance:** specify whether React Compiler is enabled before discussing
  manual memoization. React documents automatic compiler memoization; an answer
  rubric should avoid treating blanket `useMemo`/`useCallback` use as correctness.
  [React Compiler Introduction](https://react.dev/learn/react-compiler/introduction),
  [useMemo reference](https://react.dev/reference/react/useMemo)

These sources establish technical guidance and employer-described skill areas.
They do not establish React question frequency, prove that one practice format
outperforms another, or validate any prediction of hiring outcomes. The first
slice should be reviewed for clarity and usefulness before expanding it.
