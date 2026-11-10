# Content and rendering contract

## Ownership

- `content/javascript/catalog.ts`: ordered metadata for published and planned entries; no MDX/UI imports.
- `content/javascript/scope-and-shadowing/definition.ts`: typed composition of the one published lesson.
- `lesson.mdx`: trusted prose and prerequisite primer through shared element mappings; concise takeaway bullets live in the typed definition.
- `example.ts`, `exercise.ts`, `scenario.ts`: canonical source and declarative activity data.
- `features/learning/lib`: pure TypeScript types, validation, order/filter helpers.
- `features/learning/server`: server-only body registry, authorized loader integration, and tokenization adapter.
- `features/javascript/scope-shadowing`: the subject adapter, scope-specific state validator, and visual renderer. The adapter supplies a visualization slot to the generic learning shell; generic learning modules do not import subject renderers.

Do not import content loaders, MDX modules, Shiki, credentials, or filesystem utilities from a client-marked module. Do not evaluate learner input as MDX or JavaScript.

## Registry resolution

The server registry uses known keys and literal import functions for published MDX. The catalog slug is matched to an allowlisted published definition after the route's access check; it is never interpolated into a file path or module import.

A typed published-body key contract and pure registration list keep metadata and loader coverage aligned. Content checking validates cross-references; type/build checking verifies the actual registered importer exists and compiles. Planned entries have no published body identity. A fixture used by tests is never registered in the production map.

## Loader output

The lesson route receives a server-side prepared result containing:

1. Safe lesson metadata and objective.
2. Rendered MDX prose as server children and concise takeaway bullets as typed data.
3. Minimal serializable example tokens, checkpoint definition, and optional scenario data.
4. Adjacent published lesson destinations and catalog return destination.

Pass server children into the shared client layout by composition; do not serialize an MDX component function or importer. Only the selected published lesson is prepared. Error UI and generic page metadata must not trigger a protected body import before the access check.

## Validation command

Planned command: `pnpm --filter @workspace/web content:check`, implemented as a tsx-run script. It exits nonzero and prints file/identity-oriented diagnostics for invalid authored data without secrets. Web build invokes it before Next build. The same pure validator is exercised in Node-environment Vitest tests.

Validation covers unique IDs/slugs/order, one intended published lesson, valid topics, published body registration, complete lesson/activity references, exercise option/correct-answer integrity, scenario/source identity, line bounds, scope/binding validity, and nonempty complete snapshots. Next compilation verifies MDX syntax and imports. Do not claim the pure validator parses all MDX JavaScript or provides an untrusted-code sandbox.

## Code display

Tokenize the exact source once on the server using the cached narrow Shiki adapter. Serialize only line/token DTO fields used by rendering. The token renderer preserves whitespace, blank lines, and 1-based line numbering and switches syntax color variables with the existing root theme class. Code surface, border, focus, and active-line styling stay on shared semantic roles.

Copy uses the unchanged canonical source, not text scraped from highlighted DOM. Success/failure is announced without stealing focus. A prepared walkthrough always shows its authored source; there is no editable-code execution claim or enabled Run/Submit control.

## Optional capabilities and failures

Lesson composition declares available example, exercise, and visualization references. Omit unsupported controls and empty panels. A missing optional visualization gets local recovery/unavailable UI without removing the lesson text or checkpoint. A missing required published definition is a content error, not a partially assembled lesson.

A checkpoint's correct answer is client-readable formative content. Do not represent that interaction as protected judging, a saved grade, or synchronized course completion.

## Extension seam

A future lesson adds metadata, body, and declared activities to the same contracts. A future generated trace must produce a compatible sequence of steps and validated subject state. A future editor is a separate capability with its own execution boundary; this contract does not provide one.
