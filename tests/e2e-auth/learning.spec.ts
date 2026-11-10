import { expect, type Page, test } from "@playwright/test";
import { sleepProblem } from "@workspace/problems";

const path = "/javascript/practice/sleep";
async function solution(page: Page) {
  await page
    .getByRole("textbox", { name: "JavaScript solution" })
    .fill(sleepProblem.solution);
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("dashboard → JavaScript → editable Sleep problem", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Explore JavaScript" }).click();
  await expect(page).toHaveURL(/\/javascript\/practice$/);
  await expect(
    page.getByRole("heading", { name: "Recommended problems" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Async", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Async problems" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Sleep/ }).click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(
    page.getByRole("heading", { name: "Sleep", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Next step" })).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Back", exact: true }),
  ).toHaveAttribute("href", "/javascript/practice");
  await page.getByRole("link", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/\/javascript\/practice$/);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
});
test("Practice and future Learn remain separate routes", async ({ page }) => {
  await page.goto("/javascript/practice");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Learn", exact: true })
    .click();
  await expect(page).toHaveURL(/\/javascript\/learn$/);
  await expect(
    page.getByRole("heading", { name: "JavaScript Learn" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Explore practice problems" }).click();
  await expect(page).toHaveURL(/\/javascript\/practice$/);
});
test("real Run and Submit and source revisions", async ({ page }) => {
  await page.goto(path);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("execution-verdict")).toHaveText(
    "Wrong Answer",
  );
  await solution(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  await expect(page.getByText("2/2 tests passed · Run")).toBeVisible();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText("10/10 tests passed · Submit")).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("tab", { name: "Submissions", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  await page
    .getByRole("textbox", { name: "JavaScript solution" })
    .fill("async function sleep(){}");
  await expect(page.getByText(/Code or inputs changed/)).toBeVisible();
});
test("source/results survive resize and tools", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(path);
  await solution(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole("textbox", { name: "JavaScript solution" }),
    ).toHaveText(sleepProblem.solution);
    await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
    await noOverflow(page);
  }
  await page.getByRole("button", { name: "Show AI tutor" }).click();
  const before =
    (
      await page
        .getByRole("region", { name: "Problem description" })
        .boundingBox()
    )?.width ?? 0;
  await page.getByRole("button", { name: "Hide AI tutor" }).click();
  await expect
    .poll(async () =>
      Math.abs(
        ((
          await page
            .getByRole("region", { name: "Problem description" })
            .boundingBox()
        )?.width ?? 0) - before,
      ),
    )
    .toBeLessThanOrEqual(2);
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
});
