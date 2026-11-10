import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "server",
          environment: "node",
          include: [
            "apps/api/src/**/*.test.ts",
            "packages/db/src/**/*.test.ts",
            "apps/web/src/**/*.node.test.ts",
          ],
        },
      },
      ...["web"].map((app) => ({
        resolve: {
          alias: {
            "@": fileURLToPath(new URL(`./apps/${app}/src`, import.meta.url)),
          },
        },
        test: {
          name: `${app}-auth`,
          environment: "jsdom",
          include: [
            `apps/${app}/src/components/**/*.test.{ts,tsx}`,
            `apps/${app}/src/features/**/*.test.{ts,tsx}`,
          ],
          exclude: ["**/*.node.test.ts"],
          setupFiles: ["./tests/setup.ts"],
        },
      })),
      {
        test: {
          name: "ui",
          environment: "jsdom",
          include: ["packages/ui/src/**/*.test.{ts,tsx}"],
          setupFiles: ["./tests/setup.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["apps/api/src/app.ts", "packages/ui/src/components/button.tsx"],
    },
  },
});
