# Code Atlas Constitution

## Core Principles

### I. Build from an explicit feature specification

Each substantial feature MUST define its user outcome, scope, acceptance checks, dependencies,
and unresolved assumptions in one concise feature brief before implementation. Deliver one
complete working slice for review before expanding content or capabilities. Record consequential
layout and architecture decisions in that brief; ordinary layout, copy, and maintenance changes
MAY go directly to code with proportionate verification.

The default process MUST support direct iteration from browser feedback. A feature brief is a
specification; generating a full Spec Kit document set is optional unless explicitly requested.
Keep the brief current rather than adding a new document set for each revision.

### II. Keep application and package boundaries clear

Apps MUST own routes, authentication boundaries, and runtime setup. Route entry points compose
features; substantial features keep their components, state/hooks, helpers, and colocated tests
in feature folders. Shared shadcn primitives and semantic theme tokens belong in `packages/ui`.
Prisma schema and server database access belong in `packages/db`.

Public problem contracts and definitions belong in `packages/problems` for browser and server
consumers. Hidden test inputs, judging policy and execution workers MUST remain in feature-owned
Next.js server modules. Privileged entry modules MUST use `server-only`; worker assets MUST stay
in the server output and retain their isolated native Node execution boundary.
Trusted authored prose belongs in subject content folders, separate from rendering and execution.
Extract additional packages only when real consumers need a stable shared interface.

Subjects MUST reuse common catalog, workspace, and navigation capabilities through explicit
interfaces. Add progress or other shared capabilities when required by a feature. Future Electron
lifecycle and native integration MUST remain separate from learning and practice logic.

### III. Enforce identity and authorization on the server

Every protected page, Route Handler, Server Action, and API resource MUST verify its own Neon Auth
session and required authorization before accessing protected data or executing learner code.
The Next.js proxy handles Neon Auth cookies and redirects; it does not replace resource-level authorization. API endpoints
MUST use App Router Route Handlers under `apps/web/src/app/api`. Protected handlers MUST verify
Neon Auth identity through the shared server boundary, validate origins and payloads, and call
feature-owned server services directly. Ownership MUST come from verified identity, not client input.

Future administrative resources MUST enforce server-side admin authorization with default denial.
Public setup or navigation pages MUST NOT expose administrative data. Missing credentials MUST
deny protected operations while public pages and credential-independent builds remain usable.
Prisma imports MUST stay in server code; call `getDb()` at request time after authentication and
required authorization. Keep real credentials in ignored environment files or deployment secrets;
track only empty credential examples.

Future Electron native capabilities MUST use narrow, validated interfaces with isolated,
sandboxed rendering. Renderers MUST NOT receive unrestricted Node.js access or server secrets.

### IV. Validate behavior at the appropriate boundary

Use Vitest for logic, components, and HTTP behavior; use Playwright for browser journeys.
Tests MUST demonstrate user outcomes or protect meaningful contracts. Changes to authentication,
authorization, persistence, or execution MUST cover relevant success and failure paths.
Interaction checks MUST cover relevant keyboard, focus, and narrow-layout behavior. Future
visualization checks MUST verify expected state, source references, and ordering.

Before declaring a feature complete, run formatting/lint, type checks, relevant tests, and the
build through repository scripts. Use proportionate checks for documentation and small
presentation changes. Review changed UI in the browser while preserving the user's drafts and
running work. Credential-free smoke tests, manual signed-in review, and authenticated automation
MUST be reported separately. Record checks blocked by credentials or infrastructure as unverified;
use a dedicated development identity for authenticated automation.

Browser verification does not establish packaged Electron behavior. Desktop features require
checks against the desktop runtime.

### V. Add persistence when a feature needs it

Keep authored content and catalog metadata separate from learner submissions, progress, bookmarks,
and notes. Content MUST have stable identifiers and validated references. Use trusted MDX for
current problem prose and typed definitions for executable contracts, samples, and metadata.
Untrusted learner input MUST NOT be compiled as MDX or application code.

Distinguish in-memory problem state, browser preferences, and account-backed persistence in both
UI copy and documentation. A successful Run or Submit is a judge result, not proof of saved
progress. Do not claim drafts, submissions, or notes are saved to an account before persistence
exists. A persistence feature MUST define ownership, recovery/failure behavior, and the meaning
of saved or completed state.

Define Prisma models from actual feature requirements. Generate the client after schema changes,
review migrations, and validate them against a Neon development branch before production.
Keep runtime and migration connections configurable. Builds and public starter routes MUST work
before database credentials are supplied.

### VI. Keep execution isolated and results honest

Run MUST evaluate the learner's current source against visible editable cases. Submit MUST use
the complete server-selected suite, independent of client-provided expectations or hidden cases.
Return real verdicts, bounded diagnostics, and explicit failures. Private test values and logs
MUST NOT leak through public definitions, browser payloads, or hidden-case diagnostics.

Learner code MUST execute inside a disposable isolated guest with explicit memory, stack, CPU,
wall-time, input/output, and concurrency limits. It MUST NOT execute in privileged application
or Electron processes or receive unrestricted host, filesystem, module, DOM, or network access.
The current adapter is bounded single-file JavaScript in QuickJS WebAssembly inside a Node Worker.
New languages, host capabilities, or execution adapters MUST document their isolation contract
and resource budgets in the feature brief before implementation.

