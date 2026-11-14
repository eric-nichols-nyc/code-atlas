import { expect, type Page, test } from "@playwright/test";
import { fibonacciGeneratorProblem, sleepProblem } from "@workspace/problems";

const path = "/javascript/practice/sleep";
test("signed-in landing action opens Dashboard without the global header", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Start practicing", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Subjects to explore", exact: true }),
  ).toBeVisible();
});
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
test("Generators → Fibonacci → edited Run → accepted Submit → restored code", async ({
  page,
}) => {
  await page.goto("/javascript/practice");
  await page.getByRole("tab", { name: "Generators", exact: true }).click();
  await page
    .getByRole("link", { name: "Fibonacci Generator", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fibonacci Generator", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "JavaScript solution" })
    .fill(fibonacciGeneratorProblem.solution);
  await page.getByRole("spinbutton", { name: "count =" }).fill("50");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("3/3 tests passed · Run")).toBeVisible();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText("9/9 tests passed · Submit")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "JavaScript solution" }),
  ).toHaveText(fibonacciGeneratorProblem.solution, { useInnerText: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
});
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
  await page
    .getByRole("textbox", { name: "JavaScript solution" })
    .fill("async function sleep() {}");
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
    ).toHaveText(sleepProblem.solution, { useInnerText: true });
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

const notesApi = "/api/problems/javascript.sleep/notes";
async function openNotes(page: Page) {
  await page.getByRole("button", { name: "Show notes", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your notes" })).toBeVisible({
    timeout: 20000,
  });
}
async function selectNoteText(page: Page, text: string) {
  await page
    .getByRole("textbox", { name: "Your notes" })
    .evaluate(async (root, target) => {
      (root as HTMLElement).focus();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node && !node.textContent?.includes(target))
        node = walker.nextNode();
      if (!node) throw new Error("Expected note text is missing");
      const index = (node.textContent ?? "").indexOf(target);
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + target.length);
      const selection = window.getSelection();
      if (!selection) throw new Error("Selection is unavailable");
      selection.removeAllRanges();
      selection.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    }, text);
}

