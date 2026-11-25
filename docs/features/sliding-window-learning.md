# Sliding Window Learn module

Learners can open Sliding Window from Arrays in JavaScript Learn or Algorithms
Learn. Both routes use the same lesson and keep their own catalog identity and
authenticated navigation. The worked example scans `[1, 3, 2, 5, 4, 7]` with a
window of three values. [AlgoMaster introduction](https://algomaster.io/learn/dsa/sliding-window-introduction)

- Step through the initial window, three slides, and a return value of `16`.
  Show the active range, the outgoing and incoming values, the running sum,
  and the best sum. Keep each snapshot aligned with its JavaScript lines.
- Walk through the JavaScript independently. Explain the rolling sum, the
  separate best sum, and when variable-size windows advance each boundary.
- Reuse the Two Pointers trace controls and reading layout. Check Previous,
  Next, Restart, keyboard scrubbing, themes, reload, and 320px width. Each
  reader has independent state for the current visit.

Deliver one fixed-size visual trace and a variable-size example in the lesson
text. Learner inputs and a separate variable-size trace are possible follow-ups.

- [x] Publish the shared content and register both subject routes.
- [x] Connect the prepared trace and the existing walkthrough.
- [x] Check content, source alignment, and both signed-in browser journeys.

Lint, typecheck, content validation, the web production build, and all 802
Vitest tests passed. The signed-in Chromium run passed eight lesson journeys
and learner sign-in. It verified both Sliding Window routes and repeated the
Two Pointers checks after the shared controls changed. The Sliding Window
checks exercised all five trace states, four themes, and the 320px layout.

## Pattern selection, window state, and quiz

After the walkthrough, readers can identify when a sliding window fits, compare
four window strategies, and choose state for seven common problems. The lesson
explains why a decreasing deque supports a linear sliding maximum and why an
exact sum with mixed signs calls for prefix sums and a map.

- [x] Show both reference tables and the technique limits at desktop and 320px.
- [x] Offer ten original multiple-choice questions with feedback, progress,
  previous and next navigation, expanded view, scoring, and restart. Keep
  answers for the current visit and preserve them between inline and expanded views.
- [x] Check both signed-in lesson routes, keyboard navigation, and narrow layouts.

Lint, typecheck, content validation, the web production build, and all 802
Vitest tests passed. Four signed-in Playwright checks covered both routes and
a full quiz attempt, including focus restoration, scoring, restart, and reload.
Reviewed quiz screenshots at desktop and 320px and opened the local quiz in the
in-app browser.
