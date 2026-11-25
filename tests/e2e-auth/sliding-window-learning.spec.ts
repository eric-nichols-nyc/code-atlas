import { expect, test } from "@playwright/test";

for (const subject of ["javascript", "algorithms"] as const) {
  test(`${subject} Learn opens the Sliding Window trace and code walkthrough`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const catalog = `/${subject}/learn`;
    await page.goto(catalog);
    await page.getByRole("tab", { name: "Arrays", exact: true }).click();
    await page
      .getByRole("link", { name: "Sliding Window", exact: true })
      .click();
    await expect(page).toHaveURL(`${catalog}/sliding-window`);
    await expect(
      page.getByRole("heading", { name: "Variable-size windows" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "When to Use Sliding Window" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("table", { name: "Sliding window strategies" })
        .getByRole("row"),
    ).toHaveCount(5);
    await expect(
      page
        .getByRole("table", { name: "Window state by problem" })
        .getByRole("row"),
    ).toHaveCount(8);
    await expect(
      page
        .getByRole("region", { name: "Quiz", exact: true })
        .getByRole("progressbar"),
    ).toHaveAttribute("max", "10");

    const trace = page.getByRole("region", {
      name: "Trace a fixed-size window",
    });
    const walkthrough = page.getByRole("region", {
      name: "Find the maximum window sum in JavaScript",
      exact: true,
    });
    const previous = trace.getByRole("button", {
      name: "Previous",
      exact: true,
    });
    const next = trace.getByRole("button", { name: "Next", exact: true });
    const slider = trace.getByRole("slider", { name: "Example step" });
    const expected = [
      { start: 0, sum: "Sum 6", best: "Best sum 6" },
      { start: 1, sum: "6 − 1 + 5 = 10", best: "Best sum 10" },
      { start: 2, sum: "10 − 3 + 4 = 11", best: "Best sum 11" },
      { start: 3, sum: "11 − 2 + 7 = 16", best: "Best sum 16" },
      { start: 3, sum: "Return 16", best: "Maximum window sum" },
    ];

    await expect(previous).toBeDisabled();
    for (const [index, frame] of expected.entries()) {
      await expect(slider).toHaveAttribute(
        "aria-valuetext",
        `Step ${index + 1} of 5`,
      );
      await expect(trace.getByText(frame.sum, { exact: true })).toBeVisible();
      await expect(trace.getByText(frame.best, { exact: true })).toBeVisible();
      expect(
        await trace
          .locator('[data-window-index][data-active="true"]')
          .evaluateAll((cells) =>
            cells.map((cell) => Number(cell.getAttribute("data-window-index"))),
          ),
      ).toEqual([frame.start, frame.start + 1, frame.start + 2]);
      if (index > 0 && index < 4) {
        await expect(trace.locator('[data-moving="Out"]')).toHaveAttribute(
          "data-window-index",
          String(frame.start - 1),
        );
        await expect(trace.locator('[data-moving="In"]')).toHaveAttribute(
          "data-window-index",
          String(frame.start + 2),
        );
        await expect(
          trace.getByText("sum -= values[left];", { exact: true }),
        ).toBeVisible();
      }
      if (index < 4) await next.press("Enter");
    }

    await expect(next).toBeDisabled();
    await expect(
      trace.getByText("return best;", { exact: true }),
    ).toBeVisible();
    await expect(
      walkthrough.getByText("Step 1 of 6", { exact: true }),
    ).toBeVisible();
    await walkthrough
      .getByRole("button", { name: "Next", exact: true })
      .press("Enter");
    await expect(walkthrough.locator('[data-line="6"]')).toHaveAttribute(
      "data-active",
      "true",
    );
    await previous.press("Enter");
    await slider.press("Home");
    await slider.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "2");
    await trace.evaluate((element) =>
      element.scrollIntoView({ block: "center" }),
    );
    await trace.screenshot({
      path: test.info().outputPath("sliding-window-desktop.png"),
    });

    await page.setViewportSize({ width: 320, height: 900 });
    for (const theme of ["Light", "Dark", "Brown", "System"]) {
      await page
        .getByRole("button", { name: "Change theme", exact: true })
        .click();
      await page
        .getByRole("menuitemradio", { name: theme, exact: true })
        .click();
      await expect(
        page.getByRole("menu", { name: "Change theme", exact: true }),
      ).toBeHidden();
      await expect(
        trace.getByText("6 − 1 + 5 = 10", { exact: true }),
      ).toBeVisible();
      await expect(
        walkthrough.getByText("Step 2 of 6", { exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(320);
      expect(
        await trace
          .locator("[data-window-index]")
          .evaluateAll((cells) =>
            cells.every((cell) => cell.getBoundingClientRect().width >= 24),
          ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 320, height: 1200 });
    await trace.evaluate((element) =>
      element.scrollIntoView({ block: "center" }),
    );
    await trace.screenshot({
      path: test.info().outputPath("sliding-window-mobile.png"),
    });
    await trace
      .getByRole("button", { name: "Restart", exact: true })
      .press("Enter");
    await expect(previous).toBeDisabled();
    await slider.press("End");
    await page.reload();
    await expect(slider).toHaveAttribute("aria-valuenow", "1");
    await expect(
      walkthrough.getByText("Step 1 of 6", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Back to Learn", exact: true })
      .click();
    await expect(page).toHaveURL(catalog);
  });
}

test("the Sliding Window quiz gives feedback, preserves expanded answers, and scores a full attempt", async ({
  page,
}) => {
  await page.goto("/algorithms/learn/sliding-window#quiz");
  const quiz = page.getByRole("region", { name: "Quiz", exact: true });
  const question = quiz.getByRole("heading", { level: 4 });
  const previous = quiz.getByRole("button", { name: "Previous", exact: true });
  const next = quiz.getByRole("button", { name: "Next", exact: true });
  const progress = quiz.getByRole("progressbar", { name: "Quiz position" });
  await expect(question).toHaveText(
    "Which selection is a window in [8, 4, 7, 2]?",
  );
  await expect(previous).toBeDisabled();
  await expect(next).toBeDisabled();
  await quiz.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await quiz.screenshot({ path: test.info().outputPath("quiz-desktop.png") });

  await quiz
    .getByRole("button", { name: "8 and 7", exact: true })
    .press("Enter");
  await expect(quiz.getByText("Incorrect", { exact: true })).toBeVisible();
  await expect(
    quiz.getByRole("button", { name: "4 followed by 7", exact: true }),
  ).toHaveAttribute("data-answer", "correct");
  await next.press("Enter");
  await expect(question).toBeFocused();
  await expect(progress).toHaveAttribute("value", "2");

  const expand = quiz.getByRole("button", { name: "Expand quiz" });
  await expand.click();
  const expanded = page.getByRole("dialog", { name: "Introduction Quiz" });
  await expanded
    .getByRole("button", { name: "Subtract 1 and add 5.", exact: true })
    .click();
  await expect(expanded.getByText("Correct", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(expanded).toBeHidden();
  await expect(expand).toBeFocused();
  await expect(quiz.getByText("Correct", { exact: true })).toBeVisible();
  await previous.click();
  await expect(quiz.getByText("Incorrect", { exact: true })).toBeVisible();
  await next.click();
  await next.click();

  await page.setViewportSize({ width: 320, height: 1000 });
  const strategyTable = page.getByRole("region", {
    name: "Sliding window strategies",
  });
  expect(
    await strategyTable.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await quiz.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await quiz.screenshot({ path: test.info().outputPath("quiz-mobile.png") });

  const remaining = [
    "Current sum 12 and best sum 16.",
    "Move it past a and the first b.",
    "Record it and shrink from the left while it stays valid.",
    "Across the whole scan, each edge only travels forward through the input once.",
    "Removing a negative value raises the sum.",
    "A 26-slot array of occurrence counts.",
    "The index of the largest value still in the window.",
    "A max-heap for the lower half and a min-heap for the upper half.",
  ];
  for (const [index, answer] of remaining.entries()) {
    await expect(progress).toHaveAttribute("value", String(index + 3));
    await quiz.getByRole("button", { name: answer, exact: true }).click();
    await expect(quiz.getByText("Correct", { exact: true })).toBeVisible();
    if (index < remaining.length - 1) await next.click();
  }
  await quiz.getByRole("button", { name: "Finish quiz" }).click();
  await expect(question).toHaveText("Quiz complete");
  await expect(quiz.getByText("9 of 10", { exact: true })).toBeVisible();
  await quiz.getByRole("button", { name: "Review answers" }).click();
  await expect(quiz.getByText("Incorrect", { exact: true })).toBeVisible();
  for (let index = 0; index < 9; index += 1) await next.click();
  await quiz.getByRole("button", { name: "Finish quiz" }).click();
  await quiz.getByRole("button", { name: "Restart quiz" }).click();
  await expect(progress).toHaveAttribute("value", "1");
  await expect(next).toBeDisabled();

  await quiz.getByRole("button", { name: "8 and 7", exact: true }).click();
  await page.reload();
  await expect(progress).toHaveAttribute("value", "1");
  await expect(next).toBeDisabled();
});
