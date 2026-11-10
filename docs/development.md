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
| `/javascript/practice/debounce`                             | Medium Async problem with a deterministic timer judge                                                           |
| `/javascript/practice/delay-the-resolution-of-each-promise` | Medium Async problem with editable Promise descriptors and deterministic fulfillment timing                     |
| `/javascript/practice/filter-elements-from-array`           | Easy Arrays problem with editable array/callback cases                                                          |
| `/javascript/practice/fibonacci-generator`                  | Easy Generators problem with an editable count and isolated iterator judging                                    |
| `/javascript/learn`                                         | Protected coming-soon page; Learn requirements are deferred                                                     |
| `/sign-in`, `/sign-up`                                      | Clerk catch-all authentication routes; completed authentication redirects to Dashboard                          |

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
- Flag toggles and solved indicators in the table. Records belong to the verified Clerk user and persist across sessions/devices. Older browser completions are retained separately as unverified history.
- A narrow-screen reading layout with a tools drawer. Source, editor state, inputs, expanded help,
  and results survive responsive changes.
- Category icons use distinct theme colors. Difficulty labels use green for Easy, amber for Medium, and red for Hard.
- Light, Dark, and System themes; the initial theme is dark and the preference persists in the browser.

AI tutoring and saved notes are clearly labeled placeholders. The workspace has no visualization,
Submissions view, Problems button, or Reset layout action. An accepted Submit records account-backed solved status; submission history remains future work.

## Environment and authentication

Copy the relevant example only if its local destination does not already exist. Keep real keys
in ignored environment files; committed examples contain empty credential values.

| Example                    | Local destination     | Purpose                                                        |
| -------------------------- | --------------------- | -------------------------------------------------------------- |
| `apps/web/.env.example`    | `apps/web/.env.local` | Clerk keys/auth routes and server-only Neon runtime connection |
| `packages/db/.env.example` | `packages/db/.env`    | Prisma CLI pooled/direct connections for migrations            |

