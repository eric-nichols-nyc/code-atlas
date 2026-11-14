# Development guide

Setup, architecture boundaries, content authoring, testing, and deployment notes for contributors.
Start with the [README quick start](../README.md#quick-start).

## Application routes and behavior

| Route                                                       | Behavior                                                                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/`                                                         | Public landing page with an interactive Counter example and published JavaScript problems                       |
| `/dashboard`                                                | Protected subject picker; JavaScript is available, Algorithms and React JS are coming soon                      |
| `/javascript`                                               | Redirects to JavaScript Practice                                                                                |
| `/javascript/practice`                                      | Searchable table with Recommended, Closures, Arrays, Generators and Async categories, plus difficulty filtering |
| `/javascript/practice/sleep`                                | Protected coding workspace with real Run/Submit                                                                 |
| `/javascript/practice/counter`                              | Protected Counter workspace with editable start/call count and real Run/Submit                                  |
| `/javascript/practice/curry`                                | Medium Closures workspace with supplied callbacks, editable argument groups, and isolated Run/Submit            |
| `/javascript/practice/debounce`                             | Medium Async problem with a deterministic timer judge                                                           |
| `/javascript/practice/delay-the-resolution-of-each-promise` | Medium Async problem with editable Promise descriptors and deterministic fulfillment timing                     |
| `/javascript/practice/filter-elements-from-array`           | Easy Arrays problem with editable array/callback cases                                                          |
| `/javascript/practice/map-array`                            | Easy Arrays problem with supplied transforms, original indices and a new output array                           |
| `/javascript/practice/reduce-array`                         | Easy Arrays problem with a supplied reducer, editable init and accumulator-order judging                        |
| `/javascript/practice/chunk-array`                          | Easy Arrays problem with editable group size and non-mutating nested-array output                               |
| `/javascript/practice/function-composition`                 | Easy Closures problem with ordered function names, editable x and reusable right-to-left composition            |
| `/javascript/practice/memoize`                              | Medium Closures problem with editable call sequences, cached values and underlying callback counts              |
| `/javascript/practice/flatten-nested-array`                 | Medium Arrays problem with editable nested JSON and isolated traversal judging                                  |
| `/javascript/practice/fibonacci-generator`                  | Easy Generators problem with an editable count and isolated iterator judging                                    |
| `/javascript/learn`                                         | Protected coming-soon page; Learn requirements are deferred                                                     |
| `/sign-in`, `/sign-up`                                      | Neon Auth catch-all authentication routes; completed authentication redirects to Dashboard                      |

JavaScript catalog and Learn pages use centered Learn/Practice navigation, with Dashboard beside
Code Atlas for returning to the subject picker. Learn/Practice have book/code icons and text-only hover states. Individual problem pages use a focused workspace
with Back to Practice and AI/Notes icons. Each icon opens its corresponding tab; clicking the active
icon closes the tools panel. Legacy `/learn/javascript` URLs redirect to Practice.

The public landing page uses standalone Code Atlas hero branding and no global navigation.
Its white Start practicing button opens Dashboard for a verified signed-in learner or Sign in
for other visitors. A staggered CSS entrance respects reduced-motion preferences.
Below the hero, a fixed interactive closure example has selectable starting
values, recent return values and reset. It works without signing in and does not evaluate learner code or
write progress. Its problem links and counts come from the existing catalog. See the
[landing-page feature brief](../docs/features/dynamic-landing-page.md) for scope and reference evidence.

The workspace provides:

- A continuous description with examples, constraints, individual hint accordions, and Solution last.
- A local CodeMirror JavaScript editor with Reset code, theme, and disabled Share icons in its header.
- Run and Submit below the editor; Testcase and Test Result beneath that.
- Resizable description/editor/tools columns and an editor/results split. Closing tools releases space.
- Flag toggles and solved indicators in the table. Records belong to the verified Neon Auth user and persist across sessions/devices. Older browser completions are retained separately as unverified history.
- A narrow-screen reading layout with a tools drawer. Source, editor state, inputs, expanded help,
  and results survive responsive changes.
- Category icons use distinct theme colors. Difficulty labels use green for Easy, amber for Medium, and red for Hard.
- Light, Dark, and System themes; the initial theme is dark and the preference persists in the browser.

AI tutoring provides question-triggered hints using the latest code and public problem context.
Chat lasts for the current visit; see [AI tutor setup](#ai-tutor). Notes supports private formatted documents,
explicit account saves, and drafts that survive workspace tool/layout changes. The workspace has no visualization,
Submissions view, Problems button, or Reset layout action. An accepted Submit records account-backed solved status; submission history remains future work.

## Environment and authentication

Copy the relevant example only if its local destination does not already exist. Keep real keys
in ignored environment files; committed examples contain empty credential values.

| Example                    | Local destination     | Purpose                                                         |
| -------------------------- | --------------------- | --------------------------------------------------------------- |
| `apps/web/.env.example`    | `apps/web/.env.local` | Neon Auth URL/cookie secret and server-only database connection |
| `packages/db/.env.example` | `packages/db/.env`    | Prisma CLI pooled/direct connections for migrations             |

1. Enable Neon Managed Better Auth on an isolated Neon development branch.
2. Set server-only `NEON_AUTH_BASE_URL` to that branch's Auth URL.
3. Generate `NEON_AUTH_COOKIE_SECRET` with `openssl rand -base64 32` (minimum 32 characters).
4. Set `DATABASE_URL` for the same branch in `apps/web/.env.local`; configure the database package separately for migrations.
5. Restart Next.js after environment changes. Keep localhost allowed in the branch's Auth configuration.

The Next.js proxy uses the official Neon Auth SDK for session cookies, OAuth and redirects. Every protected page and Route Handler verifies its own session
before accessing data or executing code. API handlers also reject foreign request origins and bound
payload sizes. Sign-in/sign-up redirect to Dashboard and sign-out returns home. Judging needs no
external judge key. Missing auth configuration returns 503 and a missing session returns 401.

Next.js and Prisma load their own local environment files. A database package `.env` does not configure
Next.js. Only public configuration belongs in `NEXT_PUBLIC_` variables. Keep server secrets out of
browser and Electron bundles. Next Route Handlers call server services directly, without a
second application, token-forwarding origin or CORS configuration.

## Commands

Root `package.json` is the source of truth for scripts.

| Command                                       | Purpose                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`                                    | Build shared dependencies/worker and run Next.js development                 |
| `pnpm build` / `pnpm start`                   | Build all workspaces / start production servers after building               |
| `pnpm lint` / `pnpm lint:fix`                 | Biome checks / safe fixes                                                    |
| `pnpm format`                                 | Format supported files                                                       |
| `pnpm typecheck`                              | Root and workspace TypeScript checks                                         |
| `pnpm test` / `pnpm test:watch`               | Build shared packages/worker and run Vitest / watch                          |
| `pnpm test:coverage`                          | Build shared packages/worker and run Vitest coverage                         |
| `pnpm test:e2e` / `pnpm test:e2e:ui`          | Credential-free production Playwright smoke tests / test UI                  |
| `pnpm test:e2e:auth`                          | Optional authenticated suite with a dedicated Neon Auth development identity |
| `pnpm test:e2e:desktop:auth`                  | Authenticated Electron Run/Submit, full quit and account restore             |
| `pnpm --filter @workspace/web content:check`  | Validate the current practice catalog and public definitions                 |
| `pnpm --filter @workspace/web worker:build`   | Compile the isolated worker/adapters to ignored `.workers/`                  |
| `pnpm analyze`                                | Webpack bundle-analysis build for the web app                                |
| `pnpm db:generate`                            | Generate Prisma Client without connecting to a database                      |
| `pnpm db:migrate --name <name>`               | Create/apply a development migration once models and credentials exist       |
| `pnpm db:deploy` / `pnpm db:studio`           | Apply committed migrations / open Prisma Studio                              |
| `pnpm specify version` / `pnpm specify check` | Inspect the optional pinned Spec Kit CLI and available tools                 |
| `pnpm desktop:dev`                            | Start/reuse the local web server and open Electron                           |
| `pnpm desktop:build` / `pnpm desktop:start`   | Compile desktop TypeScript / open against an already running server          |
| `pnpm desktop:package:local`                  | Package an unsigned local-server app for this OS/architecture                |
| `pnpm desktop:package`                        | Package for the configured hosted HTTPS origin                               |
| `pnpm desktop:smoke`                          | Native renderer, navigation, session and connection-retry checks             |

## Where the code lives

A short ownership map replaces a full directory tree. Keep feature details in their brief and code.

| Location                                                        | Owns                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Web routes](../apps/web/src/app)                               | Next.js pages, layouts, and authenticated web API adapters               |
| [Desktop app](../apps/desktop)                                  | Electron lifecycle, session, navigation policy and packaging             |
| [Web features](../apps/web/src/features)                        | Landing, catalog, dashboard, problem behavior/state and workspace layout |
| [JavaScript content](../apps/web/src/content/javascript)        | Practice catalog and trusted problem MDX                                 |
| [Problem server code](../apps/web/src/features/problems/server) | Private suites, execution policy and isolated worker                     |
| [Account server code](../apps/web/src/features/catalog/server)  | Authenticated progress, executed-source persistence and private notes    |
| [Server boundary](../apps/web/src/server)                       | Shared session, origin and request validation                            |
| [Public problem package](../packages/problems/src)              | Shared problem definitions and execution contracts                       |
| [Shared UI](../packages/ui/src)                                 | shadcn primitives, generic navigation, icons, and theme                  |
| [Database package](../packages/db)                              | Prisma schema, generation, and lazy server-only client                   |
| [Browser tests](../tests)                                       | Smoke and optional authenticated Playwright journeys                     |
| [Feature briefs](../docs/features)                              | Scope, acceptance checks, decisions, and verified outcomes               |

