import { expect, type Page, test } from "@playwright/test";
import { validAnagramProblem } from "@workspace/problems";

const workspace = "/algorithms/practice/valid-anagram";
const progressApi = "/api/practice-progress/algorithms.valid-anagram";
const notesApi = "/api/problems/algorithms.valid-anagram/notes";
const noOverflow = async (page: Page) =>
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

test("Algorithms discovery, copied lesson, filters, themes and pointer controls", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Explore Algorithms" }).click();
  await expect(page).toHaveURL(/\/algorithms\/practice$/);
  await expect(
    page.getByRole("link", { name: "Valid Anagram", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Algorithms Learn", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Arrays", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "Search modules" })
    .fill("  TWO POINTERS  ");
  await page.getByRole("combobox", { name: "Difficulty" }).click();
  await page.getByRole("option", { name: "Easy", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Two Pointers", exact: true }),
  ).toHaveAttribute("href", "/algorithms/learn/two-pointers");
  await page.screenshot({
    path: test.info().outputPath("algorithms-learn-desktop.png"),
  });
  await page.getByRole("link", { name: "Two Pointers", exact: true }).click();
  const walkthrough = page.getByRole("region", {
    name: "Find a pair in a sorted array",
    exact: true,
  });
  const visual = page.getByRole("region", {
    name: "Watch left and right find a pair",
    exact: true,
  });
  await walkthrough.getByRole("button", { name: "Next", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    walkthrough.getByText("Step 2 of 6", { exact: true }),
  ).toBeVisible();
  await visual.getByRole("button", { name: "Next", exact: true }).click();
  await expect(visual.getByText("Step 2 of 7", { exact: true })).toBeVisible();
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
      await expect(
        visual.getByText("Step 2 of 7", { exact: true }),
      ).toBeVisible();
    }
  }
  await walkthrough.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath("algorithms-lesson-mobile.png"),
  });
  await visual.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(visual.getByText("Step 1 of 7", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/algorithms\/learn$/);
  await page.getByRole("searchbox", { name: "Search modules" }).fill("missing");
  await expect(page.getByText("No modules match your filters.")).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Two Pointers", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("algorithms-learn-mobile.png"),
  });
});

