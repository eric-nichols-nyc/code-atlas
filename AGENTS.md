# Project conventions

Read `README.md` for startup and credential setup. Read `ui-registry.md` before adding UI and `.specify/memory/constitution.md` when planning a feature.

- Keep Prisma imports in server code. Call `getDb()` at request time, after authentication and authorization, so builds stay independent of credentials.
- API endpoints are Next.js App Router Route Handlers under `apps/web/src/app/api`. Each protected handler verifies Neon Auth identity through the shared server boundary before calling feature-owned `server/` modules. Administrative operations also verify admin authorization on the server.
- Public admin pages contain only navigation and setup information. Every internal page, Route Handler, and Server Action verifies its own session and admin authorization before accessing data; the proxy handles Neon Auth cookies and redirects.
- Place reusable shadcn components in `packages/ui`; the Next.js app consumes their source and CSS theme.
- Keep judging/private suites in `features/problems/server` and account data access in `features/catalog/server`. Compile the isolated Node worker with the existing worker build script; privileged entry modules use `server-only`.
- Keep actual credentials in ignored environment files. Track only empty examples.

For feature work, follow [feature-workflow](.agents/skills/feature-workflow/SKILL.md): one short brief, consistent feature folders, one working slice, browser review and relevant checks. Small fixes go directly to code. Spec Kit is optional when the user requests a formal workflow. The root package scripts are the source of truth for checks; production Playwright requires a completed build and free port 3000.
