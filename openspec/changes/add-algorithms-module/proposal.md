# Proposal

## Why

Algorithms appears on the dashboard but is unavailable. Learners should be able to enter it through the same Learn and Practice experience as JavaScript, starting with the existing Two Pointers lesson and one working anagram challenge.

## What Changes

- Enable Explore Algorithms on the dashboard. Add `/algorithms` with a redirect to `/algorithms/practice`, subject-specific Learn/Practice navigation, and the existing loading, error, setup, and not-found patterns.
- Add `/algorithms/learn` and `/algorithms/learn/two-pointers`. Copy the current JavaScript Two Pointers content, diagrams, links, example, and guided walkthrough into Algorithms-owned content; retain its preview status and current controls.
- Add `/algorithms/practice` with one recommended Easy problem, **Valid Anagram**, in the Two Pointers category, and a workspace at `/algorithms/practice/valid-anagram`.
- Define `isAnagram(s, t)` returning a boolean. Supply editable string cases, starter code, examples, constraints, hints, and a sorting plus two-pointer reference solution with accurate complexity.
- Use the existing isolated JavaScript judge, account progress, saved code, notes, and tutor behavior for the Algorithms problem. Run uses edited visible cases; Submit selects the private server suite.
- Reuse catalog, preview, and workspace components through explicit subject inputs. Keep existing JavaScript routes and learner records working.

The first slice contains this single lesson and problem. Additional algorithms, languages, lesson completion, new runtime visualization features, database redesign, and changes to Electron packaging are outside this change.

## Capabilities

### New Capabilities

- `algorithms-learning`: Algorithms discovery, subject navigation, and the copied Two Pointers learning preview.
- `algorithms-practice`: The Algorithms practice catalog and complete Valid Anagram coding journey, including judging and existing account tools.

### Modified Capabilities

None. The main `openspec/specs/` inventory is empty. Existing JavaScript learning and walkthrough changes are compatibility references; their delivered behavior is preserved.

## Impact

- Web dashboard, subject navigation, Algorithms route entries, and reusable catalog/learning/workspace inputs.
- New trusted content under `apps/web/src/content/algorithms/{learn,practice}` and a public definition in `packages/problems`.
- String input and boolean output contracts, draft parsing, testcase/result presentation, the server worker adapter/private suites, and content validation.
- Tutor publication lookup, subject-specific statement loading, and production file tracing. Existing APIs continue to authorize by verified learner identity and stable problem ID; no new API family or database migration is expected.
- Implementation will create the required short feature brief and update delivered-capability documentation, UI registry, and relevant tests. No new dependency is expected.
