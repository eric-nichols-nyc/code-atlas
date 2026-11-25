import { expect, type Page, test } from "@playwright/test";
import {
  fibonacciGeneratorProblem,
  majorityElementProblem,
  sleepProblem,
} from "@workspace/problems";

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
test("Majority Element → edited Run → accepted Submit → restored code", async ({
  page,
}) => {
  await page.goto("/javascript/practice");
  await page.getByRole("tab", { name: "Arrays", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "Search problems" })
    .fill("majority");
  await page
    .getByRole("link", { name: "Majority Element", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Majority Element", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Majority Element on AlgoMaster" }),
  ).toHaveAttribute(
    "href",
    "https://algomaster.io/practice/dsa/majority-element?list=am-300",
  );
  await page
    .getByRole("textbox", { name: "JavaScript solution" })
    .fill(majorityElementProblem.solution);
  await page
    .getByRole("textbox", { name: "nums =", exact: true })
    .fill("[1,2]");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(
    page.getByText(majorityElementProblem.inputError, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "nums =", exact: true })
    .fill("[0,1,0]");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("3/3 tests passed · Run")).toBeVisible();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText("14/14 tests passed · Submit")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "JavaScript solution" }),
  ).toHaveText(majorityElementProblem.solution, { useInnerText: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    await page.screenshot({
      path: test.info().outputPath(`majority-element-${width}.png`),
      fullPage: true,
    });
  }
});
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
test("Practice and Learn remain separate routes", async ({ page }) => {
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
  await expect(
    page.getByRole("link", { name: "Two Pointers", exact: true }),
  ).toHaveAttribute("href", "/javascript/learn/two-pointers");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Practice", exact: true })
    .click();
  await expect(page).toHaveURL(/\/javascript\/practice$/);
});

test("slow learning navigation stays interactive and can be interrupted", async ({
  page,
}) => {
  let release!: () => void;
  const responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === "/javascript/learn",
    async (route) => {
      if (route.request().headers().rsc === "1") await responseGate;
      await route.continue().catch(() => {});
    },
  );
  try {
    await page.goto("/javascript/practice");
    await expect(
      page.getByRole("heading", { name: "JavaScript practice", exact: true }),
    ).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await nav.getByRole("link", { name: "Learn", exact: true }).click();
    await expect(
      nav.getByRole("status").filter({ hasText: /^Loading Learn…$/ }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "JavaScript practice", exact: true }),
    ).toBeVisible();
    await nav.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: "Your learning space", exact: true }),
    ).toBeVisible();
    await expect(nav.getByRole("status")).toHaveCount(0);
  } finally {
    release();
  }
});