[AGENTS.md](../AGENTS.md) contains agent conventions, [ui-registry.md](../ui-registry.md) records UI
patterns, and the [constitution](../.specify/memory/constitution.md) defines durable project principles.
Generated dependencies/builds, reports, credentials, and local `work/`/`outputs/` artifacts are ignored.

## Feature workflow

Use the project-local [feature-workflow skill](../.agents/skills/feature-workflow/SKILL.md):

1. Write or update one short brief in `docs/features/`: outcome, included/deferred scope, observable
   acceptance checks, implementation checklist, and open decisions.
2. Build one complete working slice using existing feature folders and shared UI.
3. Review it in the browser, then iterate directly from feedback while preserving the user's work.
4. Run relevant checks and record actual verification results and limitations in the same brief.

Small fixes and layout changes go straight to code. Expand the brief when execution, authentication,
persistence, or another architecture decision needs detail. Spec Kit is installed but optional;
use its formal workflow when requested. Existing `specs/` artifacts remain historical unless selected
for further work. See the [JavaScript practice](../docs/features/javascript-coding-problems.md),
[database users](../docs/features/database-users.md), [landing page](../docs/features/dynamic-landing-page.md),
and [Next.js API consolidation](../docs/features/nextjs-api.md) briefs.

## Authoring practice problems

