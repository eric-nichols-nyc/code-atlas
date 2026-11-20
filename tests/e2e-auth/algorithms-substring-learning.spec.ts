import { expect, test } from "@playwright/test";
import { longestSubstringTwoDistinctProblem as problem } from "@workspace/problems";

test("discovers Sliding Window, edits exact strings, runs and submits the new algorithm", async ({
  page,
}) => {
  await page.goto("/algorithms/practice");
  await page.getByRole("tab", { name: "Sliding Window", exact: true }).click();
  await page.getByRole("link", { name: problem.title, exact: true }).click();
  await expect(page).toHaveURL(`/algorithms/practice/${problem.slug}`);
  await expect(
    page
      .getByRole("region", { name: "Problem description" })
      .locator('[data-slot="badge"]')
      .filter({ hasText: /^Sliding Window$/ }),
  ).toBeVisible();
  const editor = page.getByRole("textbox", {
    name: "JavaScript solution",
    exact: true,
  });
  await editor.fill(problem.solution);
  const input = page.getByRole("textbox", { name: "s =", exact: true });
  await input.fill("");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(
    page.getByText(problem.inputError, { exact: true }),
  ).toBeVisible();
  await input.fill("aAaAb");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  await expect(page.getByText('s = "aAaAb"', { exact: true })).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Feedback", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  await expect(page.getByText(/^Saved to account ·/)).toBeVisible();
  const progress = await page.request.get(
    `/api/practice-progress/${problem.id}`,
  );
  expect((await progress.json()).record.solvedAt).not.toBeNull();
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
  await expect(editor).toHaveText(problem.solution, { useInnerText: true });
});
