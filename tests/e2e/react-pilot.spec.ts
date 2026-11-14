import { expect, test } from "@playwright/test";

test("production excludes React pilot pages and tutor execution", async ({
  page,
  request,
}) => {
  for (const path of [
    "/react/practice",
    "/react/practice/stale-closure-counter",
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "React TypeScript source" }),
    ).toHaveCount(0);
  }
  const response = await request.post(
    "/api/react/exercises/react.stale-closure-counter/tutor",
    {
      data: { code: "", question: "Help", history: [] },
    },
  );
  expect(response.status()).toBe(404);
});