Current content ownership is deliberate:

- Public problem definitions, starter source, samples, constraints, hints and solutions:
  [problem modules](../packages/problems/src/problems). Shared types are in
  [types.ts](../packages/problems/src/types.ts); [index.ts](../packages/problems/src/index.ts) exposes the public registry and validation helpers.
- Trusted authored prose: each problem's `problem.mdx` under
  [practice content](../apps/web/src/content/javascript/practice). Explicit lazy statement loaders
  live in [statements.ts](../apps/web/src/content/javascript/practice/statements.ts). Learners never author executable MDX.
- Listing metadata such as topic, recommendation, difficulty, and ordering:
  [practice catalog](../apps/web/src/content/javascript/practice/catalog.ts).
- Hidden inputs and judging: [server execution](../apps/web/src/features/problems/server). Hidden inputs and logs must
  stay out of public definitions and browser payloads.

`features/problems` owns the editable CodeMirror adapter, problem session, description, and results.
`features/learning` currently owns the reusable adaptive layout and tools panel; its name does not
make the current practice experience a guided Learn lesson.

All thirteen published problems have separate server-owned judging contracts.
Register new definitions, catalog entries, trusted MDX loaders and a matching private test suite/adapter;
the content validator checks that the published catalog agrees with those public definitions.
Adding MDX alone does not create a runnable problem.
The [generator feature brief](../docs/features/javascript-generator.md) documents the bounded
Fibonacci iterator contract and verification.
Future Learn content is a separate feature. Reuse the shared workspace where its interaction fits.

