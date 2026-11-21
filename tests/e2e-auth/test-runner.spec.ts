import { expect, test } from "@playwright/test";
import { mostFrequentCharacterProblem as problem } from "@workspace/problems";

test("test runner selects captured cases with keyboard access across themes and layouts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route(`**/api/practice-progress/${problem.id}`, (route) =>
    route.fulfill({ json: { record: null } }),
  );
  const requests: { action: string; code: string; inputs?: unknown[] }[] = [];
  await page.route(
    new RegExp(
      `/api/problems/${problem.id.replaceAll(".", "\\.")}/(run|submit)$`,
    ),
    async (route) => {
      const action = route.request().url().split("/").at(-1);
      const request = route.request().postDataJSON();
      requests.push({ action, ...request });
      const cases = (
        action === "run"
          ? request.inputs
          : problem.samples.map((sample) => sample.input)
      ).map((input: { str: string }, index: number) => ({
        id: `case-${index + 1}`,
        hidden: false,
        input,
        actual: index === 1 ? "x" : input.str === "" ? "" : "a",
        expected: index === 1 ? "b" : input.str === "" ? "" : "a",
        passed: index !== 1,
        verdict: index === 1 ? "wrong-answer" : "accepted",
        message:
          index === 1 ? "The returned character did not match." : "Matched.",
        logs: index === 1 ? ["second case output"] : [],
      }));
      if (action === "submit")
        cases.push({
          id: "hidden-1",
          hidden: true,
          passed: true,
          verdict: "accepted",
          message: "Hidden case passed.",
          logs: [],
        });
      await route.fulfill({
        json: {
          attemptId: `browser-${requests.length}`,
          action,
          verdict: "wrong-answer",
          passed: cases.length - 1,
          total: cases.length,
          cases,
        },
      });
    },
  );
  await page.goto(`/algorithms/practice/${problem.slug}`);
  const editor = page.getByRole("textbox", {
    name: "JavaScript solution",
    exact: true,
  });
  await expect(editor).toBeVisible();
  await expect(page.getByText("Loading saved code…")).toHaveCount(0);
  await editor.fill(problem.solution);
  await page.getByLabel("str =", { exact: true }).fill("ccaabbb");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("execution-verdict")).toHaveText(
    "Wrong Answer",
  );
  expect(requests[0]?.inputs?.[0]).toEqual({ str: "ccaabbb" });
  expect(requests[0]?.code).toBe(problem.solution);
  const first = page.getByRole("tab", { name: "Case 1 · Passed", exact: true });
  const second = page.getByRole("tab", {
    name: "Case 2 · Wrong Answer",
    exact: true,
  });
  const detail = () =>
    page.getByRole("tabpanel", { name: "Case 2 · Wrong Answer", exact: true });
  await expect(first).toHaveAttribute("aria-selected", "true");
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(detail().getByText('"abba"', { exact: true })).toBeVisible();
  await expect(
    detail().getByText("second case output", { exact: true }),
  ).toBeVisible();
  await expect(detail().getByText('"x"', { exact: true })).toBeVisible();
  await expect(detail().getByText('"b"', { exact: true })).toBeVisible();
  await expect(page.getByText('"ccaabbb"', { exact: true })).toHaveCount(0);

  await page.getByRole("tab", { name: "Testcase", exact: true }).click();
  await page.getByRole("button", { name: "Case 1", exact: true }).click();
  await page.getByLabel("str =", { exact: true }).fill("changed after running");
  await page.getByRole("tab", { name: "Test Result", exact: true }).click();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText(/Code or inputs changed/)).toBeVisible();

  for (const theme of ["Light", "Dark", "Brown"]) {
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await expect(second).toHaveAttribute("aria-selected", "true");
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(detail().getByText('"abba"', { exact: true })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await expect(editor).toContainText("function findMostFrequentChar(str)");
    const outputTabs = page.getByRole("tablist", {
      name: "Execution output",
      exact: true,
    });
    expect(
      await outputTabs.evaluate((element) => {
        if (!element.parentElement) return false;
        const parent = element.parentElement.getBoundingClientRect();
        const bounds = element.getBoundingClientRect();
        return bounds.left >= parent.left && bounds.right <= parent.right;
      }),
    ).toBe(true);
  }

  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1]).toEqual({ action: "submit", code: problem.solution });
  await expect(first).toHaveAttribute("aria-selected", "true");
  const hidden = page.getByRole("tab", {
    name: "Hidden case 4 · Passed",
    exact: true,
  });
  await hidden.click();
  await expect(
    page.getByText(
      /Inputs, output, expected values and console output are private/,
    ),
  ).toBeVisible();
  await expect(
    page.getByText("second case output", { exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
