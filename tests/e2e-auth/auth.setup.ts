import { mkdir } from "node:fs/promises";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";

setup.describe.configure({ mode: "serial" });
setup("authenticate the dedicated development learner", async ({ page }) => {
  const emailAddress = process.env.CLERK_TEST_USER_EMAIL;
  if (!emailAddress) throw new Error("Dedicated test learner is missing");
  await clerkSetup();
  await page.goto("/");
  await clerk.signIn({ page, emailAddress });
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Your learning space" }),
  ).toBeVisible();
  await mkdir(".clerk", { recursive: true });
  await page.context().storageState({ path: ".clerk/learner.json" });
});
