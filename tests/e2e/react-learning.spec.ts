import { expect, test } from "@playwright/test";

test("React Learn redirects canonically and withholds content before auth configuration", async ({
  page,
  request,
}) => {
  const response = await request.get("/react", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("/react/learn");
  for (const path of ["/react/learn", "/react/learn/use-effect-lifecycle"]) {
    await page.goto(path);
    await expect(
      page.getByText("Authentication setup", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /React Learn|useEffect lifecycle/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Learn", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("link", { name: "Practice", exact: true }),
    ).toHaveCount(0);
  }
});