test("private formatted notes save, reload, survive tools/layout, and clear independently of progress", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(path);
  const response = await page.request.get(notesApi);
  expect(response.status()).toBe(200);
  const original = await response.json();
  let progress = await (
    await page.request.get("/api/practice-progress/javascript.sleep")
  ).json();
  try {
    await openNotes(page);
    const editor = page.getByRole("textbox", { name: "Your notes" });
    const form = page.getByRole("form", { name: "Problem notes" });
    await editor.fill("");
    await editor.evaluate((root) => {
      const data = new DataTransfer();
      data.setData(
        "text/html",
        '<p><b>Safe paste</b><span style="color:red"> text</span><a href="javascript:alert(1)"> link</a><img src="https://example.com/image.png"><iframe src="https://example.com/video"></iframe></p>',
      );
      data.setData("text/plain", "Safe paste text link");
      root.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: data,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    await expect(editor).toContainText("Safe paste");
    await expect(
      editor.locator("img,video,iframe,a[href^='javascript:'],[style]"),
    ).toHaveCount(0);
    await editor.fill(
      "Private notes check\nQuoted insight\nFirst step\nRemember this\nconst result = 0;\nReference",
    );
    await editor.press("ControlOrMeta+A");
    await editor.evaluate(async () => {
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    });
    await form
      .getByRole("button", { name: "Clear formatting", exact: true })
      .click();
    for (const [text, control] of [
      ["Private notes check", "Bold"],
      ["Private notes check", "Italic"],
      ["Quoted insight", "Blockquote"],
      ["First step", "Ordered list"],
      ["Remember this", "Bulleted list"],
      ["const result = 0;", "Code block"],
    ] as const) {
      await selectNoteText(page, text);
      const button = form.getByRole("button", { name: control, exact: true });
      if ((await button.getAttribute("aria-pressed")) !== "true")
        await button.click();
    }
    await selectNoteText(page, "Reference");
    await form
      .getByRole("button", { name: "Insert link", exact: true })
      .click();
    await form
      .getByRole("textbox", { name: "Link URL" })
      .fill("https://example.com/notes");
    await form.getByRole("button", { name: "Apply link", exact: true }).click();
    await form.getByRole("button", { name: "Save", exact: true }).click();
    await expect(form.getByRole("status")).toHaveText(/^Saved /);
    const stored = await (await page.request.get(notesApi)).json();
    expect(
      stored.content.document.ops.some(
        (op: { attributes?: { bold?: boolean; italic?: boolean } }) =>
          op.attributes?.bold && op.attributes?.italic,
      ),
    ).toBe(true);
    expect(
      await (
        await page.request.get("/api/practice-progress/javascript.sleep")
      ).json(),
    ).toEqual(progress);
    await page.reload();
    await openNotes(page);
    await expect(editor.locator("strong")).toHaveText("Private notes check");
    await expect(editor.locator("em")).toHaveText("Private notes check");
    await expect(editor.locator("blockquote")).toHaveText("Quoted insight");
    await expect(editor.locator('li[data-list="ordered"]')).toHaveText(
      "First step",
    );
    await expect(editor.locator('li[data-list="bullet"]')).toHaveText(
      "Remember this",
    );
    await expect(editor.locator(".ql-code-block")).toHaveText(
      "const result = 0;",
    );
    await expect(
      editor.getByRole("link", { name: "Reference" }),
    ).toHaveAttribute("href", "https://example.com/notes");
    await expect(
      editor.getByRole("link", { name: "Reference" }),
    ).toHaveAttribute("rel", "noopener noreferrer");
    await selectNoteText(page, "const result = 0;");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.type(" ");
    await page.keyboard.press("Tab");
    await expect(
      form.getByRole("button", { name: "Save", exact: true }),
    ).toBeFocused();
    await selectNoteText(page, "Private notes check");
    await form
      .getByRole("button", { name: "Clear formatting", exact: true })
      .click();
    await expect(editor.locator("strong,em")).toHaveCount(0);
    await solution(page);
    await page.getByLabel("millis =", { exact: true }).fill("25");
    await page.getByRole("button", { name: "Hint 1", exact: true }).click();
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
    progress = await (
      await page.request.get("/api/practice-progress/javascript.sleep")
    ).json();
    await page
      .getByRole("textbox", { name: "JavaScript solution" })
      .fill("// In-session code remains intact");
    await editor.fill("Unsaved note preserved across layouts");
    await editor.focus();
    await page.keyboard.press("Tab");
    await expect(
      form.getByRole("button", { name: "Save", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "Change theme", exact: true })
      .click();
    await page
      .getByRole("menuitemradio", { name: "Light", exact: true })
      .click();
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(editor).toHaveText("Unsaved note preserved across layouts");
      await expect(
        page.getByRole("textbox", {
          name: "JavaScript solution",
          includeHidden: true,
        }),
      ).toHaveText("// In-session code remains intact");
      await expect(
        page.getByRole("button", {
          name: "Hint 1",
          exact: true,
          includeHidden: true,
        }),
      ).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByTestId("execution-verdict")).toHaveText(
        "Accepted",
      );
      await noOverflow(page);
      await expect(editor).toHaveCount(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Close", exact: true }).click();
    const trigger = page.getByRole("button", {
      name: "Show notes",
      exact: true,
    });
    await expect(trigger).toBeFocused();
    await page.getByRole("tab", { name: "Testcase", exact: true }).click();
    await expect(page.getByLabel("millis =", { exact: true })).toHaveValue(
      "25",
    );
    await page.getByRole("tab", { name: "Test Result", exact: true }).click();
    await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
    await trigger.click();
    await expect(editor).toHaveText("Unsaved note preserved across layouts");
    await page.getByRole("tab", { name: "AI tutor", exact: true }).click();
    await page.getByRole("tab", { name: "Notes", exact: true }).click();
    await expect(editor).toHaveText("Unsaved note preserved across layouts");
    await editor.fill("");
    await form.getByRole("button", { name: "Save", exact: true }).click();
    await expect(form.getByRole("status")).toHaveText(/^Saved /);
    expect(
      (await (await page.request.get(notesApi)).json()).content.document.ops,
    ).toEqual([{ insert: "\n" }]);
    expect(
      await (
        await page.request.get("/api/practice-progress/javascript.sleep")
      ).json(),
    ).toEqual(progress);
    expect(
      await (await page.request.get("/api/practice-progress")).text(),
    ).not.toContain("Private notes check");
  } finally {
    await page.request.put(notesApi, { data: { content: original.content } });
  }
});

test("notes load/save failures retain the draft and support explicit recovery", async ({
  page,
}) => {
  await page.goto(path);
  const original = await (await page.request.get(notesApi)).json();
  let failRead = true,
    failWrite = true;
  await page.route(`**${notesApi}`, async (route) => {
    const method = route.request().method();
    if ((method === "GET" && failRead) || (method === "PUT" && failWrite)) {
      if (method === "GET") failRead = false;
      else failWrite = false;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Temporarily unavailable" }),
      });
    } else await route.continue();
  });
  try {
    await page.getByRole("button", { name: "Show notes", exact: true }).click();
    const form = page.getByRole("form", { name: "Problem notes" });
    await expect(
      form.getByRole("button", { name: "Save", exact: true }),
    ).toBeDisabled();
    await form.getByRole("button", { name: "Retry loading notes" }).click();
    const editor = page.getByRole("textbox", { name: "Your notes" });
    await expect(editor).toBeVisible();
    await editor.fill("Draft survives a failed save");
    await form.getByRole("button", { name: "Save", exact: true }).click();
    await expect(form.getByRole("status")).toHaveText("Not saved to account.");
    await expect(editor).toHaveText("Draft survives a failed save");
    await editor.fill("Retry sends the current draft");
    await form.getByRole("button", { name: "Retry saving notes" }).click();
    await expect(form.getByRole("status")).toHaveText(/^Saved /);
    await page.reload();
    await openNotes(page);
    await expect(editor).toHaveText("Retry sends the current draft");
  } finally {
    await page.unroute(`**${notesApi}`);
    await page.request.put(notesApi, { data: { content: original.content } });
  }
});