## API and execution

| Next Route Handler                        | Access and behavior                                              |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `GET /api/health`                         | Public service health                                            |
| `GET /api/me`                             | Verified Neon Auth identity                                      |
| `GET /api/practice-progress`              | Current learner's flags, solved status and legacy history        |
| `GET /api/practice-progress/:problemId`   | Current learner's saved source and problem progress              |
| `PATCH /api/practice-progress/:problemId` | Change the current learner's flag only                           |
| `POST /api/practice-progress/import`      | Idempotent import of browser flags and unverified legacy history |
| `POST /api/problems/:problemId/run`       | Execute visible cases                                            |
| `POST /api/problems/:problemId/submit`    | Execute the server-selected suite                                |
| `GET /api/problems/:problemId/notes`      | Read the current learner's private note, or an empty document    |
| `PUT /api/problems/:problemId/notes`      | Explicitly replace the current learner's private note            |

Routes live in `apps/web/src/app/api/**/route.ts` and use the Node.js runtime. Thin handlers compose
feature-owned server code, which verifies Neon Auth identity before execution or database access.
Server services use `server-only` boundaries. UI code uses the same-origin `/api` URLs.

Personal notes use `{ content, updatedAt }` responses. `content` is
`{ formatVersion: 1, document: { ops: [{ insert: "\n" }] } }` for a blank note;
`updatedAt` is null when no saved note exists, or a server ISO timestamp after saving.
PUT accepts only `{ content }`, with a complete insert-only formatted document.
The server derives the owner from the verified Neon session, resolves the canonical
published problem ID, validates request origin and content before database access,
and returns `Cache-Control: no-store` on handled successes and failures.
Content is limited to 65,536 serialized UTF-8 bytes and 4,096 operations; the streamed
JSON request limit is 512 KiB. Links must be absolute HTTP/HTTPS URLs. Media, raw HTML
structures, unsupported formats, and owner fields are rejected. Empty saves replace
the prior document; they do not alter progress, flags, or executed code.
Authentication/origin/problem/input/size/storage failures use 401/403/404/400/413/503.
Notes use explicit Save and last successful database write wins across devices;
there is no background synchronization or conflict merge. Unsaved edits remain
only in the current problem session. See the [notes brief](features/personal-problem-notes.md).

The execution service runs QuickJS WebAssembly inside a disposable Node Worker. Guest memory, stack, CPU, timers,
console output, concurrency, and wall time are bounded. Learner code has no Node module, filesystem,
DOM, or network access. The adapters support single-file JavaScript for these thirteen problems, not a general Node runtime.
Sleep measures elapsed time. Counter checks returned numeric sequences and independent closure state;
its editable `calls` field is the number of invocations. Debounce runs guest timers on a deterministic
clock with documented same-time ordering. Filter supplies a selectable callback, checks truthy
results and original indices, and disables the guest Array.prototype.filter built-in.
Fibonacci Generator advances synchronous iterable iterators for an editable count (0–50)
and checks independent state. The generator itself takes no arguments.
Delay the Resolution of Each Promise checks wrapper creation, immediate original invocation,
preserved values/order and an extra fulfillment delay on the same deterministic clock. See its
[feature brief](../docs/features/delay-each-promise.md) for the original exercise and research sources.
Curry collects grouped arguments, checks reusable partial functions and zero-arity
callbacks, and returns a numeric result. See its [feature brief](features/javascript-curry.md).
Flatten Nested Array traverses every array level while preserving order, duplicates,
zero and input contents; `flat` and `flatMap` are disabled. See its
[feature brief](features/javascript-flatten-nested-array.md).
Map Array collects one supplied callback result per element and disables the guest `map`
built-in. Reduce Array threads `init` through the reducer, checks callback invocation order/count,
and disables `reduce`/`reduceRight`. Chunk Array preserves input while producing independent group
arrays. Function Composition checks right-to-left order, identity and reusable closures. Memoize
checks returned values and underlying callback `callCount`, including cached zero and distinct
ordered argument lists. These five additions reuse the existing runtime and account data model;
they introduce no authentication, database or layout changes. See the
[practice expansion brief](features/javascript-practice-expansion.md) and
[primary-source research](features/javascript-practice-research.md).
Hidden inputs, outputs and logs remain private.