test("Anagram edited Run, private Submit, saved code, flags and private notes", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const originalNotesResponse = await page.request.get(notesApi);
  expect(originalNotesResponse.status()).toBe(200);
  const originalNotes = await originalNotesResponse.json();
  const originalProgress = (await (await page.request.get(progressApi)).json())
    .record ?? { flagged: false, solvedAt: null };
  try {
    await page.goto("/algorithms/practice");
    await page.getByRole("tab", { name: "Two Pointers", exact: true }).click();
    await expect(
      page.getByRole("button", { name: /^(Unflag|Flag) Valid Anagram$/ }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: /^(Unflag|Flag) Valid Anagram$/ })
      .click();
    await expect
      .poll(
        async () =>
          (await (await page.request.get(progressApi)).json()).record.flagged,
      )
      .toBe(!originalProgress.flagged);
    await page
      .getByRole("link", { name: "Valid Anagram", exact: true })
      .click();
    await expect(
      page
        .getByRole("region", { name: "Problem description" })
        .locator('[data-slot="badge"]')
        .filter({ hasText: /^Two Pointers$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back", exact: true }),
    ).toHaveAttribute("href", "/algorithms/practice");
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toHaveCount(0);
    const editor = page.getByRole("textbox", {
      name: "JavaScript solution",
      exact: true,
    });
    await expect(editor).toBeVisible();
    await editor.fill("function isAnagram(s,t){return s.length===t.length}");
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await expect(page.getByTestId("execution-verdict")).toHaveText(
      "Wrong Answer",
    );
    expect(
      (await (await page.request.get(progressApi)).json()).record.solvedAt,
    ).toBe(originalProgress.solvedAt);
    await editor.fill(validAnagramProblem.solution);
    await page.getByRole("tab", { name: "Testcase", exact: true }).click();
    await page.getByRole("textbox", { name: "s =", exact: true }).fill("");
    await page.getByRole("textbox", { name: "t =", exact: true }).fill("");
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
    await expect(
      page.getByText('s = "", t = ""', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("false", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
    await expect
      .poll(
        async () =>
          (await (await page.request.get(progressApi)).json()).record.solvedAt,
      )
      .not.toBeNull();
    await expect(page.getByText(/^Saved to account ·/)).toBeVisible();
    await page.getByRole("tab", { name: "Notes", exact: true }).click();
    const noteEditor = page.getByRole("textbox", {
      name: "Your notes",
      exact: true,
    });
    await expect(noteEditor).toBeVisible();
    await noteEditor.fill(
      "Sort character copies, then compare with two forward pointers.",
    );
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Save", exact: true }),
    ).toBeDisabled();
    await expect
      .poll(async () =>
        JSON.stringify(
          (await (await page.request.get(notesApi)).json()).content,
        ),
      )
      .toContain("two forward pointers");
    await page.screenshot({
      path: test.info().outputPath("algorithms-workspace-desktop.png"),
    });
    await page.reload();
    await expect(editor).toHaveText(validAnagramProblem.solution, {
      useInnerText: true,
    });
    await page.getByRole("tab", { name: "Notes", exact: true }).click();
    await expect(noteEditor).toContainText("two forward pointers");
    await page.getByRole("tab", { name: "Problem", exact: true }).click();
    await page.setViewportSize({ width: 320, height: 900 });
    await noOverflow(page);
    await expect(editor).toHaveText(validAnagramProblem.solution, {
      useInnerText: true,
    });
    await page.screenshot({
      path: test.info().outputPath("algorithms-workspace-mobile.png"),
    });
    await page.getByRole("link", { name: "Back", exact: true }).click();
    await expect(page).toHaveURL(/\/algorithms\/practice$/);
    await expect(
      page.getByRole("img", {
        name: "Valid Anagram: solved in your account",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    await page.request.put(notesApi, {
      data: { content: originalNotes.content },
    });
    await page.request.patch(progressApi, {
      data: { flagged: originalProgress.flagged },
    });
  }
});

test("subject membership and unauthenticated Algorithms boundaries", async ({
  page,
  browser,
  baseURL,
}) => {
  for (const path of [
    "/algorithms/practice/sleep",
    "/javascript/practice/valid-anagram",
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "Problem unavailable", exact: true }),
    ).toBeVisible();
  }
  await page.goto("/algorithms/learn/not-published");
  await expect(
    page.getByRole("link", { name: "Back to Learn", exact: true }),
  ).toHaveAttribute("href", "/algorithms/learn");
  const anonymous = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  try {
    const visitor = await anonymous.newPage();
    await visitor.goto(workspace);
    await expect(visitor).toHaveURL(/\/sign-in/);
    const response = await anonymous.request.post(
      "/api/problems/algorithms.valid-anagram/run",
      { data: { code: validAnagramProblem.solution } },
    );
    expect(response.status()).toBe(401);
  } finally {
    await anonymous.close();
  }
});

test("Algorithms workspace preserves drafts through themes, tools and narrow layouts", async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(workspace);
  const editor = page.getByRole("textbox", {
    name: "JavaScript solution",
    exact: true,
  });
  const source = `${validAnagramProblem.solution}\n// Unsaved review draft`;
  await editor.fill(source);
  await page.getByRole("textbox", { name: "s =", exact: true }).fill("aab");
  await page.getByRole("textbox", { name: "t =", exact: true }).fill("aba");
  await page.getByRole("textbox", { name: "s =", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("textbox", { name: "t =", exact: true }),
  ).toBeFocused();
  await page.getByRole("tab", { name: "Notes", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Your notes", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Problem", exact: true }).click();
  // A second tab changes the existing theme preference without leaving the draft.
  const themePage = await context.newPage();
  await themePage.goto("/algorithms/learn");
  try {
    for (const theme of ["Light", "Dark", "Dark purple", "System"]) {
      await themePage
        .getByRole("button", { name: "Change theme", exact: true })
        .click();
      await themePage
        .getByRole("menuitemradio", { name: theme, exact: true })
        .click();
      for (const width of [1280, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(page.locator("html")).toHaveAttribute(
          "data-learning-workspace",
          width === 320 ? "flow" : "wide",
        );
        await noOverflow(page);
        await expect(editor).toHaveText(source, { useInnerText: true });
        await expect(
          page.getByRole("textbox", { name: "s =", exact: true }),
        ).toHaveValue("aab");
        await expect(
          page.getByRole("textbox", { name: "t =", exact: true }),
        ).toHaveValue("aba");
        if (width === 320)
          await page
            .getByRole("textbox", { name: "t =", exact: true })
            .scrollIntoViewIfNeeded();
        await page.screenshot({
          path: test
            .info()
            .outputPath(
              `algorithms-workspace-${theme.toLowerCase().replaceAll(" ", "-")}-${width}.png`,
            ),
        });
      }
    }
  } finally {
    await themePage.close();
  }
});