Associate results with the source and inputs that produced them. Mark results stale after relevant
edits, preserve current source on failures, and prevent overlapping UI executions. Prepared
visualizations MUST NOT stand in for execution or judging. If added later, visualizations MUST
have typed teaching state, explanations, source references, deterministic forward/backward/reset
and scrubbing behavior, and documented assumptions. Prepared and generated scenarios MUST share
a compatible playback contract. Generators MUST declare supported syntax, processing limits,
and structured errors; verify supported behavior against authoritative references or bounded cases.

### VII. Share accessible interaction patterns across the platform

Compose shared shadcn primitives, semantic theme tokens, and generic components such as GlobalNav.
Product routes, branding, feature state, and authorization decisions belong in consumers.
Read `ui-registry.md` before UI work and update reusable visual conventions when patterns change.
Keep detailed layout and control placement in the registry and feature brief.

Controls MUST have accessible names, keyboard operation, visible focus, and appropriate focus
restoration. State MUST be understandable without color alone. Icons MUST open the tool or tab
they identify; unavailable actions MUST be clearly marked or disabled. Responsive layout changes,
panel toggles, and theme changes MUST preserve the current problem's source, editor state, inputs,
help expansion, and results unless an explicit reset or navigation discards them.

Support narrow screens without document-level horizontal overflow; contain code overflow within
its panel. Motion MUST respect reduced-motion preferences. Future playback MUST offer pause and
manual stepping. Define loading, empty, error, unsupported-input, and unavailable-service states
where applicable.

## Technology and UI constraints

Code Atlas targets the web and a future Electron app. JavaScript is the first subject and
Practice is the current delivery focus. `/javascript/practice` owns the catalog and
`/javascript/practice/<problem>` owns a coding workspace. `/javascript/learn` is a separate future
learning experience; its requirements remain open. Later subjects include Algorithms and React JS.
Do not treat a practice problem as a guided lesson or require visualization to judge a solution.

The installed baseline is pnpm, Turborepo, TypeScript, one Next.js application with App Router APIs,
shared shadcn UI, Neon Auth, CodeMirror, QuickJS, trusted MDX, Prisma for Neon, Biome, Vitest,
Playwright, and web bundle analysis. There is currently no admin or Electron app. Preserve the
application/package boundaries unless a feature brief records the rationale and impact of a change.
Review bundle analysis for significant client dependencies and load specialized editors on demand.

Sleep, Counter, Debounce, Filter Elements from Array and Fibonacci Generator are published practice problems. Account
flags, solved status and latest Run/Submit source persist in Neon. Additional problems, connected
AI tutoring, saved notes, individual submission history and desktop delivery require working slices.
External reference sites provide interaction evidence and design input; their dependencies,
styles, and source organization do not become project requirements.

Resolve personal versus multi-user scope, offline operation/synchronization, desktop distribution,
and repository versus future administrative content publishing in the relevant feature brief
before dependent work. Do not silently assume these product decisions.

## Feature workflow

Use `.agents/skills/feature-workflow/SKILL.md` by default: one short brief in `docs/features/`,
consistent feature folders, one working slice, browser review, and relevant checks. A brief MUST
state the outcome, included and deferred scope, observable acceptance checks, a short implementation
checklist, actual verification results, and material limitations. Add design detail when an
execution, authentication, persistence, or other architecture decision needs it.

Implement small maintenance and presentation changes directly. Iterate the existing slice and
brief during review without regenerating plans or requiring a new approval cycle for routine
implementation choices. Follow explicit user direction for scope and workflow.

Spec Kit remains available when explicitly requested. Existing `specs/` artifacts are historical
unless selected for further work; they MUST NOT override newer accepted behavior. Keep README
focused on startup, current capabilities, ownership, and checks. Keep detailed UI conventions in
`ui-registry.md` and feature decisions in the brief. Documentation MUST distinguish delivered
behavior from future work. No workflow change relaxes authorization, isolation, or honest validation.

## Governance

Feature work and reviews MUST check compliance with these principles. Record exceptions in the
feature brief with rationale, scope, and effects on consumers. Permanent principle changes require
an amendment describing the reason, affected guidance/specifications, and any migration work.
Explicit user decisions take precedence when reconciling project guidance.

Use a major version for incompatible principle removals or redefinitions, a minor version for
added principles or materially expanded guidance, and a patch version for wording clarifications.
Preserve the original ratification date and update the amendment date when content changes.
Runtime templates read this constitution directly; keep governance here as their source of truth.

Amendment 2.2.0 consolidates the Express application into Next.js App Router APIs. The user-approved
refactor changes deployment and request boundaries while preserving server authorization, ownership,
private test handling and worker isolation. See `docs/features/nextjs-api.md` for migration and checks.

Amendment 2.2.1 refreshes the published problem inventory after adding generator practice;
the execution, authorization and persistence principles are unchanged.

Amendment 2.3.0 replaces Clerk with Neon Managed Better Auth at the user's request.
Verified Neon sessions own application progress through unique `neonUserId` records.
The development cutover starts fresh on an isolated database branch; email matching and
automatic imports from the old identity are excluded. Server authorization and judging isolation remain mandatory.

**Version**: 2.3.0 | **Ratified**: 2026-11-07 | **Last Amended**: 2026-11-11
