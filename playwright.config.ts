import { defineConfig, devices } from "@playwright/test";

// The starter smoke suite deliberately exercises the credentials-pending state.
const noCredentials = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
  CLERK_PUBLISHABLE_KEY: "",
  CLERK_SECRET_KEY: "",
  DATABASE_URL: "",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter @workspace/web start",
      url: "http://127.0.0.1:3000",
      env: noCredentials,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: "pnpm --filter @workspace/admin start",
      url: "http://127.0.0.1:3001",
      env: noCredentials,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: "pnpm --filter @workspace/api start",
      url: "http://127.0.0.1:4000/health",
      env: { ...noCredentials, PORT: "4000", HOST: "127.0.0.1" },
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