test("account notes stay problem-specific and restore in a fresh browser context", async ({
  page,
  browser,
}) => {
  const counterApi = "/api/problems/javascript.counter/notes";
  await page.goto(path);
  const originals = await Promise.all(
    [notesApi, counterApi].map(async (api) =>
      (await page.request.get(api)).json(),
    ),
  );
  const fresh = await browser.newContext({
    baseURL: "http://localhost:3000",
    storageState: await page.context().storageState(),
  });
  try {
    for (const [problem, text] of [
      ["sleep", "Sleep account notes fixture"],
      ["counter", "Counter account notes fixture"],
    ] as const) {
      await page.goto(`/javascript/practice/${problem}`);
      await openNotes(page);
      await page.getByRole("textbox", { name: "Your notes" }).fill(text);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(
        page.getByRole("form", { name: "Problem notes" }).getByRole("status"),
      ).toHaveText(/^Saved /);
    }
    const restored = await fresh.newPage();
    for (const [problem, text] of [
      ["sleep", "Sleep account notes fixture"],
      ["counter", "Counter account notes fixture"],
    ] as const) {
      await restored.goto(`/javascript/practice/${problem}`);
      await openNotes(restored);
      await expect(
        restored.getByRole("textbox", { name: "Your notes" }),
      ).toHaveText(text);
    }
    for (const publicPath of [
      "/javascript/practice",
      "/javascript/practice/sleep",
      "/api/practice-progress",
    ]) {
      const response = await page.request.get(publicPath);
      expect(await response.text()).not.toContain(
        "Sleep account notes fixture",
      );
    }
  } finally {
    await fresh.close();
    for (const [index, api] of [notesApi, counterApi].entries())
      await page.request.put(api, {
        data: { content: originals[index].content },
      });
  }
});
