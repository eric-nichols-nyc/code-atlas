import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// This online pilot is intentionally exercised against development, using only
// the dedicated test identity. Production exclusion is checked separately.
for (const path of [".env.test.local", "apps/web/.env.local"])
  if (existsSync(path)) process.loadEnvFile(path);
if (!process.env.NEON_TEST_USER_EMAIL || !process.env.NEON_TEST_USER_PASSWORD)
  throw new Error(
    "React pilot checks require a dedicated development learner.",
  );

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "auth-setup",
      testDir: "./tests/e2e-react",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "react-pilot",
      testDir: "./tests/e2e-react",
      testMatch: /react\.spec\.ts/,
      dependencies: ["auth-setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/learner-react.json",
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
