# Project conventions

Read `README.md` for startup and credential setup. Read `ui-registry.md` before adding UI and `.specify/memory/constitution.md` when planning a feature.

- Keep Prisma imports in server code. Call `getDb()` at request time, after authentication and authorization, so builds stay independent of credentials.
- API feature endpoints belong under `/v1`, behind the shared authentication boundary. Administrative operations also verify admin authorization on the server.
- Public admin pages contain only navigation and setup information. Every internal page, Route Handler, and Server Action verifies its own session and admin authorization before accessing data; the proxy only initializes Clerk.
- Place reusable shadcn components in `packages/ui`. Both Next.js apps consume the same source and CSS theme.
- Keep actual credentials in ignored environment files. Track only empty examples.

For feature work, follow [feature-workflow](.agents/skills/feature-workflow/SKILL.md): one short brief, consistent feature folders, one working slice, browser review and relevant checks. Small fixes go directly to code. Spec Kit is optional when the user requests a formal workflow. The root package scripts are the source of truth for checks; production Playwright requires a completed build and free ports 3000 and 4000.