test("learning catalog filters and opens the Two Pointers preview", async ({
  page,
}) => {
  await page.goto("/javascript/learn");
  await page.getByRole("tab", { name: "Arrays", exact: true }).focus();
  await page.keyboard.press("Enter");
  const search = page.getByRole("searchbox", { name: "Search modules" });
  await search.fill("  TWO POINTERS  ");
  await page.getByRole("combobox", { name: "Difficulty", exact: true }).click();
  await page.getByRole("option", { name: "Hard", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("0 modules");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(
    page.getByRole("tab", { name: "Arrays", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(search).toHaveValue("");
  await expect(page.getByRole("status")).toHaveText("1 module");
  await page.getByRole("link", { name: "Two Pointers", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/javascript\/learn\/two-pointers$/);
  await expect(
    page.getByRole("heading", { name: "Two Pointers", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Module preview", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Lesson outlines", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /^(Run|Submit)$/ }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Learn", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "Back to Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/javascript\/learn$/);
});

test("Two Pointers palindrome visualization moves, scrubs and survives themes and resizing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const progress = await (
    await page.request.get("/api/practice-progress")
  ).json();
  const writes: string[] = [];
  page.on("request", (request) => {
    if (
      /\/api\/(problems|practice-progress)/.test(request.url()) &&
      !["GET", "HEAD"].includes(request.method())
    )
      writes.push(request.url());
  });
  await page.goto("/javascript/learn/two-pointers");
  const visualization = page.getByRole("region", {
    name: "Trace the pointers in racecar",
    exact: true,
  });
  const conceptual = page.getByRole("region", {
    name: "Check a palindrome in JavaScript",
    exact: true,
  });
  const next = visualization.getByRole("button", { name: "Next", exact: true });
  const slider = visualization.getByRole("slider", {
    name: "Example step",
    exact: true,
  });
  const positions = [
    [0, 6],
    [0, 6],
    [1, 5],
    [2, 4],
    [3, 3],
  ];
  for (const [index, [left, right]] of positions.entries()) {
    await expect(
      visualization.getByText(`Step ${index + 1} of 5`, { exact: true }),
    ).toBeVisible();
    await expect(visualization.locator('[data-left="true"]')).toHaveAttribute(
      "data-character-index",
      String(left),
    );
    await expect(visualization.locator('[data-right="true"]')).toHaveAttribute(
      "data-character-index",
      String(right),
    );
    await expect(slider).toHaveAttribute("aria-valuenow", String(index + 1));
    await expect(
      conceptual.getByText("Step 1 of 6", { exact: true }),
    ).toBeVisible();
    const letter = "racecar"[left ?? 0];
    if (index > 0 && index < 4) {
      await expect(
        visualization.getByText(`“${letter}” = “${letter}”`, { exact: true }),
      ).toBeVisible();
      await expect(visualization.locator('[data-match="true"]')).toHaveCount(2);
    }
    if (index < 4) await next.press("Enter");
  }
  await expect(next).toBeDisabled();
  await expect(
    visualization.getByText("Return true", { exact: true }),
  ).toBeVisible();
  await expect(visualization.locator('[data-checked="true"]')).toHaveCount(6);
  await visualization
    .getByRole("button", { name: "Previous", exact: true })
    .press("Enter");
  await expect(
    visualization.getByText("Step 4 of 5", { exact: true }),
  ).toBeVisible();
  await visualization
    .getByRole("button", { name: "Restart", exact: true })
    .press("Enter");
  await expect(
    visualization.getByRole("button", { name: "Previous", exact: true }),
  ).toBeDisabled();
  await slider.press("End");
  await expect(slider).toHaveAttribute("aria-valuenow", "5");
  await slider.press("Home");
  await slider.press("ArrowRight");
  await slider.press("ArrowRight");
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["Light", "Dark", "Brown", "System"]) {
      await page
        .getByRole("button", { name: "Change theme", exact: true })
        .click();
      await page
        .getByRole("menuitemradio", { name: theme, exact: true })
        .click();
      await expect(
        visualization.getByText("Step 3 of 5", { exact: true }),
      ).toBeVisible();
      await expect(
        visualization.locator('[data-right="true"]'),
      ).toHaveAttribute("data-character-index", "5");
      await noOverflow(page);
      const fits = await visualization
        .locator("[data-character-index]")
        .evaluateAll((cells) =>
          cells.every(
            (cell) =>
              cell.getBoundingClientRect().width >= 24 &&
              cell.getBoundingClientRect().right <= innerWidth,
          ),
        );
      expect(fits).toBe(true);
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "Change theme", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click();
  await expect(
    page.getByRole("menu", { name: "Change theme", exact: true }),
  ).toBeHidden();
  await slider.press("End");
  await visualization.screenshot({
    path: test.info().outputPath("two-pointer-palindrome-desktop.png"),
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await visualization.screenshot({
    path: test.info().outputPath("two-pointer-palindrome-mobile.png"),
  });
  await page.reload();
  await expect(
    visualization.getByText("Step 1 of 5", { exact: true }),
  ).toBeVisible();
  await expect(visualization.locator('[data-right="true"]')).toHaveAttribute(
    "data-character-index",
    "6",
  );
  expect(writes).toEqual([]);
  expect(
    await (await page.request.get("/api/practice-progress")).json(),
  ).toEqual(progress);
});

test("guided walkthrough supports six steps, keyboard, restart and visit-only state", async ({
  page,
}) => {
  const progress = await (
    await page.request.get("/api/practice-progress")
  ).json();
  const writes: string[] = [];
  page.on("request", (request) => {
    if (
      /\/api\/(problems|practice-progress)/.test(request.url()) &&
      !["GET", "HEAD"].includes(request.method())
    )
      writes.push(`${request.method()} ${request.url()}`);
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/javascript/learn/two-pointers");
  const walkthrough = page.getByRole("region", {
    name: "Check a palindrome in JavaScript",
    exact: true,
  });
  const source = walkthrough.getByRole("region", {
    name: /JavaScript source$/,
  });
  const previous = walkthrough.getByRole("button", {
    name: "Previous",
    exact: true,
  });
  const next = walkthrough.getByRole("button", { name: "Next", exact: true });
  const restart = walkthrough.getByRole("button", {
    name: "Restart",
    exact: true,
  });
  await expect(
    walkthrough.getByText("Step 1 of 6", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("pre")).toHaveCount(1);
  await expect(walkthrough.locator("[data-line]")).toHaveCount(17);
  const original = await walkthrough.locator("code").textContent();
  await expect(previous).toBeDisabled();
  await expect(restart).toBeDisabled();
  await source.focus();
  await page.keyboard.press("Tab");
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  const lines = [[2, 3], [5], [6], [8], [9, 10], [13]];
  for (let step = 2; step <= 6; step += 1) {
    await expect(
      walkthrough.getByText(`Step ${step} of 6`, { exact: true }),
    ).toBeVisible();
    expect(
      await walkthrough
        .locator('[data-line][data-active="true"]')
        .evaluateAll((elements) =>
          elements.map((element) => Number(element.getAttribute("data-line"))),
        ),
    ).toEqual(lines[step - 1]);
    expect(await walkthrough.locator("code").textContent()).toBe(original);
    if (step < 6) await next.press("Enter");
  }
  await expect(next).toBeDisabled();
  await expect(walkthrough.locator('[aria-live="polite"]')).toContainText(
    "the pointers meet at e",
  );
  await expect(page).toHaveURL(/\/javascript\/learn\/two-pointers$/);
  await previous.press("Enter");
  await expect(
    walkthrough.getByText("Step 5 of 6", { exact: true }),
  ).toBeVisible();
  await restart.press("Space");
  await expect(
    walkthrough.getByText("Step 1 of 6", { exact: true }),
  ).toBeVisible();
  await expect(previous).toBeDisabled();
  await next.press("Enter");
  await page.reload();
  await expect(
    walkthrough.getByText("Step 1 of 6", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^(Run|Submit|Done)$/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Lesson outlines", exact: true }),
  ).toHaveCount(0);
  expect(writes).toEqual([]);
  expect(
    await (await page.request.get("/api/practice-progress")).json(),
  ).toEqual(progress);
});

test("guided walkthrough preserves its step through themes and responsive layouts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/javascript/learn/two-pointers");
  const walkthrough = page.getByRole("region", {
    name: "Check a palindrome in JavaScript",
    exact: true,
  });
  const source = walkthrough.getByRole("region", {
    name: /JavaScript source$/,
  });
  for (let i = 0; i < 3; i += 1)
    await walkthrough
      .getByRole("button", { name: "Next", exact: true })
      .click();
  const count = walkthrough.getByText("Step 4 of 6", { exact: true });
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["Light", "Dark", "Brown", "System"]) {
      await page
        .getByRole("button", { name: "Change theme", exact: true })
        .click();
      await page
        .getByRole("menuitemradio", { name: theme, exact: true })
        .click();
      await expect(count).toBeVisible();
      await expect(walkthrough.locator('[data-line="8"]')).toHaveAttribute(
        "data-active",
        "true",
      );
      await expect(walkthrough.locator('[data-line="1"]')).toHaveCSS(
        "opacity",
        "1",
      );
      await noOverflow(page);
      const codeBox = await source.boundingBox();
      const explanationBox = await walkthrough
        .locator('[aria-live="polite"]')
        .boundingBox();
      expect(codeBox).not.toBeNull();
      expect(explanationBox).not.toBeNull();
      if (!codeBox || !explanationBox)
        throw new Error("Walkthrough panels are missing");
      if (width === 1280)
        expect(explanationBox.x).toBeGreaterThan(codeBox.x + codeBox.width - 1);
      else
        expect(explanationBox.y).toBeGreaterThanOrEqual(
          codeBox.y + codeBox.height,
        );
    }
    if (width === 320) {
      expect(
        await source.evaluate(
          (element) => element.scrollWidth > element.clientWidth,
        ),
      ).toBe(true);
      await source.focus();
      await page.keyboard.press("ArrowRight");
      await expect
        .poll(() => source.evaluate((element) => element.scrollLeft))
        .toBeGreaterThan(0);
      await expect(count).toBeVisible();
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "Change theme", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click();
  await expect(
    page.getByRole("menu", { name: "Change theme", exact: true }),
  ).toBeHidden();
  await walkthrough.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath("two-pointers-walkthrough-desktop.png"),
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await walkthrough.getByRole("button", { name: "Next", exact: true }).focus();
  await page.screenshot({
    path: test.info().outputPath("two-pointers-walkthrough-mobile.png"),
  });
});

test("learning preview direct access, themes, responsive state and unavailable modules", async ({
  page,
}) => {
  await page.goto("/javascript/learn");
  const search = page.getByRole("searchbox", { name: "Search modules" });
  await search.fill("two");
  for (const theme of ["Light", "Dark", "Brown", "System"]) {
    await page
      .getByRole("button", { name: "Change theme", exact: true })
      .click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await expect(search).toHaveValue("two");
    await page.goto("/javascript/learn/two-pointers");
    await expect(
      page.getByRole("heading", { name: "Two Pointers", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page
      .getByRole("link", { name: "Back to Learn", exact: true })
      .click();
    await search.fill("two");
  }
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(search).toHaveValue("two");
    await noOverflow(page);
    await page.getByRole("link", { name: "Two Pointers", exact: true }).click();
    await noOverflow(page);
    await expect(page.locator("pre")).toContainText("function isPalindrome");
    await page
      .getByRole("link", { name: "Back to Learn", exact: true })
      .click();
    await search.fill("two");
  }
  await page.goto("/javascript/learn/not-published");
  await expect(
    page.getByRole("heading", { name: "Module unavailable", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/javascript\/learn$/);
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
  await page.getByRole("tab", { name: "Notes", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your notes" })).toBeVisible({
    timeout: 20000,
  });
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
      editor.locator("img,video,iframe,a[href^='javascript:']"),
    ).toHaveCount(0);
    await editor.fill("");
    await editor.pressSequentially("/heading");
    await expect(
      page.getByRole("option", { name: /^Heading 1/ }),
    ).toBeVisible();
    await editor.press("Enter");
    await editor.pressSequentially("Private notes check");
    await editor.press("Enter");
    await editor.pressSequentially("/code block");
    await expect(
      page.getByRole("option", { name: /^Code [Bb]lock/ }),
    ).toBeVisible();
    await editor.press("Enter");
    await editor.pressSequentially("const result = 0;");
    await form.getByRole("button", { name: "Save", exact: true }).click();
    await expect(form.getByRole("status")).toHaveText(/^Saved /);
    const stored = await (await page.request.get(notesApi)).json();
    expect(stored.content.formatVersion).toBe(2);
    expect(
      stored.content.document.blocks.map(
        (block: { type: string }) => block.type,
      ),
    ).toEqual(expect.arrayContaining(["heading", "codeBlock"]));
    expect(
      await (
        await page.request.get("/api/practice-progress/javascript.sleep")
      ).json(),
    ).toEqual(progress);
    await page.reload();
    await openNotes(page);
    await expect(
      editor.getByRole("heading", { name: "Private notes check" }),
    ).toBeVisible();
    await expect(editor.locator("pre")).toHaveText("const result = 0;");
    const problemTab = page.getByRole("tab", { name: "Problem", exact: true });
    await problemTab.click();
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
    await openNotes(page);
    await editor.fill("Unsaved note preserved across layouts");
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
      await expect(page.getByTestId("execution-verdict")).toHaveText(
        "Accepted",
      );
      await noOverflow(page);
      await expect(editor).toHaveCount(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await problemTab.click();
    await expect(
      page.getByRole("button", { name: "Hint 1", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("tab", { name: "Testcase", exact: true }).click();
    await expect(page.getByLabel("millis =", { exact: true })).toHaveValue(
      "25",
    );
    await page.getByRole("tab", { name: "Test Result", exact: true }).click();
    await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
    await openNotes(page);
    await expect(editor).toHaveText("Unsaved note preserved across layouts");
    await editor.fill("");
    await form.getByRole("button", { name: "Save", exact: true }).click();
    await expect(form.getByRole("status")).toHaveText(/^Saved /);
    await page.reload();
    await openNotes(page);
    await expect(editor).not.toContainText(
      "Unsaved note preserved across layouts",
    );
    await expect(
      form.getByRole("button", { name: "Save", exact: true }),
    ).toBeDisabled();
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
    await page.getByRole("tab", { name: "Notes", exact: true }).click();
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
  baseURL,
}) => {
  const counterApi = "/api/problems/javascript.counter/notes";
  await page.goto(path);
  const originals = await Promise.all(
    [notesApi, counterApi].map(async (api) =>
      (await page.request.get(api)).json(),
    ),
  );
  const run = Date.now();
  const fixtures = [
    ["sleep", `Sleep account notes fixture ${run}`],
    ["counter", `Counter account notes fixture ${run}`],
  ] as const;
  const fresh = await browser.newContext({
    baseURL,
    storageState: await page.context().storageState(),
  });
  try {
    for (const [problem, text] of fixtures) {
      await page.goto(`/javascript/practice/${problem}`);
      await openNotes(page);
      await page.getByRole("textbox", { name: "Your notes" }).fill(text);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(
        page.getByRole("form", { name: "Problem notes" }).getByRole("status"),
      ).toHaveText(/^Saved /);
    }
    const restored = await fresh.newPage();
    for (const [problem, text] of fixtures) {
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
      expect(await response.text()).not.toContain(fixtures[0][1]);
    }
  } finally {
    try {
      await Promise.all(
        [notesApi, counterApi].map((api, index) =>
          page.request.put(api, {
            data: { content: originals[index].content },
          }),
        ),
      );
    } finally {
      await fresh.close();
    }
  }
});
