import { expect, test } from "@playwright/test";

test("web renders shared components and opens the dialog", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Your workspace is ready", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preview components" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Shared UI, ready to use" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("web dashboard remains in setup mode before credentials", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(
    page.getByText("Authentication setup", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Build your first authenticated feature here."),
  ).toHaveCount(0);
});

test("global navigation follows the active web route", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(
    navigation.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    navigation.getByRole("button", { name: "Open navigation" }),
  ).toBeHidden();
  await navigation
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    navigation.getByRole("link", { name: "Dashboard", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByText("Authentication setup", { exact: true }),
  ).toBeVisible();
});

test("mobile navigation supports the keyboard and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const toggle = navigation.getByRole("button", {
    name: /^(Open|Close) navigation$/,
  });
  const home = navigation.getByRole("link", { name: "Home", exact: true });
  await expect(home).toBeHidden();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(home).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await navigation
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("admin runs separately and keeps the dashboard closed", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:3001");
  await expect(
    page.getByText("Admin workspace", { exact: true }),
  ).toBeVisible();
  const navigation = page.getByRole("navigation", {
    name: "Administration navigation",
  });
  await expect(
    navigation.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "Open admin dashboard" }).click();
  await expect(page.getByText("Admin setup", { exact: true })).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Dashboard", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Administrator access verified.")).toHaveCount(0);
});

test("API health works and protected endpoints fail closed", async ({
  request,
}) => {
  const health = await request.get("http://127.0.0.1:4000/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: "ok", service: "api" });
  const profile = await request.get("http://127.0.0.1:4000/v1/me");
  expect(profile.status()).toBe(503);
});
