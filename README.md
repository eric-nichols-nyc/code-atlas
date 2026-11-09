# Learning Platform

A JavaScript-first learning platform being developed for the web and a future Electron desktop application. The project is organized as a pnpm/Turborepo monorepo with separate learner, administration, and API applications.

**Status: foundation implemented; learning features are being planned.** The current screens are starter pages. JavaScript lessons, a lesson player, MDX rendering, an editable code sandbox, and Electron packaging have not been implemented yet.

## Contents

- [Product direction and current status](#product-direction-and-current-status)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Quick start](#quick-start)
- [Workspace commands](#workspace-commands)
- [Environment configuration](#environment-configuration)
- [Authentication and admin access](#authentication-and-admin-access)
- [API](#api)
- [Database and Neon](#database-and-neon)
- [Shared UI and navigation](#shared-ui-and-navigation)
- [Testing and quality checks](#testing-and-quality-checks)
- [Bundle analysis](#bundle-analysis)
- [Feature development with Spec Kit](#feature-development-with-spec-kit)
- [Learning content and visualizations](#learning-content-and-visualizations)
- [Desktop and deployment direction](#desktop-and-deployment-direction)
- [Roadmap and open decisions](#roadmap-and-open-decisions)
- [Troubleshooting](#troubleshooting)
- [Project references and license](#project-references-and-license)

## Product direction and current status

The intended learning experience combines explanations, code examples, interactive visualizations, practice, and progress tracking. JavaScript is the first subject. Algorithm/interview practice and design-system learning are later subject areas.

| Area                 | Current state                                                                    |
| -------------------- | -------------------------------------------------------------------------------- |
| Monorepo             | pnpm workspaces and Turborepo task orchestration                                 |
| Learner application  | Next.js App Router starter with home, dashboard, and sign-in/sign-up routes      |
| Administration       | Separate Next.js starter with a protected dashboard and explicit admin allowlist |
| API                  | Express application with health and authenticated identity endpoints             |
| Shared UI            | shadcn primitives, theme tokens, and a generic responsive `GlobalNav`            |
| Authentication       | Clerk integration scaffolding; real keys are supplied separately                 |
| Persistence          | Prisma/Neon client package; schema has no business models or migrations yet      |
| Development workflow | Biome, TypeScript, Vitest, Playwright, web bundle analysis, and Spec Kit         |
| Curriculum           | Planned; no JavaScript lessons are included yet                                  |
| Desktop              | Electron is a target, with no desktop app or installer included yet              |

The active [constitution](.specify/memory/constitution.md) defines the project's architecture, learning-content, accessibility, security, and verification principles. Planned capabilities must remain clearly distinguished from delivered functionality.

## Technology stack

| Concern                     | Installed foundation                                    |
| --------------------------- | ------------------------------------------------------- |
| Runtime and package manager | Node.js 24 LTS; pnpm 11.25.0                            |
| Workspace orchestration     | Turborepo 2                                             |
| Frontends                   | Next.js 16, React 19, TypeScript                        |
| Styling and components      | Tailwind CSS 4, shadcn/Radix primitives, Lucide icons   |
| API                         | Express 5, Clerk Express SDK, CORS, Helmet              |
| Authentication              | Clerk Next.js and Express SDKs                          |
| Database                    | Prisma 7, Neon serverless adapter                       |
| Formatting and lint         | Biome 2                                                 |
| Tests                       | Vitest, Testing Library, Supertest, Playwright/Chromium |
| Planning                    | GitHub Spec Kit 1.3.2 with Codex skills                 |

Exact versions and executable scripts are defined in the package manifests and `pnpm-lock.yaml`. The internal package names currently use the `@workspace` scope.

## Repository structure

This tree describes directories that exist today. Future feature modules and the Electron app will be introduced by their implementation plans.

```text
.
├── apps/
│   ├── web/                         # Learner-facing Next.js application
│   │   └── src/
│   │       ├── app/                 # Routes, layouts, and global CSS
│   │       ├── components/          # App adapters and composed components
│   │       ├── lib/                 # App-specific helpers
│   │       └── proxy.ts             # Clerk request initialization
│   ├── admin/                       # Separate Next.js administration app
│   │   └── src/                     # App routes, nav adapter, auth policy
│   └── api/
│       └── src/
│           ├── app.ts               # Testable Express app and route boundaries
│           ├── app.test.ts          # HTTP behavior and authorization-policy tests
│           └── server.ts            # Environment configuration and server startup
├── packages/
│   ├── ui/
│   │   └── src/
│   │       ├── components/          # Shared primitives and GlobalNav
│   │       ├── lib/                 # Shared class-name helper
│   │       └── styles/              # Tailwind imports and semantic theme tokens
│   └── db/
│       ├── prisma/schema.prisma     # PostgreSQL schema; models added per feature
│       ├── prisma.config.ts         # CLI and migration connection configuration
│       └── src/index.ts             # Lazy server-side Prisma client
├── tests/
│   ├── e2e/                         # Cross-application Playwright smoke tests
│   └── setup.ts                     # UI test setup and cleanup
├── .agents/skills/speckit-*/         # Shared project-local Codex skills
├── .specify/
│   ├── memory/constitution.md       # Project principles
│   ├── scripts/                     # Feature and template helpers
│   ├── templates/                   # Spec Kit templates
│   └── workflows/                   # Installed feature-development workflow
├── AGENTS.md                        # Coding-agent project conventions
├── ui-registry.md                   # Shared visual and interaction patterns
├── biome.json                       # Formatting, import organization, and lint
├── playwright.config.ts             # Production-server browser tests
├── vitest.config.ts                 # Server and UI test projects
├── pnpm-workspace.yaml              # Workspace membership and build permissions
└── turbo.json                       # Task dependencies, outputs, and environment handling
```

Generated dependencies, build products, browser reports, and local environment files are ignored. Local research under `work/` and deliverables under `outputs/` are also excluded from Git.

## Quick start

### Requirements

- Node.js **24 LTS, version 24.11.0 or later in the 24.x series**, matching `.nvmrc`.
- pnpm **11.25.0**, matching the `packageManager` field.
- Git.
- Python 3.11+ and [uv](https://docs.astral.sh/uv/) only if running the pinned Spec Kit CLI through `pnpm specify`.

If using nvm, run `nvm use` from the repository. If pnpm is missing, follow the [pnpm installation instructions](https://pnpm.io/installation) and select the pinned version.

```sh
git clone https://github.com/eric-nichols-nyc/learning-platform.git
cd learning-platform
pnpm install --frozen-lockfile
pnpm dev
```

The dev command builds shared database code first and starts all three applications:

| Application | Address                        |
| ----------- | ------------------------------ |
| Web         | <http://localhost:3000>        |
| Admin       | <http://localhost:3001>        |
| API health  | <http://127.0.0.1:4000/health> |

No Clerk or Neon credentials are required for the public starter pages, health endpoint, Prisma generation, or normal build. Authentication-dependent pages show setup information until Clerk is configured. Protected API requests fail closed.

To run a single app while retaining its workspace build dependencies:

```sh
pnpm exec turbo run dev --filter=@workspace/web
pnpm exec turbo run dev --filter=@workspace/admin
pnpm exec turbo run dev --filter=@workspace/api
```

## Workspace commands

Run these from the repository root.

| Command                         | Purpose                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                      | Start all development servers                                           |
| `pnpm build`                    | Generate/build the database package and build all apps                  |
| `pnpm start`                    | Start production servers after a completed build                        |
| `pnpm lint`                     | Check formatting, imports, and lint with Biome                          |
| `pnpm lint:fix`                 | Apply safe Biome fixes                                                  |
| `pnpm format`                   | Format supported source and documentation                               |
| `pnpm typecheck`                | Check root test/configuration types and workspace types                 |
| `pnpm test`                     | Run all Vitest tests                                                    |
| `pnpm test:watch`               | Run Vitest in watch mode                                                |
| `pnpm test:coverage`            | Run Vitest with V8 coverage                                             |
| `pnpm test:e2e`                 | Run Playwright against all three production servers                     |
| `pnpm test:e2e:ui`              | Open the Playwright test UI                                             |
| `pnpm analyze`                  | Build the web app with Webpack bundle analysis                          |
| `pnpm db:generate`              | Generate the Prisma client without connecting to a database             |
| `pnpm db:migrate --name <name>` | Create/apply a development migration after models and credentials exist |
| `pnpm db:deploy`                | Apply committed migrations to the configured database                   |
| `pnpm db:studio`                | Open Prisma Studio using configured credentials                         |
| `pnpm specify version`          | Inspect the pinned Specify CLI version                                  |
| `pnpm specify check`            | Check available coding-agent tools                                      |

## Environment configuration

Copy examples only when configuring the corresponding service. Keep existing local files if you already have them.

| Example                    | Local file read by that process | Configuration                                                               |
| -------------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| `apps/web/.env.example`    | `apps/web/.env.local`           | Public Clerk key, server secret, auth routes, optional runtime database URL |
| `apps/admin/.env.example`  | `apps/admin/.env.local`         | Clerk keys/routes, admin user allowlist, optional runtime database URL      |
| `apps/api/.env.example`    | `apps/api/.env`                 | API address, allowed origins, Clerk keys, optional runtime database URL     |
| `packages/db/.env.example` | `packages/db/.env`              | Prisma CLI pooled/direct database connections                               |

Next.js loads each frontend's environment files. API dev/start commands use Node's environment-file support. Prisma configuration loads its package-local `.env`. A database package environment file does **not** configure every application process.

All committed examples have empty credential values. Real environment files and Clerk local state are ignored. Supply deployment secrets through the hosting environment. Only explicitly public configuration belongs in `NEXT_PUBLIC_` variables.

## Authentication and admin access

Use the same Clerk application across web, admin, and API:

1. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in each frontend's local environment.
2. Keep the sign-in/sign-up route and redirect variables from the frontend examples.
3. Set `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in the API environment.
4. Set `ADMIN_USER_IDS` in the admin environment to a comma-separated list of approved Clerk user IDs. An empty list denies all users.
5. Keep API `CORS_ORIGINS` aligned with the frontend origins; the API also uses these values as Clerk authorized parties.

| App   | Routes and behavior                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------- |
| Web   | `/`, `/sign-in`, `/sign-up`, and a protected `/dashboard`                                             |
| Admin | Public starter `/`, `/sign-in`, and `/dashboard` requiring a verified session and allowlisted user ID |
| API   | Public `/health`; all `/v1` routes behind the shared authentication boundary                          |

The Next.js proxy initializes Clerk. Protected pages perform their own session and authorization checks before serving protected content. Any new protected Route Handler or Server Action must enforce its own access policy as well.

Restart development servers after environment changes. Production builds need public Clerk configuration at build time; runtime processes need the server secret. Rebuild after changing a public key. No Clerk application is provisioned by this repository.

See [Clerk for Next.js](https://clerk.com/docs/nextjs/getting-started/quickstart) and [Clerk for Express](https://clerk.com/docs/expressjs/getting-started/quickstart).

## API

The API listens on `127.0.0.1:4000` by default. Configure `HOST`, `PORT`, and `CORS_ORIGINS` in its environment.

| Endpoint                | Access                 | Response                                                                                                     |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `GET /health`           | Public                 | `200` with `{"status":"ok","service":"api"}`                                                                 |
| `GET /v1/me`            | Clerk session required | `200` with the verified `userId`; `503` before auth is configured; `401` when configured but unauthenticated |
| Unknown public endpoint | Public                 | JSON `404`                                                                                                   |

Authenticated browser clients send a token from Clerk's `getToken()` as `Authorization: Bearer <token>`. The API includes Helmet, an explicit browser-origin allowlist, and a 1 MB JSON request-body limit. Feature endpoints belong under `/v1`; administrative operations require additional authorization checks.

## Database and Neon

The database package includes an empty PostgreSQL schema and Prisma's Neon adapter. No cloud database is provisioned, no feature tables are defined, and no migrations are present.

When a feature needs persistence:

1. Set the pooled Neon `DATABASE_URL` and direct `DIRECT_URL` in `packages/db/.env` for CLI commands.
2. Set `DATABASE_URL` in the server environment of each application using the database.
3. Define models in `packages/db/prisma/schema.prisma`.
4. Generate the client and create the development migration:

```sh
pnpm db:generate
pnpm db:migrate --name first_feature
```

The CLI prefers `DIRECT_URL` and falls back to `DATABASE_URL`. Runtime code uses the pooled URL through `@prisma/adapter-neon`. Validate development migrations against a Neon development branch before production. Apply committed production migrations through `pnpm db:deploy`.

```ts
import { getDb } from "@workspace/db";

// Call in server code, after the required authentication and authorization.
const db = getDb();
```

`getDb()` lazily creates one client per process and reports a clear configuration error when `DATABASE_URL` is absent. Importing the package does not open a database connection. Keep it out of browser code and future Electron renderer bundles. The schema's generated client and compiled output are produced by the workspace build.

See the [Neon Prisma guide](https://neon.com/docs/guides/prisma).

## Shared UI and navigation

`@workspace/ui` exports source components and the shared Tailwind theme. Both Next.js apps compile this source directly. Current components include Button, Card, Badge, Input, Label, Field, Dialog, DropdownMenu, Separator, Skeleton, and GlobalNav.

```tsx
import { Button } from "@workspace/ui/components/button";
import { GlobalNav } from "@workspace/ui/components/global-nav";
```

`GlobalNav` supports:

- Consumer-owned branding, links, active item ID, and optional actions.
- Native anchor links or a router-specific link adapter.
- Configurable accessible navigation and mobile-menu labels.
- Responsive disclosure, Escape-to-close, focus restoration, and closing after link selection.

Each app's client-side `SiteNav` adapter owns its Next.js Link integration and pathname matching. The shared component owns presentation and interaction behavior. Its import boundary contains no Next.js route hooks or Clerk logic.

Add official shadcn components in the shared package:

```sh
pnpm dlx shadcn@latest add tabs --cwd packages/ui
```

Both app configurations route shared primitive imports to this package. Use the existing `@workspace/ui/lib/utils` helper for `cn` imports. Read [ui-registry.md](ui-registry.md) before extending visual patterns and update it when reusable conventions change. See [shadcn monorepo guidance](https://ui.shadcn.com/docs/monorepo).

## Testing and quality checks

A typical local verification sequence is:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

On a Linux CI image that also needs browser system libraries, use Playwright's `install --with-deps chromium` option. No CI workflow file is included yet.

Vitest is configured with server and UI projects. Tests cover API behavior, admin authorization policy, shared buttons, and navigation configuration/keyboard behavior. UI tests use jsdom and Testing Library; HTTP tests use Supertest.

Playwright starts its own production servers on ports **3000, 3001, and 4000**. Stop development servers using those ports first. The suite checks the shared dialog, active navigation, mobile keyboard behavior, admin setup, API health, and credentials-pending access boundaries. HTML reports are written to `playwright-report/`; traces are retained on first retry.

The smoke suite explicitly clears Clerk and database credentials. Clerk identity verification is mocked in policy unit tests. These checks do not establish that live sign-in or real database queries work; those integrations require credentials and their own verification.

## Bundle analysis

```sh
pnpm analyze
```

The web app uses `@next/bundle-analyzer` with an explicit Webpack analysis build. It produces static reports without opening a browser:

- `apps/web/.next/analyze/client.html`
- `apps/web/.next/analyze/nodejs.html`
- An edge report when the analyzer emits one.

Normal development and production builds use Turbopack. Generated reports are ignored by Git. Review analysis when adding significant client dependencies, and load specialized lesson tools on demand.

## Feature development with Spec Kit

Spec Kit 1.3.2 is installed with project-local Codex skills. The [constitution](.specify/memory/constitution.md) is the source of truth for project principles; [AGENTS.md](AGENTS.md) records practical coding-agent conventions.

Use these skills in a coding-agent chat opened in this repository, one step at a time:

```text
$speckit-specify Describe the learner outcome and acceptance criteria.
$speckit-clarify
$speckit-plan Describe implementation boundaries and the technical approach.
$speckit-tasks
$speckit-analyze
$speckit-implement
$speckit-converge
```

Clarify and analyze are used when relevant. Constitution changes use `$speckit-constitution`. Small maintenance or presentation changes can use a proportionate workflow, as described in the constitution.

Feature artifacts are created under `specs/` when a feature is specified. The installed workflow currently tracks its active feature with ignored checkout-local state; initialization does not create feature specs or branches. Optional Git workflow behavior is separate from feature state.

`pnpm specify` runs the pinned official CLI through `uvx` and requires uv/Python for CLI maintenance. The generated skills, scripts, templates, and constitution are committed so other checkouts can use the same workflow. See the [Spec Kit documentation](https://github.com/github/spec-kit/tree/v1.3.2).

## Learning content and visualizations

The intended content boundary separates:

| Information                                      | Proposed responsibility                                                           |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| Lesson prose and theory                          | Trusted authored content; MDX is a proposed format                                |
| Topic titles, difficulty, tags, and ordering     | Typed metadata with stable identifiers                                            |
| Example code and prepared animation states       | Typed lesson/scenario data                                                        |
| Playback, source highlighting, and visual panels | Reusable learning UI with topic-specific visualizers                              |
| Editable-code interpretation                     | A separately specified parser/generator with explicit supported syntax and limits |
| Progress, bookmarks, and saved answers           | Learner-owned state with a defined persistence policy                             |

These are design directions, not installed features. MDX rendering, CodeMirror, Acorn, curriculum models, and lesson generators are not included in the current application.

[VisualizeJS](https://visualizejs.com/) was studied as a reference for prepared visualizations, shared playback, and constrained AST-to-animation generation. Its [public source](https://github.com/tornike14/visualizejs) documents that architecture. This repository currently contains its own starter foundation, not imported VisualizeJS lesson code.

A proposed first feature is one complete JavaScript learning journey with an Event Loop lesson: topic navigation, source/state panels, explanations, accessible playback, and theory. An editable sandbox can follow once the shared lesson model is verified.

## Desktop and deployment direction

Electron is planned. There is no `apps/desktop` workspace, local renderer bundle, installer, signing configuration, auto-updater, or offline synchronization implementation yet.

Desktop specifications must decide whether the app loads a hosted experience or bundles an offline-capable renderer. Native integration belongs behind narrow, validated interfaces; database credentials and Clerk server secrets remain on the server. Browser verification does not establish packaged desktop behavior.

For a local production-mode check:

```sh
pnpm build
pnpm start
```

Hosted deployment is not automated in this repository. Web, admin, and API are separate runtime targets. Provide public frontend configuration during builds and server secrets at runtime. The API's default `HOST=127.0.0.1` is for local use; container deployments usually need an explicit network binding such as `0.0.0.0` and configured public frontend origins. Keep database generation/build output available to server consumers and apply migrations through a controlled release step once migrations exist.

## Roadmap and open decisions

Proposed delivery order:

1. Define the first JavaScript learning feature and its content contract.
2. Build the lesson shell and one verified Event Loop visualization.
3. Add more authored lessons through the shared topic/player interfaces.
4. Add an editable sandbox with explicit language coverage and error behavior.
5. Add account-backed progress and administration workflows as requirements settle.
6. Deliver and verify the chosen Electron distribution model.

Before dependent work, resolve the product decisions recorded in the constitution:

- Personal-learning scope versus a multi-user product.
- Online-only operation versus offline learning and synchronization.
- Initial desktop operating systems and distribution/update strategy.
- Repository-based curriculum authoring versus publishing from the admin app.

## Troubleshooting

| Symptom                                     | What to check                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| Unsupported Node or package-manager version | Run `nvm use` if available and use the pinned pnpm version                |
| A dev server cannot bind its port           | Free ports 3000, 3001, and 4000; stop an existing dev/test server         |
| Playwright reports a missing browser        | Run `pnpm exec playwright install chromium`                               |
| Playwright refuses to start a server        | Stop local development servers, run `pnpm build`, and retry               |
| A protected page shows setup information    | Supply both Clerk keys in that app's environment and restart              |
| Admin access is denied after sign-in        | Check the exact Clerk user ID in the server-side `ADMIN_USER_IDS` list    |
| API returns 503 for `/v1/me`                | Its Clerk configuration is incomplete                                     |
| API returns 401 for `/v1/me`                | Send a valid Clerk session token and check the configured origins         |
| Database access reports a missing URL       | Configure the consuming app's server environment, not only the DB package |
| New Prisma models are unavailable           | Run client generation and rebuild the database package                    |
| Newly installed skills are not visible      | Open the repository in a new coding-agent session                         |

## Project references and license

- [Project constitution](.specify/memory/constitution.md)
- [Agent conventions](AGENTS.md)
- [Shared UI patterns](ui-registry.md)
- [Turborepo documentation](https://turborepo.com/docs)
- [Next.js documentation](https://nextjs.org/docs)
- [GitHub Spec Kit](https://github.com/github/spec-kit)

A project license has not yet been selected.
