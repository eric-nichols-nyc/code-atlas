# Next.js API consolidation

**Outcome:** Run Code Atlas as one Next.js application while retaining real judging,
Clerk identity, account progress and the current browser routes. **First review:**
Sleep can Run, Submit, flag, reload and restore executed code with no Express process.

## Scope and architecture

- Branch `refactor/nextjs-api`, from clean `main` at `610fa70`. Preserve local environments,
  database records and browser drafts. Commit and merge authorized after the completed review.
  Deployment remains outside this task.
- Keep `/api/problems/:problemId/:action` and `/api/practice-progress` as the browser contract.
  Route Handlers authenticate Clerk sessions and validate origin, payload size and inputs
  before calling feature-owned server services. Remove token forwarding, CORS and `/v1`.
- Move judging and private suites into `features/problems/server`; progress services into
  `features/catalog/server`. Guard privileged entry modules with `server-only`. Keep shared
  UI/contracts and existing Prisma models. Get the database client only after authentication.
- Preserve guest isolation, hidden-case privacy, watchdogs, concurrency/rate limits, aborts,
  verdicts, explicit persistence failures, ownership and latest-source ordering. Retain the
  existing disposable QuickJS-in-Node-Worker design, including the four current problems.
- Compile the worker and its adapters separately for native Node execution, and explicitly
  trace worker artifacts and QuickJS dependencies into the Next server output. Test development
  and production entry points; browser bundles must exclude the database, judge and private tests.
- Move runtime database configuration to ignored `apps/web/.env.local` without printing keys.
  Keep an ignored backup before removing `apps/api`. Update workspace dependencies, lockfile,
  tests, scripts, environment examples, README and architecture guidance.

**Deployment boundary:** Node.js 24 with a full Node worker runtime. Hosted deployment,
provider-specific function limits, distributed rate limiting and Electron remain later work.
Next Route Handler/output tracing references: [runtime](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#runtime),
[output tracing](https://nextjs.org/docs/app/api-reference/config/next-config-js/output),
[external packages](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages).

This user-authorized change supersedes guidance requiring a separate Express `/v1` boundary.
Server authorization and execution isolation remain mandatory. The constitution and agent
guidance will reflect the consolidated boundary; historical feature/spec records stay intact.

## Acceptance and checklist

- [x] Inspect status and current boundaries; create branch and brief.
- [x] Move worker/progress services and implement authenticated handlers without upstream fetch.
- [x] Verify Sleep Run/Submit and persistence through Next before removing Express.
- [x] Preserve all four judges, ownership, invalid-input and failure-path coverage.
- [x] Remove the API app, dependencies, stale runtime configuration and two-server test setup.
- [x] Verify public/auth gates, real worker execution, server tracing and client-bundle boundaries.
- [x] Run root checks, production browser tests and manual browser review; record results.

## Verification

Verified 2026-11-10:

- `pnpm install --frozen-lockfile`, Biome, root TypeScript and production builds passed.
  A second production build passed with Clerk/database credentials explicitly empty.
- `pnpm test`: **115 tests across 19 files passed**. Existing real judges and persistence
  policy tests moved with their services. Request-boundary tests now exercise Next handlers
  rather than Express and token forwarding. They cover identity/origin denial, forged owners
  and solved state, malformed/oversized input, per-user rate/concurrency limits, private Submit
  cases, persistence outages and source saving on execution failure.
- **28 credential-free production Playwright tests passed** using one Next server on 3100
  through an ignored copy of the root configuration. Development port 3000 stayed running.
- Signed-in manual Sleep review passed in both `next dev` and `next start`: real Run 2/2,
  Accepted Submit 10/10, saved-to-account status, flag/reload and restored source. Express
  was stopped before either flow and the API directory was absent during production review.
  Restored the original flag and preserved the existing saved source and user browser tab.
- The execution route's 287-file production trace includes the compiled worker/adapters and
  four QuickJS WASM assets. Scanned all 22 browser chunks: no private-suite, worker, judge
  persistence or Prisma markers. Source entry modules retain `server-only` guards.
- Runtime Neon settings moved to ignored web environment configuration with a private backup
  under `work/nextjs-api-baseline/`. No credentials were printed or tracked. Reused the existing
  isolated Neon development branch without schema changes or production migrations.
- README and architecture/agent guidance updated. Constitution 2.2.0 records the new boundary.
  Proof: `outputs/nextjs-api/sleep-production.png`. No hosted deployment or production migration.

Dedicated authenticated browser automation remains user-deferred. Hosted deployment and
provider-specific worker/function constraints remain unverified. Limits are process-local,
as before; multiple replicas would need a separate distributed-limit design.
