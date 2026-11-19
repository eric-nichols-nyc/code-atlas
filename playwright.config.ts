import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL = `http://127.0.0.1:${port}`;

// The starter smoke suite deliberately exercises the credentials-pending state.
const noCredentials = {
  NEON_AUTH_BASE_URL: "",
  NEON_AUTH_COOKIE_SECRET: "",
  DATABASE_URL: "",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `pnpm --filter @workspace/web exec next start --port ${port}`,
      url: baseURL,
      env: noCredentials,
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
