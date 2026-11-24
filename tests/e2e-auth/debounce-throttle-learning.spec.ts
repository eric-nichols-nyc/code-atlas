import { expect, test } from "@playwright/test";
import { timingExamples } from "../../apps/web/src/content/javascript/learn/debounce-throttle/visualization";

const path = "/javascript/learn/debounce-throttle";

test("Debounce and throttle produce different results for the same events", async ({
  context,
  page,
}) => {
  await page.goto("/javascript/learn");
  await page.getByRole("tab", { name: "Async", exact: true }).click();
  await page
    .getByRole("link", { name: "Debounce & Throttle", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(path);

  const player = page.getByRole("region", { name: "Debounce & Throttle" });
  const slider = player.getByRole("slider", { name: "Example step" });
  const debounce = player.getByRole("button", {
    name: "Debounce",
    exact: true,
  });
  const throttle = player.getByRole("button", {
    name: "Throttle",
    exact: true,
  });
  const timer = player.getByRole("region", { name: "Timer", exact: true });
  const timeline = player.getByRole("region", {
    name: "Timeline",
    exact: true,
  });
  const closure = player.getByRole("region", { name: "Closure State" });
  const output = player
    .getByRole("region", { name: "Console Output" })
    .getByRole("listitem");

  await expect(debounce).toHaveAttribute("aria-pressed", "true");
  await slider.press("ArrowRight");
  await expect(timer.locator("dd").first()).toHaveText("300 ms");
  await slider.press("ArrowRight");
  await expect(timer.locator("dd").first()).toHaveText("400 ms");
  await expect(closure.getByText('"ca"', { exact: true })).toBeVisible();
  await expect(output).toHaveCount(0);
  await slider.press("End");
  await expect(timeline.getByRole("listitem").last()).toContainText("780 ms");
  await expect(output).toHaveText(["cats"]);
  await slider.press("ArrowLeft");
  await expect(timer.locator("dd").first()).toHaveText("780 ms");
  await expect(output).toHaveCount(0);

  await page.clock.install();
  await player
    .getByRole("button", { name: "Play", exact: true })
    .press("Enter");
  await expect(
    player.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await throttle.press("Enter");
  await page.clock.runFor(3200);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 7");
  await expect(throttle).toHaveAttribute("aria-pressed", "true");
  await expect(debounce).toHaveAttribute("aria-pressed", "false");
  await expect(
    player.getByRole("region", { name: "Throttle JavaScript source" }),
  ).toContainText("function throttle");
  await expect(timeline.getByText("No input events yet")).toBeVisible();
  await expect(timer.getByText("Window open")).toBeVisible();
  await expect(closure.locator("dd")).toHaveText("false");
  await expect(output).toHaveCount(0);

  await slider.press("ArrowRight");
  await expect(output).toHaveText(["c"]);
  await slider.press("ArrowRight");
  await expect(timeline.getByText("Skipped input")).toBeVisible();
  await expect(timer.locator("dd").first()).toHaveText("300 ms");
  await expect(closure.locator("dd")).toHaveText("true");
  await slider.press("End");
  await expect(timeline.getByText("Skipped input")).toHaveCount(2);
  await expect(output).toHaveText(["c", "cats"]);
  await expect(timer.getByText("Window open")).toBeVisible();

  for (const [example, expected] of [
    [timingExamples[0], ["cats 780"]],
    [timingExamples[1], ["c 0", "cats 480"]],
  ] as const) {
    const sandbox = await context.newPage();
    const actual: string[] = [];
    sandbox.on("console", (message) => actual.push(message.text()));
    await sandbox.clock.install({ time: 0 });
    await sandbox.clock.pauseAt(1000);
    await sandbox.addScriptTag({
      content: `
      const start = Date.now();
      const log = console.log.bind(console);
      console.log = (value) => log(value, Date.now() - start);
      ${example.source}
    `,
    });
    await sandbox.clock.runFor(1000);
    await expect.poll(() => actual).toEqual(expected);
    await sandbox.close();
  }
});

test("Timing theory fills the workbench width and preserves the selected step", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(path);
  const player = page.getByRole("region", { name: "Debounce & Throttle" });
  const slider = player.getByRole("slider", { name: "Example step" });
  const theory = page.getByRole("region", {
    name: "What are debounce and throttle?",
  });
  await slider.press("ArrowRight");

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const [playerBox, theoryBox] = await Promise.all([
      player.boundingBox(),
      theory.boundingBox(),
    ]);
    expect(theoryBox?.width).toBeCloseTo(playerBox?.width ?? 0);
    expect(theoryBox?.x).toBeCloseTo(playerBox?.x ?? 0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
  }

  await player
    .getByRole("link", { name: "Theory", exact: true })
    .press("Enter");
  await expect(theory).toBeFocused();
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 2 of 6");
  await player.getByRole("button", { name: "Restart" }).press("Enter");
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 6");
  expect(errors).toEqual([]);
});
