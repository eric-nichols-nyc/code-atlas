# Code Atlas desktop

Outcome: use Code Atlas in a native Electron window, with the existing Next.js
backend for Neon Auth, account progress and isolated JavaScript judging.
Branch: `feature/electron-desktop`. Existing uncommitted problem/skill work is retained.

First review: open the macOS app, interact with the public Counter example, then
open the same sign-in flow used by the website. Review one local app before distribution.

## Scope and decisions

- User chose an **online desktop client**. Local builds use localhost; a hosted HTTPS
  origin is needed for use on other computers. No deployed URL was supplied.
- `apps/desktop` owns native lifecycle, persistent cookies, navigation/permission
  policy and packaging. Web features stay in Next.js; no native judge or database client.
- Sandboxed renderer, context isolation, Node disabled, no preload or IPC bridge.
  Same-origin navigation only; safe external HTTPS links use the system browser.
  Native popups/downloads and permissions are denied except safe clipboard writes.
- Packaging copies an allowlist of three runtime modules and public config, then
  verifies the ASAR list. No `.env`, web/backend code, private suites or credentials.
- Initial auth path is Neon email/password and email codes, with a separate persistent
  desktop session. Google is explained as browser-only until native OAuth handoff exists.
  User-agent detection changes presentation only; server authorization is unchanged.
- `desktop:dev` starts/reuses the web server and cleans up only owned processes.
  It uses the existing Turbo dev task with `--webpack`: Turbopack repeatedly refreshed
  on this machine; Webpack allowed stable native interaction. Normal web scripts remain intact.
- First target is unsigned macOS Apple Silicon. Later: hosted deployment, signing,
  notarization, installers, updates, native Google OAuth, offline use/sync and other OS review.

## Acceptance and verification

- [x] New branch and existing changes retained. User authorized commit, pull request
  and merge into `main` on 2026-11-13; unrelated OpenSpec installation remains local.
- [x] Desktop TypeScript build, root lint/typecheck, credential-free production build.
- [x] Frozen pnpm installation; exact Electron/packaging versions in the lockfile.
- [x] Root Vitest: **320 tests / 31 files passed**. An existing oversized chunk-output
  test initially hit the execution timeout under load; its 46-test file and full suite
  both passed on recheck, without changing the test or weakening judging limits.
- [x] Production browser smoke: **44 passed** using the existing root script on port 3000.
- [x] Native fixture smoke: actual renderer preferences/Node isolation, denied popups,
  safe external navigation, session reuse after window recreation, failure/repeated retry.
- [x] Local `.app` packaging succeeds; ASAR matches the exact allowlist/public config.
- [x] Development native window loads Code Atlas; Counter click updates return value to 10.
- [x] Packaged native review: landing renders, Counter click returns 10, Start practicing
  opens the email/password form with the desktop Google explanation. Closing/reactivating
  recreates a window; Quit and reopening work. The app is left open with its local server.
- [x] Live Neon email/password sign-in in the packaged Electron app (2026-11-13):
  credentials from the ignored development environment were accepted, and the native
  window reached Dashboard. The user-reported login failure did not reproduce; no
  account/password or authentication-code changes were made. App left signed in.
- [ ] Authenticated Run/Submit and account restore after restarting Electron remain
  unverified. Successful sign-in does not establish judging or progress persistence.
- [ ] Hosted URL, signing/distribution, other operating systems: not configured/tested.

References: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security),
[session isolation](https://www.electronjs.org/docs/latest/api/session),
[packaging](https://electron.github.io/packager/main/),
[Google OAuth policy](https://developers.google.com/identity/protocols/oauth2/policies#use_secure_browsers).
