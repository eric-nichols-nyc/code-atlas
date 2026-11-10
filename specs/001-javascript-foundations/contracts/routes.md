# Route, navigation, and access contract

## User-facing routes

| Route/action                            | Behavior                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| Dashboard Explore JavaScript            | Real navigation to `/learn/javascript`; replace the old topic-preview action                  |
| `/learn/javascript`                     | Protected subject introduction, Start learning, search/topic filter, and flat ordered catalog |
| Start learning                          | Opens the first published lesson, currently `/learn/javascript/scope-and-shadowing`           |
| `/learn/javascript/scope-and-shadowing` | Protected complete lesson and adaptive workspace                                              |
| Other planned/unknown lesson slug       | Authorize first, then show unavailable/not-found with a valid subject return link             |
| All lessons / Lessons drawer            | Use the same catalog and published ordering; no alternate hard-coded list                     |

The review catalog has one available and six planned lessons. A row's planned status is explicit, and there is no usable lesson href. Catalog search and filter affect displayed rows, not the curriculum's global Start learning destination. Counts label available/planned matching entries clearly. Empty catalogs have no Start action; no-result filters can be cleared in one action.

## Guard ordering

Every protected page independently follows:

1. Check authentication configuration; use the existing AuthSetup state if absent.
2. Verify the session with the existing server protection mechanism.
3. Resolve catalog or selected published lesson.
4. Prepare and render the authorized result.

Do not rely solely on a persistent shared layout or client hooks. The proxy still initializes Clerk and already matches these routes. Preserve current sign-in/sign-up completion at the dashboard; returning directly to a prior lesson after sign-in is not added here.

Use static generic route metadata. Do not preload protected prose for metadata, loading screens, or an anonymous static export. Authorization decisions are request-scoped; never globally cache an authorized user result. Pure authored tokens/module imports may be reused without caching a user's access decision.

## Loading and error states

- Loading: shared skeleton/context without importing or revealing unauthorized lesson prose.
- Missing/unpublished slug: local not-found state and catalog link after access verification.
- Content load failure: readable error and retry/return action.
- Empty catalog: useful unavailable message and no invalid Start destination.
- No filter matches: keep search and topic controls, show clear-filters action.
- Optional activity failure: local fallback while prose remains readable.
- Tutor/Notes: Coming soon state, no working-looking send/save controls.
- Session expiry: subsequent protected requests fail through the existing sign-in flow; initial visibility is not authorization for later operations.

## External service interfaces

This slice adds no public HTTP API, Server Action, database endpoint, or AI call. Existing Clerk access is reused. Correct answers and prepared snapshots are authorized lesson data, not hidden server grading outcomes. There is no production testing bypass, test-only route, or exported browser session.

## Test obligations

Mock access and loaders at the route boundary to prove no loader call occurs before configuration/session success. Test unknown and unpublished slugs after successful access, selected-only import, and safe error metadata. Keep the existing credentials-pending Playwright suite; prove the actual signed-in journey separately as described in quickstart.md.
