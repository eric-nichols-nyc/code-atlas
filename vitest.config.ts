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
            "apps/admin/src/lib/**/*.test.ts",
            "packages/db/src/**/*.test.ts",
          ],
        },
      },
      {
        test: {
          name: "ui",
          environment: "jsdom",
          include: ["packages/ui/src/**/*.test.ts"],
          setupFiles: ["./tests/setup.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: [
        "apps/api/src/app.ts",
        "apps/admin/src/lib/auth.ts",
        "packages/ui/src/components/button.tsx",
      ],
    },
  },
});
