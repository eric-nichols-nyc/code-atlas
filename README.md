# Code Atlas

Code Atlas is a JavaScript-first learning and coding-practice platform built as a pnpm/Turborepo
monorepo. It currently has a Next.js learner app and an Express API. Electron is planned.

**Available practice problems: Counter, Filter Elements from Array, Debounce, and Sleep.** Learners edit JavaScript,
Run visible cases, and Submit against a server-selected test suite. Results come from isolated
execution. Each learner’s flags, verified solved status, and latest Run/Submit source are stored in Neon.
Code is restored when a problem reopens, including after reload or in another browser. Unexecuted
edits and the latest result remain in memory; individual submission history is not implemented.
Only a server-judged accepted Submit marks a problem solved. Saving failures are shown explicitly.

## Contents

- [Current experience](#current-experience)
- [Quick start](#quick-start)
- [Environment and authentication](#environment-and-authentication)
- [Commands](#commands)
- [Where the code lives](#where-the-code-lives)
- [Feature workflow](#feature-workflow)
- [Authoring practice problems](#authoring-practice-problems)
- [API and execution](#api-and-execution)
- [Database](#database)
- [Shared UI](#shared-ui)
- [Verification](#verification)
- [Deployment and future work](#deployment-and-future-work)
- [Troubleshooting](#troubleshooting)

## Current experience

| Route                                             | Behavior                                                                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/`                                               | Public landing page with an interactive Counter example and published JavaScript problems           |
| `/dashboard`                                      | Protected subject picker; JavaScript is available, Algorithms and React JS are coming soon          |
| `/javascript`                                     | Redirects to JavaScript Practice                                                                    |
| `/javascript/practice`                            | Searchable table with Recommended, Closures, Arrays and Async categories, plus difficulty filtering |
| `/javascript/practice/sleep`                      | Protected coding workspace with real Run/Submit                                                     |
| `/javascript/practice/counter`                    | Protected Counter workspace with editable start/call count and real Run/Submit                      |
| `/javascript/practice/debounce`                   | Medium Async problem with a deterministic timer judge                                               |
| `/javascript/practice/filter-elements-from-array` | Easy Arrays problem with editable array/callback cases                                              |
| `/javascript/learn`                               | Protected coming-soon page; Learn requirements are deferred                                         |
| `/sign-in`, `/sign-up`                            | Clerk catch-all authentication routes; completed authentication redirects to Dashboard              |

JavaScript catalog and Learn pages use centered Learn/Practice navigation, with Dashboard beside
Code Atlas for returning to the subject picker. Learn/Practice have book/code icons and text-only hover states. Individual problem pages use a focused workspace
with Back to Practice and AI/Notes icons. Each icon opens its corresponding tab; clicking the active
icon closes the tools panel. Legacy `/learn/javascript` URLs redirect to Practice.

The public landing page has a fixed, interactive closure example with selectable starting values,
recent return values and reset. It works without signing in and does not evaluate learner code or
write progress. Its problem links and counts come from the existing catalog. See the
[landing-page feature brief](docs/features/dynamic-landing-page.md) for scope and reference evidence.

The workspace provides:

- A continuous description with examples, constraints, individual hint accordions, and Solution last.
- A local CodeMirror JavaScript editor with Reset code, theme, and disabled Share icons in its header.
- Run and Submit below the editor; Testcase and Test Result beneath that.
- Resizable description/editor/tools columns and an editor/results split. Closing tools releases space.
- Flag toggles and solved indicators in the table. Records belong to the verified Clerk user and persist across sessions/devices. Older browser completions are retained separately as unverified history.
- A narrow-screen reading layout with a tools drawer. Source, editor state, inputs, expanded help,
  and results survive responsive changes.
- Category icons use distinct theme colors. Difficulty labels use green for Easy, amber for Medium, and red for Hard.
- Light, Dark, and System themes; the initial theme is dark and the preference persists in the browser.

AI tutoring and saved notes are clearly labeled placeholders. The workspace has no visualization,
Submissions view, Problems button, or Reset layout action. An accepted Submit records account-backed solved status; submission history remains future work.

## Quick start

Use Node.js **24 LTS, 24.11.0 or later in the 24.x series**, and **pnpm 11.25.0**, matching
`.nvmrc` and `package.json`. Git is required. Python 3.11+ and `uv` are needed only for the optional
Spec Kit CLI.

```sh
git clone https://github.com/eric-nichols-nyc/code-atlas.git
cd code-atlas
pnpm install --frozen-lockfile
pnpm dev
```

| Service    | Local address                  |
| ---------- | ------------------------------ |
| Web        | <http://localhost:3000>        |
| API health | <http://127.0.0.1:4000/health> |

`pnpm dev` builds shared dependencies and starts web/API. Public pages, health, Prisma generation,
and credential-free builds work without Clerk or Neon keys. Protected pages show setup information
until Clerk is configured. Running and submitting code require a signed-in Clerk session and API. Account progress and saved code also require a migrated Neon database; judging remains usable if persistence is unavailable.

To run one application with its shared build dependencies:

```sh
pnpm exec turbo run dev --filter=@workspace/web
pnpm exec turbo run dev --filter=@workspace/api
```

## Environment and authentication

Copy the relevant example only if its local destination does not already exist. Keep real keys
in ignored environment files; committed examples contain empty credential values.

| Example                    | Local destination     | Purpose                                                                  |
| -------------------------- | --------------------- | ------------------------------------------------------------------------ |
| `apps/web/.env.example`    | `apps/web/.env.local` | Clerk keys/auth routes and optional server `API_URL`                     |
| `apps/api/.env.example`    | `apps/api/.env`       | Clerk keys, port/host, allowed frontend origins, runtime Neon connection |
| `packages/db/.env.example` | `packages/db/.env`    | Prisma CLI pooled/direct connections for migrations                      |

Use the same Clerk development application in web and API:

1. Web: set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`; retain the example auth routes.
2. API: set `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from that same Clerk application.
3. Keep API `CORS_ORIGINS` aligned with the frontend origin, normally `http://localhost:3000`.
4. Web's server-only `API_URL` defaults to `http://127.0.0.1:4000`. Set it when the API runs elsewhere.
5. Restart the affected servers after environment changes; rebuild after changing public frontend keys.

The Next.js proxy initializes Clerk. Protected pages and web API handlers verify their own sessions;
Express verifies the forwarded token behind its `/v1` boundary. Sign-in/sign-up redirect to Dashboard,
and sign-out returns home. Judging needs no external judge key. Account progress requires the API runtime DATABASE_URL; protected progress operations fail explicitly while it is unavailable.

Next.js, the API, and Prisma load their own local environment files. A database package `.env` does
not configure application processes. Only public configuration belongs in `NEXT_PUBLIC_` variables.
Never expose server secrets in browser or future Electron bundles.

## Commands

Root `package.json` is the source of truth for scripts.

| Command                                       | Purpose                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                                    | Build shared dependencies and run web/API development servers            |
| `pnpm build` / `pnpm start`                   | Build all workspaces / start production servers after building           |
| `pnpm lint` / `pnpm lint:fix`                 | Biome checks / safe fixes                                                |
| `pnpm format`                                 | Format supported files                                                   |
| `pnpm typecheck`                              | Root and workspace TypeScript checks                                     |
| `pnpm test` / `pnpm test:watch`               | Build shared database/domain packages and run Vitest / watch             |
| `pnpm test:coverage`                          | Build shared packages and run Vitest coverage                            |
| `pnpm test:e2e` / `pnpm test:e2e:ui`          | Credential-free production Playwright smoke tests / test UI              |
| `pnpm test:e2e:auth`                          | Optional authenticated suite with a dedicated Clerk development identity |
| `pnpm --filter @workspace/web content:check`  | Validate the current practice catalog and public definitions             |
| `pnpm analyze`                                | Webpack bundle-analysis build for the web app                            |
| `pnpm db:generate`                            | Generate Prisma Client without connecting to a database                  |
| `pnpm db:migrate --name <name>`               | Create/apply a development migration once models and credentials exist   |
| `pnpm db:deploy` / `pnpm db:studio`           | Apply committed migrations / open Prisma Studio                          |
| `pnpm specify version` / `pnpm specify check` | Inspect the optional pinned Spec Kit CLI and available tools             |

## Where the code lives

A short ownership map replaces a full directory tree. Keep feature details in their brief and code.

| Location                                              | Owns                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| [Web routes](apps/web/src/app)                        | Next.js pages, layouts, and authenticated web API adapters                |
| [Web features](apps/web/src/features)                 | Catalog, dashboard, problem behavior/state, and adaptive workspace layout |
| [JavaScript content](apps/web/src/content/javascript) | Practice catalog and trusted problem MDX                                  |
| [API](apps/api/src)                                   | Express auth boundary, private test suites, and isolated execution        |
| [Public problem package](packages/problems/src)       | Shared problem definitions and execution contracts                        |
| [Shared UI](packages/ui/src)                          | shadcn primitives, generic navigation, icons, and theme                   |
| [Database package](packages/db)                       | Prisma schema, generation, and lazy server-only client                    |
| [Browser tests](tests)                                | Smoke and optional authenticated Playwright journeys                      |
| [Feature briefs](docs/features)                       | Scope, acceptance checks, decisions, and verified outcomes                |

[AGENTS.md](AGENTS.md) contains agent conventions, [ui-registry.md](ui-registry.md) records UI
patterns, and the [constitution](.specify/memory/constitution.md) defines durable project principles.
Generated dependencies/builds, reports, credentials, and local `work/`/`outputs/` artifacts are ignored.

## Feature workflow

Use the project-local [feature-workflow skill](.agents/skills/feature-workflow/SKILL.md):

1. Write or update one short brief in `docs/features/`: outcome, included/deferred scope, observable
   acceptance checks, implementation checklist, and open decisions.
2. Build one complete working slice using existing feature folders and shared UI.
3. Review it in the browser, then iterate directly from feedback while preserving the user's work.
4. Run relevant checks and record actual verification results and limitations in the same brief.

Small fixes and layout changes go straight to code. Expand the brief when execution, authentication,
persistence, or another architecture decision needs detail. Spec Kit is installed but optional;
use its formal workflow when requested. Existing `specs/` artifacts remain historical unless selected
for further work. See the [JavaScript practice brief](docs/features/javascript-coding-problems.md) and
[database users brief](docs/features/database-users.md).

## Authoring practice problems

Current content ownership is deliberate:

- Public problem definitions, starter source, samples, constraints, hints and solutions:
  [problem modules](packages/problems/src/problems). Shared types are in
  [types.ts](packages/problems/src/types.ts); [index.ts](packages/problems/src/index.ts) exposes the public registry and validation helpers.
- Trusted authored prose: each problem's `problem.mdx` under
  [practice content](apps/web/src/content/javascript/practice). Explicit lazy statement loaders
  live in [statements.ts](apps/web/src/content/javascript/practice/statements.ts). Learners never author executable MDX.
- Listing metadata such as topic, recommendation, difficulty, and ordering:
  [practice catalog](apps/web/src/content/javascript/practice/catalog.ts).
- Hidden inputs and judging: [API execution](apps/api/src/execution). Hidden inputs and logs must
  stay out of public definitions and browser payloads.

`features/problems` owns the editable CodeMirror adapter, problem session, description, and results.
`features/learning` currently owns the reusable adaptive layout and tools panel; its name does not
make the current practice experience a guided Learn lesson.

All four published problems have separate server-owned judging contracts.
Register new definitions, catalog entries, trusted MDX loaders and a matching private test suite/adapter;
the content validator checks that the published catalog agrees with those public definitions.
Adding MDX alone does not create a runnable problem.
Future Learn content is a separate feature. Reuse the shared workspace where its interaction fits.

## API and execution

| Endpoint                                 | Access and behavior                                                 |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `GET /health`                            | Public service health                                               |
| `GET /v1/me`                             | Verified Clerk identity                                             |
| `GET /v1/practice-progress`              | Current learner’s flags, verified solved status, and legacy history |
| `GET /v1/practice-progress/:problemId`   | Current learner’s saved source and progress for one problem         |
| `PATCH /v1/practice-progress/:problemId` | Change the current learner’s flag only                              |
| `POST /v1/practice-progress/import`      | Idempotent import of browser flags and unverified legacy history    |
| `POST /v1/problems/:problemId/run`       | Authenticated execution against visible inputs                      |
| `POST /v1/problems/:problemId/submit`    | Authenticated execution against the server-selected suite           |

The browser calls the same-origin web adapter at `/api/problems/:problemId/:action`. It checks the
session, request origin, and input limits, then forwards a Clerk token to the API. Express checks
identity again under `/v1`; missing auth configuration returns 503 and missing identity returns 401.

The API runs QuickJS WebAssembly inside a disposable Node Worker. Guest memory, stack, CPU, timers,
console output, concurrency, and wall time are bounded. Learner code has no Node module, filesystem,
DOM, or network access. The adapters support single-file JavaScript for these four problems, not a general Node runtime.
Sleep measures elapsed time. Counter checks returned numeric sequences and independent closure state;
its editable `calls` field is the number of invocations. Debounce runs guest timers on a deterministic
clock with documented same-time ordering. Filter supplies a selectable callback, checks truthy
results and original indices, and disables the guest Array.prototype.filter built-in.
Hidden inputs, outputs and logs remain private.

Run uses editable visible cases; Submit ignores client-supplied cases and uses the full private suite.
Test Result shows the latest real verdict. Editing relevant source/inputs marks a result stale;
failures preserve the current code. The API saves latest source after every valid Run/Submit request, including wrong/error verdicts.
An accepted Submit sets solvedAt once; Run and later failed submissions do not set or clear it.
Code writes use server request timestamps so an older result cannot replace a newer source.
There is no individual submission-history service. Browser records are kept as backups; old solved
entries import as unverified legacy history, never as server-verified completion. Database failures
leave judging usable with an explicit unsaved status and a per-learner browser code backup.

## Database

Prisma 7 and the Neon adapter live in packages/db. User links an internal ID to a unique
clerkUserId. PracticeProgress has one row per user/problem, with flagged, solvedAt, lastCode,
codeUpdatedAt, legacyCompleted, and timestamps. Users are created lazily from verified Clerk
identity on their first practice-data request. Passwords/profile management remain in Clerk;
problem content and private suites remain in files. The web app consumes authenticated API
adapters and has no Prisma runtime dependency.

Configure pooled `DATABASE_URL` and optional direct `DIRECT_URL` in `packages/db/.env` for CLI use.
Prisma prefers `DIRECT_URL` for migrations and otherwise uses `DATABASE_URL`. Each server app that
uses the database also needs its own runtime `DATABASE_URL`.

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
and theme controls before adding alternatives. Routes and Clerk decisions remain in app-owned adapters.

```tsx
import { Button } from "@workspace/ui/components/button";
```

Add official shadcn components in the shared package:

```sh
pnpm dlx shadcn@latest add <component> --cwd packages/ui
```

Use `@workspace/ui/lib/utils` for `cn` imports. Read and maintain [ui-registry.md](ui-registry.md)
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
HTTP tests use Supertest. Documentation-only edits need formatting and link checks, not a full build.

The [CI workflow](.github/workflows/ci.yml) runs on pull requests targeting `main` and pushes
to `main`: Node.js 24, the declared pnpm version, a cached pnpm store, frozen installation,
then the four checks above through the existing scripts and Turbo configuration. Biome owns
the lint/format check; ESLint is not configured. CI needs no application secrets and cancels
superseded runs for the same PR/ref. Playwright and live-service tests remain separate.

The production smoke suite needs a completed credential-free build and free ports **3000 and 4000**.
Stop conflicting development servers before running it. Install Chromium once if needed:

```sh
pnpm exec playwright install chromium
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= CLERK_SECRET_KEY= CLERK_PUBLISHABLE_KEY= DATABASE_URL= pnpm build
pnpm test:e2e
```

The smoke configuration clears credentials and starts its own web/API servers. It verifies public
navigation, themes, mobile behavior, auth routes, health, and protected setup boundaries. It does not
verify real sign-in, authenticated judging, or database access. Reports/traces are ignored.

Authenticated automation is optional and remains unverified at the user's request. It requires Clerk
**development** keys and `CLERK_TEST_USER_EMAIL` for a dedicated existing development learner without
MFA/session tasks. The config reads ignored `.env.test.local` and web environment files. Keep the API
running separately with matching Clerk keys; free port 3000 because the suite builds/starts its own web
server. Run `pnpm test:e2e:auth` when that identity is ready. Manual signed-in browser review is recorded
in the feature brief and does not count as authenticated automated coverage.

## Deployment and future work

Web and API are separate runtime targets. CI is configured; hosted deployment is not configured.
Supply public frontend configuration at build time and server secrets at runtime. The API defaults
to `HOST=127.0.0.1` locally; configure an appropriate binding and allowed origins when deploying.

For local production mode:

```sh
pnpm build
pnpm start
```

The next work is to review account-backed practice data, then add content through the existing content and judge
contracts. Learn, connected AI tutoring, editable/saved notes, submission history, and future
administration require their own feature scope. There is currently no admin app.

Electron remains planned: no desktop workspace, renderer packaging, installer, signing, updater, or
offline sync exists. Decide hosted versus bundled rendering, operating systems/distribution, and offline
requirements before implementing it. Server secrets stay on the server; native access must use narrow,
validated interfaces. Browser tests cannot establish packaged desktop behavior.

## Troubleshooting

| Symptom                                | Check                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------- |
| Unsupported runtime                    | Match `.nvmrc` and the pinned pnpm version                                |
| Dev/test server cannot bind            | Check ports 3000/4000 and stop the conflicting process                    |
| Protected page shows setup information | Configure both web Clerk keys and restart                                 |
| Run/Submit is unavailable              | Check API health, matching Clerk keys, web `API_URL`, and allowed origins |
| API returns 401                        | Verify the Clerk session token and authorized frontend origin             |
| API returns 503                        | Check Clerk configuration or runner availability                          |
| Database URL is missing                | Configure the consuming server app, not only the Prisma CLI environment   |
| Playwright browser is missing          | Run `pnpm exec playwright install chromium`                               |
| Smoke tests fail to start              | Build without credentials and free both production-test ports             |

Project guidance: [constitution](.specify/memory/constitution.md), [agent conventions](AGENTS.md),
[UI registry](ui-registry.md), and [feature workflow](.agents/skills/feature-workflow/SKILL.md).
A project license has not yet been selected.
