import { defineConfig } from "@playwright/test";
import authConfig from "./playwright.auth.config";

// Reuse the dedicated learner/environment checks, never browser storageState.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "Authenticated desktop tests require a development DATABASE_URL.",
  );
}

export default defineConfig({
  ...authConfig,
  testDir: "./tests/e2e-desktop-auth",
  timeout: 90000,
  expect: { timeout: 15000 },
  retries: 0,
  projects: [
    { name: "authenticated-electron", testMatch: /progress\.spec\.ts/ },
  ],
  webServer: {
    command:
      "pnpm desktop:build && pnpm --filter @workspace/web build && pnpm --filter @workspace/web start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 180000,
    env: {
      NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL as string,
      NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET as string,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  },
});
