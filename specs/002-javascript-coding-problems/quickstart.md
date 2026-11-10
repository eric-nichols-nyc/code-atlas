# Validation and review

Run pnpm install, pnpm dev. Web3000 and API4000 use the same Clerk development instance. Keep credentials in ignored env files; API needs CLERK_PUBLISHABLE_KEY/CLERK_SECRET_KEY. Web API_URL defaults to http://127.0.0.1:4000. No database/judge provider key needed.

pnpm --filter @workspace/web content:check; pnpm lint; pnpm typecheck; pnpm test; pnpm build. Stop dev stack before pnpm test:e2e so ports3000/4000 are free; restart afterward. Authenticated automation remains deferred by user, so manual signed-in proof must be recorded separately.

Open /learn/javascript → Start learning → /learn/javascript/sleep. Empty starter fails; async Promise + setTimeout solution passes Run/Submit. Edit sample millis and confirm Run uses it. Submit tests additional undisclosed cases. Verify immediate/rejected/missing/never-settled/infinite source fails without freezing page; subsequent valid request succeeds. Inspect session submissions, stale-code warnings and Reset code/layout separation.

Check no visualization/checkpoint, proper description/editor/results, both themes, resize handles, tutor close/reopen, 1440→390→1440 source/selection/result retention and no horizontal page overflow at320/390/768/1024/1280/1440. Report actual zoom/reduced-motion checks as unverified unless actually exercised. Inspect client bundle for private tests/QuickJS.

## Recorded results and workflow change

Root content check, lint, typecheck, 66 unit/component/runner tests across14files and production build passed. The existing signed-in browser proved empty starter Wrong Answer, edited async solution Run Accepted2/2, and Submit Accepted10/10. Source/result persisted at320/390/768/1024/1280/1440px with no horizontal document overflow, both themes, and actual session history. The visible samples measured approximately102ms/201ms in the full submission. Hidden values/logs were not displayed. Screenshot: outputs/002-javascript-coding-problems/sleep-run-submit.png.

The user requested a lighter feature-driven workflow after this implementation. The short working record is docs/features/javascript-coding-problems.md; detailed002artifacts are historical planning context. Full Spec Kit stages are optional under constitution2.0.0 and AGENTS.md. No further formal expansion is required for this slice. Authenticated automation remains deferred; actual zoom/media emulation and a new production-smoke run during this dev session remain unverified.
