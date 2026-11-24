import { expect, test } from "@playwright/test";

const runPath = "/api/javascript/playground/run";

test("opens Playground and runs real standalone scripts from the current draft", async ({
  page,
}) => {
  await page.goto("/javascript/practice");
  await page.getByRole("link", { name: "Playground", exact: true }).click();
  await expect(page).toHaveURL(/\/javascript\/playground$/);
  await expect(page.getByRole("heading", { name: "Playground" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Playground" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const editor = page.getByRole("textbox", { name: "JavaScript source" });
  const run = page.getByRole("button", { name: "Run", exact: true });
  const consolePanel = page.getByRole("region", { name: "Console" });
  const status = consolePanel.getByRole("status");
  const previous = consolePanel.getByText("Output is from your last run.");
  await expect(status).toHaveText("Ready");
  await expect(editor).toContainText("console.log(out)");

  await run.click();
  await expect(consolePanel.getByText("[4,8,12]")).toBeVisible();
  await expect(status).toHaveText("Finished");
  await editor.fill('console.log("changed draft")');
  await expect(previous).toBeVisible();
  await expect(consolePanel.getByText("[4,8,12]")).toBeVisible();
  await editor.press("ControlOrMeta+Enter");
  await expect(consolePanel.getByText("changed draft")).toBeVisible();
  await expect(previous).toBeHidden();

  await editor.fill("const = ;");
  await run.click();
  await expect(status).toHaveText("Error");
  await expect(consolePanel.getByText(/variable name/i)).toBeVisible();
  await expect(editor).toHaveText("const = ;");

  let release!: () => void;
  const holdResponse = new Promise<void>((resolve) => {
    release = resolve;
  });
  const script = 'setTimeout(() => console.log("captured snapshot"), 20)';
  await page.route(
    `**${runPath}`,
    async (route) => {
      const response = await route.fetch();
      await holdResponse;
      await route.fulfill({ response });
    },
    { times: 1 },
  );
  try {
    await editor.fill(script);
    await run.click();
    await expect(status).toHaveText("Running");
    await expect(run).toBeDisabled();
    await editor.fill('console.log("next snapshot")');
  } finally {
    release();
  }
  await expect(consolePanel.getByText("captured snapshot")).toBeVisible();
  await expect(previous).toBeVisible();
  await run.click();
  await expect(consolePanel.getByText("next snapshot")).toBeVisible();
  await expect(previous).toBeHidden();

  await page.getByRole("link", { name: "Learn", exact: true }).click();
  await page.getByRole("link", { name: "Playground", exact: true }).click();
  await expect(editor).toContainText("console.log(out)");
  await expect(status).toHaveText("Ready");
});

test("fills the desktop workspace and scrolls long output inside the console", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 800 });
  await page.goto("/javascript/playground");
  const editor = page.getByRole("region", { name: "script.js" });
  const consolePanel = page.getByRole("region", { name: "Console" });
  const initial = await consolePanel.boundingBox();
  expect(initial?.height).toBeGreaterThan(500);
  expect((await editor.boundingBox())?.height).toBe(initial?.height);

  await page
    .getByRole("textbox", { name: "JavaScript source" })
    .fill('for (let i = 1; i <= 40; i++) console.log("line " + i);');
  await page.getByRole("button", { name: "Run", exact: true }).click();
  const lastLine = consolePanel.getByText("line 40", { exact: true });
  await expect(lastLine).toBeAttached();
  expect((await consolePanel.boundingBox())?.height).toBe(initial?.height);
  await lastLine.scrollIntoViewIfNeeded();
  await expect(lastLine).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("keeps the Playground usable at 320 pixels and retains the draft on theme changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/javascript/playground");
  const editor = page.getByRole("textbox", { name: "JavaScript source" });
  await editor.fill("console.log('narrow layout')");
  const editorPanel = page.getByRole("region", { name: "script.js" });
  const consolePanel = page.getByRole("region", { name: "Console" });
  const editorBounds = await editorPanel.boundingBox();
  const consoleBounds = await consolePanel.boundingBox();
  expect(consoleBounds?.y).toBeGreaterThan(editorBounds?.y ?? Infinity);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  const learnLink = await page
    .getByRole("link", { name: "Learn" })
    .boundingBox();
  const playgroundLink = await page
    .getByRole("link", { name: "Playground" })
    .boundingBox();
  expect(learnLink?.y).toBe(playgroundLink?.y);

  for (const theme of ["Light", "Dark"]) {
    await page.getByRole("button", { name: "Change theme" }).click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await expect(editor).toHaveText("console.log('narrow layout')");
    await expect(page.locator("html")).toHaveClass(theme.toLowerCase());
  }
  await editor.press("Tab");
  await expect(editor).not.toBeFocused();
});

test("enforces the Run boundary with real authentication", async ({
  browser,
  page,
}) => {
  const anonymous = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  try {
    const visitor = await anonymous.newPage();
    await visitor.goto("/javascript/playground");
    await expect(visitor).toHaveURL(/\/sign-in(?:[/?]|$)/);
    expect(
      (await anonymous.request.post(runPath, { data: { code: "1" } })).status(),
    ).toBe(401);
  } finally {
    await anonymous.close();
  }

  await page.goto("/javascript/playground");
  expect(
    (
      await page.request.post(runPath, {
        data: { code: "1" },
        headers: { origin: "https://foreign.example" },
      })
    ).status(),
  ).toBe(403);
});