Run uses editable visible cases; Submit ignores client-supplied cases and uses the full private suite.
Test Result shows the latest real verdict. Editing relevant source/inputs marks a result stale;
failures preserve the current code. The Route Handler saves latest source after every valid Run/Submit request, including wrong/error verdicts.
An accepted Submit sets solvedAt once; Run and later failed submissions do not set or clear it.
Code writes use server request timestamps so an older result cannot replace a newer source.
There is no individual submission-history service. Browser records are kept as backups; old solved
entries import as unverified legacy history, never as server-verified completion. Database failures
leave judging usable with an explicit unsaved status and a per-learner browser code backup.

## Database

Prisma 7 and the Neon adapter live in packages/db. User links an internal ID to a unique
`neonUserId`. PracticeProgress has one row per user/problem, with flagged, solvedAt, lastCode,
codeUpdatedAt, legacyCompleted, and timestamps. Users are created lazily from the server-verified
Neon Auth session on their first practice-data request. Neon Managed Better Auth owns passwords
and sessions in its managed `neon_auth` schema; Prisma owns only application tables. Do not add
Prisma auth tables or a self-hosted Better Auth server. Problem content and private suites remain
in files. Only Next server modules import Prisma; clients use authenticated Route Handlers.

The migration renames the old identity column/index to `neonUserId`. For this development cutover,
the user approved clearing the old app user and progress on the isolated `feature/neon-auth`
database branch before applying it. No accounts are linked by email. Provider-qualified browser
keys (`neon:<userId>`) keep old local backups separate. Parent branches remain untouched.
Sign up again through Neon Auth. This does not delete the hosted Clerk account or service.

Email/password and shared development Google OAuth are enabled on the current development branch.
Password recovery and verification use email codes. Production email, verification policy, trusted
origins and private OAuth credentials require configuration before a production cutover.

Configure pooled `DATABASE_URL` and optional direct `DIRECT_URL` in `packages/db/.env` for CLI use.
Prisma prefers `DIRECT_URL` for migrations and otherwise uses `DATABASE_URL`. Each server app that
uses the database also needs its own runtime `DATABASE_URL`; currently this is Next.js.

Apply the committed migration to an isolated Neon development branch, then generate the client:

```sh
pnpm db:generate
pnpm db:deploy
```

Validate migrations against a Neon development branch before production and apply committed
migrations with `pnpm db:deploy`. Import `getDb` from `@workspace/db` only in server code and call
`getDb()` at request time after authentication/authorization. Importing the package does not connect;
normal builds do not require database credentials.

## Shared UI

`packages/ui` exports source components and semantic Tailwind theme tokens. Web compiles the shared
source directly. Use the existing Buttons, Accordion, Tabs, Sheet, resizable primitives, GlobalNav,
and theme controls before adding alternatives. Routes and Neon Auth decisions remain in app-owned adapters.

```tsx
import { Button } from "@workspace/ui/components/button";
```

Add official shadcn components in the shared package:

```sh
pnpm dlx shadcn@latest add <component> --cwd packages/ui
```

Use `@workspace/ui/lib/utils` for `cn` imports. Read and maintain [ui-registry.md](../ui-registry.md)
when changing reusable patterns. Normal builds use Turbopack; `pnpm analyze` uses Webpack and writes
ignored reports under `apps/web/.next/analyze/`. Review bundle impact for substantial client additions.

