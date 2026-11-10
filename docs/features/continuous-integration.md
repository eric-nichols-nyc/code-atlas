# Continuous integration

**Outcome:** Pull requests targeting `main` and pushes to `main` receive the same
repeatable code-quality checks. **First review:** one complete CI job defined in
`.github/workflows/ci.yml`.

## Scope and decisions

- One Ubuntu job uses Node.js 24 and the pnpm version declared by `packageManager`.
  Install with `pnpm install --frozen-lockfile`; cache the pnpm store using the lockfile.
- Run existing root scripts sequentially: `pnpm lint`, `pnpm typecheck`, `pnpm test`,
  and `pnpm build`. Retain their Turbo dependency ordering and configuration.
- Biome is the configured linter/formatter; ESLint is not installed or configured.
  The workflow uses Biome through `pnpm lint`; no package scripts are invented.
- Read-only repository contents permission, no persisted checkout credentials, pinned
  action commits, and cancellation of superseded runs on the same PR/ref.
- No secrets or live database are required. The default test script runs Vitest;
  Playwright and authenticated/live-service checks remain separate developer workflows.

**Later:** deployment, Docker, releases, remote Turbo caching, and other infrastructure.
There are no application UI changes, so browser review is not applicable.

## Acceptance and checklist

- [x] Inspect scripts, lockfile, Turbo setup, and existing repository changes.
- [x] Add one workflow with the required triggers, runtime, installation, and checks.
- [x] Document the Biome clarification and CI coverage in README.
- [x] Validate Actions syntax, action inputs, and that every command uses an existing script.
- [x] Verify frozen installation and all four checks without credentials.

## Verification

- `actionlint` 1.7.12 passed; checked triggers, permissions, concurrency, Node version,
  cache settings, exact commands, and inputs against all three pinned action versions.
- A clean snapshot without ignored environments or existing dependencies/builds installed
  successfully with Node 24.22.1, pnpm 11.25.0, and `--frozen-lockfile`. Lockfile/package/
  workspace/Turbo files remained unchanged. Validation used a local Node 24 launcher
  because the environment’s default pnpm wrapper invokes Node 20; CI explicitly sets 24.
- In that snapshot, all four root checks passed: Biome, TypeScript, **124 Vitest tests
  across 20 files**, and the production build. No application credentials were supplied.
- Existing feature work and local development servers are preserved. This record covers
  local macOS validation; GitHub-hosted execution and cache behavior are reported by the
  PR/main workflow runs.
