import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Use an isolated Neon branch and dedicated test account, never a personal session.
for (const path of [".env.test.local", "apps/web/.env.local"]) {
  if (existsSync(path)) process.loadEnvFile(path);
}
if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
  throw new Error(
    "Authenticated tests require Neon Auth in ignored environment files.",
  );
}
if (!process.env.NEON_TEST_USER_EMAIL || !process.env.NEON_TEST_USER_PASSWORD) {
  throw new Error(
    "Set NEON_TEST_USER_EMAIL and NEON_TEST_USER_PASSWORD for a dedicated development learner. No tests ran.",
  );
}
export default defineConfig({
  testDir: "./tests/e2e-auth",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    { name: "auth-setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "authenticated-chromium",
      testMatch: /(learning|tutor)\.spec\.ts/,
      dependencies: ["auth-setup"],
      use: { ...devices["Desktop Chrome"], storageState: ".auth/learner.json" },
    },
  ],
  webServer: {
    command:
      "pnpm --filter @workspace/web build && pnpm --filter @workspace/web start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 180000,
    env: {
      NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL,
      NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET,
    },
  },
});