## Verification

For feature changes, choose relevant tests and run the standard quality checks:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The web build includes content validation. Vitest covers contracts, real runner behavior, API policy,
workspace interactions, catalog logic, and shared navigation. UI tests use jsdom/Testing Library;
Route Handler tests use standard Request/Response objects with mocked Neon Auth identity and real
worker tests. Documentation-only edits need formatting and link checks, not a full build.

The [CI workflow](../.github/workflows/ci.yml) runs on pull requests targeting `main` and pushes
to `main`: Node.js 24, the declared pnpm version, a cached pnpm store, frozen installation,
then the four checks above through the existing scripts and Turbo configuration. Biome owns
the lint/format check; ESLint is not configured. CI needs no application secrets and cancels
superseded runs for the same PR/ref. Playwright and live-service tests remain separate.

The production smoke suite needs a completed credential-free build and free port **3000**.
Stop conflicting development servers before running it. Install Chromium once if needed:

```sh
pnpm exec playwright install chromium
NEON_AUTH_BASE_URL= NEON_AUTH_COOKIE_SECRET= DATABASE_URL= DIRECT_URL= pnpm build
pnpm test:e2e
```

The smoke configuration clears credentials and starts its own Next.js server. It verifies public
navigation, themes, mobile behavior, auth routes, health, and protected setup boundaries. It does not
verify real sign-in, authenticated judging, or database access. Reports/traces are ignored.

Authenticated automation is optional. Configure
an isolated development branch and a dedicated existing Neon Auth learner using
`NEON_TEST_USER_EMAIL` and `NEON_TEST_USER_PASSWORD` in ignored `.env.test.local`.
The config also reads the web environment file. Free port 3000 because the suite builds/starts
its own Next.js server. Run `pnpm test:e2e:auth` when that identity is ready. It writes practice
progress to that test account; never point it at a personal account or production database.
The setup signs in through the actual form and saves ignored `.auth/learner.json` session state.
Auth setup disables traces, video and screenshots to keep login details out of artifacts.
Manual browser review does not count as authenticated automated coverage.

## AI tutor

The existing tools panel includes a hint-first tutor for published JavaScript problems.
Its conversation and question draft live only for the current learner/problem visit:
closing the panel, switching Notes and resizing preserve them; leaving/reloading the
problem, signing out or quitting Electron discards them. Nothing is written to chat
tables or browser storage. Notes, editor saves, Run/Submit and solved progress retain
their own behavior.

Set `OPENAI_API_KEY` and `OPENAI_TUTOR_MODEL` only in the ignored web server environment.
The reviewed local model is `gpt-5.4-mini`. Empty examples are tracked; actual keys never
belong in a browser variable, source file or desktop archive. Provider configuration is
read only when an authenticated, validated tutor request reaches the server. Public
pages and production builds work without it; missing settings return a recoverable
tutor-unavailable response and do not disable other practice features.

`POST /api/problems/[problemId]/tutor` verifies the Neon session/origin through
`requireLearner`, then calls feature-owned server modules. Send and explicit Retry are
the only AI triggers. CodeMirror edits stay in the existing local problem session, and
Send reads its synchronous source snapshot. The server selects the published statement,
public examples/constraints and supplied callbacks. Authored `.mdx` statement assets
are included in Next production file tracing and checked by `content:check`.

The provider receives the current code/question, recent completed dialogue and optional
visible Run feedback only when its source/inputs still match. Stale results, Submit/hidden
diagnostics, private notes, account records and separate authored solution fields are
excluded. Model output cannot edit or execute code. The official OpenAI SDK stays on the
server, uses Responses with `store: false`, no tools and no automatic retries, and
normalizes text/completion/error events to a noncacheable POST stream. Stop cancels the
request; incomplete replies remain labeled and explicit Retry captures current code again.

Initial limits: 32 KiB source, 4 KiB question, four recent exchanges/16 KiB history,
8 KiB optional feedback, 2,000 output tokens, 60 seconds. Each Node process permits
10 questions/minute per verified learner, one active request per learner and four total.
These controls do not represent a distributed or monetary budget. Provider retention is
separate from the app's session-only chat lifetime.

