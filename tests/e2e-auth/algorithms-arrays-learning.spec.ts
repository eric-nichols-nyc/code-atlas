import { expect, test } from "@playwright/test";
import {
  maxConsecutiveOnesProblem,
  moveZeroesProblem,
} from "@workspace/problems";

for (const { problem, topic, nums, output } of [
  {
    problem: moveZeroesProblem,
    topic: "Two Pointers",
    nums: "[0,-2,3,0,1]",
    output: "[-2,3,1,0,0]",
  },
  {
    problem: maxConsecutiveOnesProblem,
    topic: "Sliding Window",
    nums: "[0,0,0]",
    output: "0",
  },
]) {
  test(`discovers, runs, and submits ${problem.title}`, async ({ page }) => {
    await page.goto("/algorithms/practice");
    await page.getByRole("tab", { name: topic, exact: true }).click();
    await page.getByRole("link", { name: problem.title, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: problem.title }),
    ).toBeVisible();
    const editor = page.getByRole("textbox", {
      name: "JavaScript solution",
      exact: true,
    });
    await expect(page.getByText("Loading saved code…")).toBeHidden();
    await editor.fill(problem.solution);
    const input = page.getByRole("textbox", { name: "nums =", exact: true });
    const run = page.getByRole("button", { name: "Run", exact: true });
    await input.fill("[]");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await run.click();
    await expect(
      page
        .getByRole("region", { name: "Test cases and results" })
        .getByRole("alert"),
    ).toHaveText(problem.inputError);
    await input.fill(nums);
    await run.click();
    await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
    const caseDetails = page.getByRole("tabpanel", { name: "Case 1 · Passed" });
    await expect(caseDetails.getByText(nums, { exact: true })).toBeVisible();
    await expect(caseDetails.getByText(output, { exact: true })).toHaveCount(2);

    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await expect(page.getByText(/tests passed · Submit/)).toBeVisible();
    await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
    await expect(
      page.getByRole("tab", { name: /^Hidden case/ }).first(),
    ).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    await expect(page.locator("html")).toHaveAttribute(
      "data-learning-workspace",
      "flow",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
