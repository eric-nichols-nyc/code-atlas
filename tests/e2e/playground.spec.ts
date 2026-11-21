import { expect, test } from "@playwright/test";

test("Playground requires authentication configuration for the editor and runner", async ({
  page,
  request,
}) => {
  await page.goto("/javascript/playground");
  await expect(page.getByText("Authentication setup")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "JavaScript source" }),
  ).toHaveCount(0);
  const response = await request.post("/api/javascript/playground/run", {
    data: { code: 'console.log("hello")' },
  });
  expect(response.status()).toBe(503);
});