Deterministic tutor tests inject streams and make no paid inference calls. Real model
and signed-in Electron reviews are recorded separately in the
[tutor brief](features/problem-ai-tutor.md). Keep the dedicated development learner and
existing production/desktop test setup; coordinate free port 3000 with a running app.

## Deployment and future work

Next.js is the single runtime target. CI is configured; hosted deployment remains future work.
Supply public frontend configuration at build time and server secrets at runtime. The judge requires
Node.js 24 with Node Worker support, filesystem access to the compiled worker and QuickJS assets,
and sufficient execution time. Edge/static hosting does not provide that runtime. Provider-specific
function limits and distributed rate limiting require review before deployment.

The web build compiles the native worker/adapters to ignored `apps/web/.workers/`. Next output tracing
includes those artifacts and QuickJS dependencies. `pnpm dev` compiles the worker at startup; after
editing worker/adapters during a session, run `pnpm --filter @workspace/web worker:build` again.
Merging code does not apply production database migrations.

For local production mode:

```sh
pnpm build
pnpm start
```

The next work is to review account-backed practice data, then add content through the existing content and judge
contracts. Learn, connected AI tutoring, note media/uploads, submission history, and future
administration require their own feature scope. There is currently no admin app.

## Electron desktop

The first desktop slice is an **online client** using the existing Next.js backend.
`apps/desktop/src` owns Electron lifecycle and trust policy; the web application owns
learning, Neon authentication, progress and isolated judging. There is no preload or
IPC bridge. Node integration is disabled; context isolation, sandboxing and web security
stay enabled. Permissions and downloads are denied except sanitized clipboard writes
by the app origin. External HTTPS links open in the system browser; native popups and
other-origin navigation cannot replace the app window.

`pnpm desktop:dev` defaults to `http://localhost:3000`. It reuses a healthy Code Atlas
server or starts `pnpm exec turbo run dev --filter=@workspace/web -- --webpack`. The desktop
launcher uses Webpack for stable hot reload; this machine's Turbopack session repeatedly
refreshed the page during native review. On exit it stops only
the server it started. It refuses an occupied port belonging to an unready or different
service. Normal `pnpm dev` / `pnpm start` still run only the web app.
Set the public `CODE_ATLAS_DESKTOP_URL` environment variable to use another running server.
HTTP is accepted only for explicit loopback development/local builds; hosted builds require HTTPS.

`pnpm desktop:package:local` creates
`apps/desktop/release/Code Atlas Local-darwin-arm64/Code Atlas Local.app` on Apple Silicon.
Keep `pnpm dev` running when opening this local app. An unavailable server shows a
connection screen with Try again; this does not provide offline practice.

For other computers, deploy the Next.js backend, configure its Neon Auth trusted domain,
and package with its public origin:

```sh
CODE_ATLAS_DESKTOP_URL=https://your-code-atlas.example pnpm desktop:package
```

The URL is fixed at packaging time; packaged apps ignore environment URL overrides.
Packaging stages only three compiled desktop modules, package metadata and public
connection configuration, then verifies the ASAR allowlist. No web source, `.env`, Prisma,
private tests or server credentials enter the archive. The development Electron subprocess
receives only platform environment settings and the public URL. Next.js loads its ignored
credentials as usual.

