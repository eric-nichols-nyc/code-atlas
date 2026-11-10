import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Dedicated development identity only; this suite never borrows a real-user session.
for (const path of [".env.test.local", "apps/web/.env.local"]) {
  if (existsSync(path)) process.loadEnvFile(path);
}
const publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secret = process.env.CLERK_SECRET_KEY;
if (!publishable?.startsWith("pk_test_") || !secret?.startsWith("sk_test_")) {
  throw new Error(
    "Authenticated tests require development Clerk keys in ignored environment files.",
  );
}
if (!process.env.CLERK_TEST_USER_EMAIL) {
  throw new Error(
    "Set CLERK_TEST_USER_EMAIL to a dedicated existing development learner (no MFA/session tasks). No tests ran.",
  );
}
process.env.CLERK_PUBLISHABLE_KEY = publishable;
export default defineConfig({
  testDir: "./tests/e2e-auth",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    { name: "auth-setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "authenticated-chromium",
      testMatch: /learning\.spec\.ts/,
      dependencies: ["auth-setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".clerk/learner.json",
      },
    },
  ],
  webServer: {
    command:
      "pnpm --filter @workspace/web build && pnpm --filter @workspace/web start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 180000,
    env: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishable,
      CLERK_SECRET_KEY: secret,
    },
  },
});
