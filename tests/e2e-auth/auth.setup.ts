import { mkdir } from "node:fs/promises";
import { expect, test as setup } from "@playwright/test";

setup.describe.configure({ mode: "serial" });
setup("authenticate the dedicated development learner", async ({ page }) => {
  const email = process.env.NEON_TEST_USER_EMAIL;
  const password = process.env.NEON_TEST_USER_PASSWORD;
  if (!email || !password) throw new Error("Dedicated test learner is missing");
  await page.goto("/sign-in");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Your learning space" }),
  ).toBeVisible();
  await mkdir(".auth", { recursive: true });
  await page.context().storageState({ path: ".auth/learner.json" });
});