Cookies persist in a separate `persist:code-atlas` session. Local/development data uses
the `Code Atlas Local` application-data directory; hosted packages use `Code Atlas`.
Browser sign-in does not sign in Electron. Email/password and email-code flows reuse
the Neon forms and server boundary. Google is omitted in desktop with an explanation;
system-browser OAuth handoff is deferred. Opening the website does not transfer a session.
See [Google's secure-browser policy](https://developers.google.com/identity/protocols/oauth2/policies#use_secure_browsers).

`pnpm desktop:smoke` tests actual Electron preferences, renderer Node isolation,
popups/external navigation, window session reuse, connection failure and repeated retry
using an owned local fixture. Root `pnpm test` covers URL, permission and environment
policy. CI builds desktop TypeScript without launching a GUI. Fixture cookies do not
establish live Neon authentication or account persistence; native and browser reviews
remain separate checks.

`pnpm test:e2e:desktop:auth` is a separate, opt-in live check. It reuses
`playwright.auth.config.ts` environment loading and dedicated-learner requirements,
also requires `DATABASE_URL`, and builds desktop TypeScript plus the production web app
before starting its own server on **free port 3000**. It needs a graphical desktop
session and the installed workspace Electron binary; on Linux a display server is required.
Keep the Neon Auth URL, cookie secret and database on the same isolated development branch.

The single Counter journey signs in through Electron's email/password form, runs edited
visible inputs, verifies accepted Submit against the larger server suite, and checks
confirmed account saves separately from verdicts. Unique source markers distinguish this
run's saved code from previous data. Run must preserve the existing solved status. After
Submit, the test adds unsaved typing, calls `app.quit()` through Playwright, verifies a clean
process exit, launches a different process, and checks restored authentication, exact saved
source, server progress and catalog solved status. It uses no mocked APIs or browser
`storageState`. The dedicated learner's Counter source/solved progress remains changed;
the test does not reset account records or touch notes.

A test-only entry redirects the app-data root to a temporary directory before importing
the real compiled `main.js`. The production entry still owns its persistent session and
single-instance lock. Both launches use that directory, then remove it after quitting.
Personal desktop profiles and browser sessions stay intact; Electron receives the existing
allowlisted platform environment and public URL, without backend credentials or test login
environment variables. Traces, screenshots and videos remain disabled as in the browser
auth setup. Existing `desktop:smoke` remains credential-free and independent.

This automated check runs compiled Electron against a production Next.js server. The
packaged `.app` path still needs a signed-in native review: start the configured production
server, open the local package, sign in to the dedicated learner, Run/Submit Counter and
confirm saved feedback, use the native Quit command, reopen the package, and check the saved
code and catalog solved status. Use a disposable macOS user/profile if the normal package
contains personal drafts or a signed-in personal account. Merely closing a window does not
exercise full Quit on macOS. Signing/distribution and other OS review remain deferred.

The reviewed target is macOS Apple Silicon. Other OS packaging uses the current host
but remains unverified. The app is unsigned, with no installer or updater. Hosted deployment,
native Google OAuth, offline execution/sync, signing and notarization are later work.
See the [desktop feature brief](features/electron-desktop.md) for actual verification.

## Troubleshooting

| Symptom                                | Check                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------- |
| Unsupported runtime                    | Match `.nvmrc` and the pinned pnpm version                              |
| Dev/test server cannot bind            | Check port 3000 and stop the conflicting process                        |
| Protected page shows setup information | Configure the Neon Auth URL and cookie secret, then restart             |
| Run/Submit is unavailable              | Check `/api/health`, Neon Auth session and the compiled worker          |
| API returns 401                        | Verify the Neon Auth session                                            |
| API returns 503                        | Check Neon Auth configuration or runner availability                    |
| Database URL is missing                | Configure the consuming server app, not only the Prisma CLI environment |
| Playwright browser is missing          | Run `pnpm exec playwright install chromium`                             |
| Smoke tests fail to start              | Build without credentials and free port 3000                            |

Project guidance: [constitution](../.specify/memory/constitution.md), [agent conventions](../AGENTS.md),
[UI registry](../ui-registry.md), and [feature workflow](../.agents/skills/feature-workflow/SKILL.md).
A project license has not yet been selected.

## README screenshots

The images in [docs/images](images) were captured through browser automation from the
running local application on November 10, 2026. They show the public landing page,
the signed-in catalog, and the Fibonacci Generator workspace with existing saved code.
No Run, Submit, or flag actions were used to prepare these captures.

Refresh the images after significant UI changes. Use the rendered application, wait
for account data and the editor to finish loading, and save browser screenshots to
the existing filenames. Keep personal account menus closed and avoid modifying
learner progress solely to stage a screenshot.