1. Set web `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the same Clerk application.
2. Retain the example sign-in/sign-up routes and Dashboard redirect settings.
3. Set server-only `DATABASE_URL` in `apps/web/.env.local` for account progress and saved source.
4. Restart Next.js after environment changes. Rebuild after changing public frontend keys.

The Next.js proxy initializes Clerk. Every protected page and Route Handler verifies its own session
before accessing data or executing code. API handlers also reject foreign request origins and bound
payload sizes. Sign-in/sign-up redirect to Dashboard and sign-out returns home. Judging needs no
external judge key. Missing auth configuration returns 503 and a missing session returns 401.

Next.js and Prisma load their own local environment files. A database package `.env` does not configure
Next.js. Only public configuration belongs in `NEXT_PUBLIC_` variables. Keep server secrets out of
browser and future Electron bundles. Next Route Handlers call server services directly, without a
second application, token-forwarding origin or CORS configuration.

## Commands

Root `package.json` is the source of truth for scripts.

| Command                                       | Purpose                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                                    | Build shared dependencies/worker and run Next.js development             |
| `pnpm build` / `pnpm start`                   | Build all workspaces / start production servers after building           |
| `pnpm lint` / `pnpm lint:fix`                 | Biome checks / safe fixes                                                |
| `pnpm format`                                 | Format supported files                                                   |
| `pnpm typecheck`                              | Root and workspace TypeScript checks                                     |
| `pnpm test` / `pnpm test:watch`               | Build shared packages/worker and run Vitest / watch                      |
| `pnpm test:coverage`                          | Build shared packages/worker and run Vitest coverage                     |
| `pnpm test:e2e` / `pnpm test:e2e:ui`          | Credential-free production Playwright smoke tests / test UI              |
| `pnpm test:e2e:auth`                          | Optional authenticated suite with a dedicated Clerk development identity |
| `pnpm --filter @workspace/web content:check`  | Validate the current practice catalog and public definitions             |
| `pnpm --filter @workspace/web worker:build`   | Compile the isolated worker/adapters to ignored `.workers/`              |
| `pnpm analyze`                                | Webpack bundle-analysis build for the web app                            |
| `pnpm db:generate`                            | Generate Prisma Client without connecting to a database                  |
| `pnpm db:migrate --name <name>`               | Create/apply a development migration once models and credentials exist   |
| `pnpm db:deploy` / `pnpm db:studio`           | Apply committed migrations / open Prisma Studio                          |
| `pnpm specify version` / `pnpm specify check` | Inspect the optional pinned Spec Kit CLI and available tools             |

## Where the code lives

A short ownership map replaces a full directory tree. Keep feature details in their brief and code.

| Location                                                        | Owns                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Web routes](../apps/web/src/app)                               | Next.js pages, layouts, and authenticated web API adapters               |
| [Web features](../apps/web/src/features)                        | Landing, catalog, dashboard, problem behavior/state and workspace layout |
| [JavaScript content](../apps/web/src/content/javascript)        | Practice catalog and trusted problem MDX                                 |
| [Problem server code](../apps/web/src/features/problems/server) | Private suites, execution policy and isolated worker                     |
| [Progress server code](../apps/web/src/features/catalog/server) | Authenticated account reads, flags and executed-source persistence       |
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

All six published problems have separate server-owned judging contracts.
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
| `GET /api/me`                             | Verified Clerk identity                                          |
| `GET /api/practice-progress`              | Current learner's flags, solved status and legacy history        |
| `GET /api/practice-progress/:problemId`   | Current learner's saved source and problem progress              |
| `PATCH /api/practice-progress/:problemId` | Change the current learner's flag only                           |
| `POST /api/practice-progress/import`      | Idempotent import of browser flags and unverified legacy history |
| `POST /api/problems/:problemId/run`       | Execute visible cases                                            |
| `POST /api/problems/:problemId/submit`    | Execute the server-selected suite                                |

Routes live in `apps/web/src/app/api/**/route.ts` and use the Node.js runtime. Thin handlers compose
feature-owned server code, which verifies Clerk identity before execution or database access.
Server services use `server-only` boundaries. UI code uses the same-origin `/api` URLs.

The execution service runs QuickJS WebAssembly inside a disposable Node Worker. Guest memory, stack, CPU, timers,
console output, concurrency, and wall time are bounded. Learner code has no Node module, filesystem,
DOM, or network access. The adapters support single-file JavaScript for these six problems, not a general Node runtime.
Sleep measures elapsed time. Counter checks returned numeric sequences and independent closure state;
its editable `calls` field is the number of invocations. Debounce runs guest timers on a deterministic
clock with documented same-time ordering. Filter supplies a selectable callback, checks truthy
results and original indices, and disables the guest Array.prototype.filter built-in.
Fibonacci Generator advances synchronous iterable iterators for an editable count (0–50)
and checks independent state. The generator itself takes no arguments.
Delay the Resolution of Each Promise checks wrapper creation, immediate original invocation,
preserved values/order and an extra fulfillment delay on the same deterministic clock. See its
[feature brief](../docs/features/delay-each-promise.md) for the original exercise and research sources.
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
clerkUserId. PracticeProgress has one row per user/problem, with flagged, solvedAt, lastCode,
codeUpdatedAt, legacyCompleted, and timestamps. Users are created lazily from verified Clerk
identity on their first practice-data request. Passwords/profile management remain in Clerk;
problem content and private suites remain in files. Only Next server modules import Prisma;
client components consume authenticated Route Handlers.

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
and theme controls before adding alternatives. Routes and Clerk decisions remain in app-owned adapters.

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
Route Handler tests use standard Request/Response objects with mocked Clerk identity and real
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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= CLERK_SECRET_KEY= CLERK_PUBLISHABLE_KEY= DATABASE_URL= pnpm build
pnpm test:e2e
```

The smoke configuration clears credentials and starts its own Next.js server. It verifies public
navigation, themes, mobile behavior, auth routes, health, and protected setup boundaries. It does not
verify real sign-in, authenticated judging, or database access. Reports/traces are ignored.

Authenticated automation is optional and remains unverified at the user's request. It requires Clerk
**development** keys and `CLERK_TEST_USER_EMAIL` for a dedicated existing development learner without
MFA/session tasks. The config reads ignored `.env.test.local` and web environment files. Free
port 3000 because the suite builds/starts its own Next.js server. Run `pnpm test:e2e:auth` when that identity is ready. Manual signed-in browser review is recorded
in the feature brief and does not count as authenticated automated coverage.

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
contracts. Learn, connected AI tutoring, editable/saved notes, submission history, and future
administration require their own feature scope. There is currently no admin app.

Electron remains planned: no desktop workspace, renderer packaging, installer, signing, updater, or
offline sync exists. Decide hosted versus bundled rendering, operating systems/distribution, and offline
requirements before implementing it. Server secrets stay on the server; native access must use narrow,
validated interfaces. Browser tests cannot establish packaged desktop behavior.

## Troubleshooting

| Symptom                                | Check                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------- |
| Unsupported runtime                    | Match `.nvmrc` and the pinned pnpm version                              |
| Dev/test server cannot bind            | Check port 3000 and stop the conflicting process                        |
| Protected page shows setup information | Configure both web Clerk keys and restart                               |
| Run/Submit is unavailable              | Check `/api/health`, Clerk session and the compiled worker              |
| API returns 401                        | Verify the Clerk session                                                |
| API returns 503                        | Check Clerk configuration or runner availability                        |
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
