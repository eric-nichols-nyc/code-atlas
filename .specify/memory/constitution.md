# Code Atlas Constitution

## Core Principles

### I. Build from an explicit feature specification

Each substantial feature MUST define the learner or administrator outcome, acceptance
scenarios, scope, dependencies, and unresolved assumptions before implementation. Use one
specification per coherent feature. Record decisions from layout exploration and prototypes
in the relevant specification before production implementation. Small maintenance and
presentation changes MAY use a proportionate scope without a full feature workflow.

### II. Keep application and package boundaries clear

Apps MUST own their routes and runtime setup. Organize substantial functionality in
feature folders that keep its components, state, helpers, and tests together. Keep route
entry points focused on composition. Shared visual primitives belong in the UI package;
Prisma schema and server database access belong in the database package. Extract another
package when consumers need a stable shared interface, and document its dependencies.

Subjects MUST reuse common catalog, lesson, navigation, and progress capabilities through
explicit interfaces. Topic-specific visualizers MAY supply specialized views and state.
Electron lifecycle and native integration MUST remain separate from learning logic.

### III. Enforce identity and authorization on the server

Each protected resource MUST verify its Clerk session and required authorization before
reading or changing protected data. Admin resources MUST enforce the explicit admin policy;
the initial allowlist denies access when empty. Missing credentials MUST deny protected
operations while public pages remain usable. Keep secret keys and database credentials in
server environments, outside version control and distributable desktop bundles.

Electron native capabilities MUST be exposed through narrow, validated interfaces with
isolated, sandboxed rendering. A renderer MUST NOT receive unrestricted Node.js access.

### IV. Validate behavior at the appropriate boundary

Use Vitest for logic, generators, components, and HTTP behavior; use Playwright for learner
and administrator journeys. Changed authentication, authorization, and persistence MUST
cover relevant success and failure paths. Visualization checks MUST verify expected state,
source-line references, and ordering. Interaction checks MUST cover relevant keyboard,
focus, and narrow-layout behavior. Tests MUST demonstrate outcomes or protect contracts.

Before declaring a feature complete, run formatting/lint, type checks, relevant tests, and
the build through the repository's scripts. Record checks blocked by credentials or
infrastructure as unverified. Browser verification does not establish packaged Electron
behavior; desktop features require checks against the desktop runtime.

### V. Add persistence when a feature needs it

Keep authored curriculum, topic metadata, examples, and visualization scenarios separate
from learner progress, bookmarks, and saved work. Content MUST have stable identifiers and
validated references. Keep prose separate from rendering and simulation logic, and select
its storage format in the feature plan. MDX, when selected, is trusted authored content;
untrusted submissions MUST use a defined data format rather than executable MDX.

Define Prisma models from feature requirements. Generate the client after schema changes,
review migrations, and validate them against a Neon development branch before production.
Keep runtime and migration connections configurable. Builds and public starter routes MUST
work before external credentials are supplied. A persistence feature MUST define data
ownership, failure behavior, and the meaning of saved or completed state.

### VI. Make visualization state explicit and execution boundaries honest

Visualizations MUST model teaching steps with explanations, source references, and typed
topic state. Prepared scenarios and generated scenarios MUST use a compatible playback
contract so stepping, reset, backward navigation, and scrubbing remain deterministic.
Document simplifying assumptions and verify supported behavior against authoritative
language references or bounded reference cases.

A code-to-visualization generator MUST declare supported syntax, input and processing
limits, and structured errors. Describe simulated behavior accurately. Any full program
execution capability MUST have a separate feature plan covering isolation and resource
budgets. Learner code MUST NOT execute in privileged Electron or application processes.

### VII. Share accessible interaction patterns across the platform

Compose shared shadcn primitives, semantic theme tokens, and generic components such as
GlobalNav. Product routes, branding, and authorization decisions belong in consumers.
Record reusable visual conventions in the UI registry when patterns change.

Learner controls MUST have accessible names, keyboard operation, visible focus, and
appropriate focus restoration. Explanations and state changes MUST be understandable
without color alone. Playback MUST offer pause and manual stepping; motion MUST respect
reduced-motion preferences. Feature specifications MUST define loading, empty, error,
unsupported-input, and unavailable-service states where applicable.

## Technology and UI constraints

The product is a learning platform targeting the browser and an Electron desktop app.
JavaScript is the first subject; the architecture must accommodate later algorithm
practice and design-system learning without duplicating the platform shell.

The installed baseline is pnpm, Turborepo, TypeScript, Next.js web/admin apps, an Express
API, shared shadcn UI, Clerk authentication scaffolding, Prisma for Neon, Biome, Vitest,
Playwright, and web bundle analysis. Preserve these boundaries unless a feature plan
records the rationale and impact of changing them. Review bundle analysis when adding
significant client dependencies and load specialized editors or visualizers on demand.

MDX authoring, a CodeMirror editor, and an Acorn-based simulator are proposed choices for
future features, not implemented capabilities. Relevant feature plans MUST confirm their
selection and integration. External reference sites provide evidence and design input;
their dependencies, styling, and source organization do not become project requirements.

The following choices remain open: personal versus multi-user scope; offline learning and
synchronization; desktop operating systems and distribution; and repository-based versus
admin-based curriculum authoring. Resolve each in the relevant specification before work
that depends on it. Do not silently assume these product decisions.

## Feature workflow

For substantial features, use `$speckit-specify`, `$speckit-clarify` when needed,
`$speckit-plan`, `$speckit-tasks`, `$speckit-analyze` when needed, and
`$speckit-implement`. Run `$speckit-converge` to assess remaining work against the spec.

Each plan MUST name module ownership, content/state contracts, relevant constitution
principles, and verification criteria. Deliver one complete learner outcome at a time.
Keep specifications and task completion aligned with verified behavior. Record future
capabilities as planned work, with a clear boundary from delivered functionality.

## Governance

Feature plans and reviews MUST check compliance with these principles. Document any
exception in the feature plan with its rationale, scope, and effect on other consumers.
Permanent changes to principles require a constitution amendment that records the reason,
affected specifications, and any migration work. Follow explicit user decisions when
reconciling project guidance.

Use a major version for incompatible principle removals or redefinitions, a minor version
for added principles or materially expanded guidance, and a patch version for wording
clarifications. Preserve the original ratification date and update the amendment date when
content changes. Runtime templates read this constitution directly; maintain the rules
here as their source of truth.

**Version**: 1.1.1 | **Ratified**: 2026-11-07 | **Last Amended**: 2026-11-09
