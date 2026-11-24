import { expect, test } from "@playwright/test";
import { closuresVisualization } from "../../apps/web/src/content/javascript/learn/closures/visualization";

test("Closures keeps independent bindings after the factory returns", async ({
  context,
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/javascript/learn");
  await page.getByRole("tab", { name: "Scope", exact: true }).click();
  await page
    .getByRole("link", { name: "Closures", exact: true })
    .press("Enter");
  await expect(page).toHaveURL("/javascript/learn/closures");

  const player = page.getByRole("region", { name: "Closures", exact: true });
  const stack = player.getByRole("region", { name: "Call Stack" });
  const scopes = player.getByRole("region", { name: "Scope Chain" });
  const output = player
    .getByRole("region", { name: "Console Output" })
    .getByRole("listitem");
  const slider = player.getByRole("slider", { name: "Example step" });
  const theory = page.getByRole("region", { name: "What is a closure?" });
  const desk = scopes.getByRole("listitem").filter({ hasText: "· desk" });
  const door = scopes.getByRole("listitem").filter({ hasText: "· door" });

  await page.clock.install();
  await player
    .getByRole("button", { name: "Play", exact: true })
    .press("Enter");
  await page.clock.runFor(1600);
  await expect(
    stack.getByRole("heading", { name: "makeMeter() · desk" }),
  ).toBeVisible();
  await slider.press("ArrowRight");
  await page.clock.runFor(1600);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 3 of 12");
  await expect(stack.getByRole("heading", { level: 3 })).toHaveText(["Script"]);
  await expect(desk.getByText("Retained", { exact: true })).toBeVisible();
  await expect(desk.locator("dd")).toHaveText("10");

  for (let step = 3; step < 7; step++) await slider.press("ArrowRight");
  await expect(stack.getByRole("heading", { level: 3 })).toHaveText([
    "add() · desk",
    "Script",
  ]);
  await expect(desk.getByText("Retained · in use")).toBeVisible();
  await expect(desk.locator("dd")).toHaveText("12");
  await expect(door.locator("dd")).toHaveText("30");
  await expect(player.locator('[data-line="3"]')).toHaveAttribute(
    "data-active",
    "true",
  );

  const sandbox = await context.newPage();
  const actual: string[] = [];
  sandbox.on("console", (message) => actual.push(message.text()));
  await sandbox.addScriptTag({ content: closuresVisualization.source });
  await expect.poll(() => actual).toEqual(["12", "35", "15"]);
  await sandbox.close();
  await slider.press("End");
  await expect(output).toHaveText(actual);
  await expect(desk.locator("dd")).toHaveText("15");
  await expect(door.locator("dd")).toHaveText("35");
  await slider.press("ArrowLeft");
  await expect(output).toHaveText(["12", "35"]);

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
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 11 of 12");
  await player.getByRole("button", { name: "Restart" }).press("Enter");
  await expect(output).toHaveCount(0);
  expect(errors).toEqual([]);
});
