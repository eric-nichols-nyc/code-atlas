import { expect, type Page, test } from "@playwright/test";

const lessonPath = "/react/learn/use-effect-lifecycle";
const noOverflow = async (page: Page) =>
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

test("React discovery, Hooks filters and lifecycle walkthrough remain read-only", async ({
  page,
}) => {
  test.setTimeout(90000);
  const writes: string[] = [];
  page.on("request", (request) => {
    if (
      /\/api\/(problems|practice-progress|react\/exercises)/.test(
        request.url(),
      ) &&
      request.method() !== "GET"
    )
      writes.push(request.url());
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "Explore React JS", exact: true })
    .click();
  await expect(page).toHaveURL(/\/react\/learn$/);
  await expect(
    page.getByRole("heading", { name: "React Learn", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Learn", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("link", { name: "Practice", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("tab", { name: "Hooks", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Search modules" });
  await search.fill("  USEEFFECT  ");
  await expect(
    page.getByRole("link", { name: "useEffect lifecycle", exact: true }),
  ).toHaveAttribute("href", lessonPath);
  await page.getByRole("combobox", { name: "Difficulty" }).click();
  await page.getByRole("option", { name: "Hard", exact: true }).click();
  await expect(page.getByText("No modules match your filters.")).toBeVisible();
  await page.setViewportSize({ width: 320, height: 900 });
  await noOverflow(page);
  await expect(search).toHaveValue("  USEEFFECT  ");
  await page.getByRole("button", { name: "Change theme", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Light", exact: true }).click();
  await expect(
    page.getByRole("menu", { name: "Change theme", exact: true }),
  ).toBeHidden();
  await expect(search).toHaveValue("  USEEFFECT  ");
  await expect(page.getByText("No modules match your filters.")).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Hooks", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(search).toHaveValue("");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: test.info().outputPath("react-hooks-catalog-desktop.png"),
  });
  await page
    .getByRole("link", { name: "useEffect lifecycle", exact: true })
    .click();
  const walkthrough = page.getByRole("region", {
    name: "Keep a timer synchronized with delay",
    exact: true,
  });
  await expect(
    walkthrough.getByRole("button", { name: "Previous", exact: true }),
  ).toBeDisabled();
  await expect(
    walkthrough.getByRole("button", { name: "Restart", exact: true }),
  ).toBeDisabled();
  await walkthrough.getByRole("button", { name: "Next", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    walkthrough.getByText("Step 2 of 6", { exact: true }),
  ).toBeVisible();
  await expect(walkthrough.locator('[aria-live="polite"]')).toContainText(
    "dependency list",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of ["Light", "Dark", "Dark purple", "System"]) {
    await page
      .getByRole("button", { name: "Change theme", exact: true })
      .click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await expect(
      page.getByRole("menu", { name: "Change theme", exact: true }),
    ).toBeHidden();
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await noOverflow(page);
      await expect(
        walkthrough.getByText("Step 2 of 6", { exact: true }),
      ).toBeVisible();
    }
  }
  const source = walkthrough.getByRole("region", {
    name: "Keep a timer synchronized with delay JavaScript source",
    exact: true,
  });
  await source.focus();
  await expect(source).toBeFocused();
  expect(await source.evaluate((el) => getComputedStyle(el).overflowX)).toBe(
    "auto",
  );
  await page.keyboard.press("Tab");
  await expect(
    walkthrough.getByRole("button", { name: "Previous", exact: true }),
  ).toBeFocused();
  await walkthrough.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath("react-hooks-lesson-mobile.png"),
  });
  for (let step = 3; step <= 6; step++) {
    await walkthrough
      .getByRole("button", { name: "Next", exact: true })
      .click();
    await expect(
      walkthrough.getByText(`Step ${step} of 6`, { exact: true }),
    ).toBeVisible();
  }
  await expect(
    walkthrough.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await expect(
    walkthrough.locator('[data-active="true"][data-line="10"]'),
  ).toContainText("clearInterval");
  await walkthrough
    .getByRole("button", { name: "Restart", exact: true })
    .click();
  await expect(
    walkthrough.getByText("Step 1 of 6", { exact: true }),
  ).toBeVisible();
  await walkthrough.getByRole("button", { name: "Next", exact: true }).click();
  await page.reload();
  await expect(
    walkthrough.getByText("Step 1 of 6", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await walkthrough.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath("react-hooks-lesson-desktop.png"),
  });
  await expect(
    page.getByRole("button", { name: /^(Run|Submit|Done)$/ }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Back to Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/react\/learn$/);
  expect(writes).toEqual([]);
});

test("React direct access, foreign lessons, and anonymous sessions keep their boundaries", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto(lessonPath);
  await expect(
    page.getByRole("heading", { name: "useEffect lifecycle", exact: true }),
  ).toBeVisible();
  for (const slug of ["two-pointers", "not-published"]) {
    await page.goto(`/react/learn/${slug}`);
    await expect(
      page.getByRole("heading", { name: "Module unavailable", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to Learn", exact: true }),
    ).toHaveAttribute("href", "/react/learn");
  }
  const anonymous = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  try {
    const visitor = await anonymous.newPage();
    for (const path of ["/react/learn", lessonPath]) {
      await visitor.goto(path);
      await expect(visitor).toHaveURL(/\/sign-in/);
      await expect(
        visitor.getByRole("heading", {
          name: /React Learn|useEffect lifecycle/,
        }),
      ).toHaveCount(0);
    }
  } finally {
    await anonymous.close();
  }
});

test("production keeps React practice and obsolete prototype entry points unavailable", async ({
  page,
  request,
}) => {
  for (const path of [
    "/react/practice",
    "/react/practice/stale-closure-counter",
    "/react/prototype",
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", {
        name: "This page could not be found.",
        exact: true,
      }),
    ).toBeVisible();
  }
  for (const path of [
    "/api/react/exercises/react.stale-closure-counter/tutor",
    "/api/react-prototype/tutor",
  ]) {
    expect(
      (
        await request.post(path, {
          data: { code: "", question: "Help", history: [] },
        })
      ).status(),
    ).toBe(404);
  }
});
