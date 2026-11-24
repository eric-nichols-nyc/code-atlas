import { expect, test } from "@playwright/test";
import { generatorVisualization } from "../../apps/web/src/content/javascript/learn/generators/visualization";

const path = "/javascript/learn/generators";

test("Generators tracks next arguments, suspension, and completion", async ({
  context,
  page,
}) => {
  await page.goto("/javascript/learn");
  await page.getByRole("tab", { name: "Iteration", exact: true }).click();
  await page
    .getByRole("link", { name: "Generators & Iterators" })
    .press("Enter");
  await expect(page).toHaveURL(path);

  const player = page.getByRole("region", { name: "Generators & Iterators" });
  const state = player.getByRole("region", { name: "Generator State" });
  const flow = player.getByRole("region", { name: "Call Flow" });
  const output = player.getByRole("region", { name: "Console Output" });
  const source = player.getByRole("region", {
    name: "Generator JavaScript source",
  });
  const slider = player.getByRole("slider", { name: "Example step" });
  const logs = output.getByRole("listitem");

  await expect(state.getByText("Not created", { exact: true })).toBeVisible();
  await expect(flow.getByText("No next() calls yet")).toBeVisible();
  await slider.press("ArrowRight");
  await expect(state.getByText("Ready", { exact: true })).toBeVisible();
  await expect(state.locator("dl")).toHaveCount(0);
  await slider.press("ArrowRight");
  await expect(state.getByText("Running", { exact: true })).toBeVisible();
  await expect(logs).toHaveCount(0);
  await slider.press("ArrowRight");
  await expect(state.getByText("Suspended", { exact: true })).toBeVisible();
  await expect(logs).toHaveText(["{ value: 10, done: false }"]);
  await slider.press("ArrowRight");
  await expect(flow.getByText("cursor.next(5)", { exact: true })).toBeVisible();
  await expect(state.locator("dd")).toHaveText(["10", "5"]);
  await expect(source.locator('[data-line="3"]')).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(source.locator('[data-line="11"]')).toHaveAttribute(
    "data-active",
    "true",
  );
  await slider.press("ArrowRight");
  await expect(state.locator("dd")).toHaveText(["15", "5"]);
  await slider.press("ArrowRight");
  await expect(state.getByText("Suspended", { exact: true })).toBeVisible();
  await expect(logs).toHaveText([
    "{ value: 10, done: false }",
    "{ value: 15, done: false }",
  ]);
  await slider.press("End");
  await expect(state.getByText("Completed", { exact: true })).toBeVisible();
  await expect(flow.getByText("The body stays finished")).toBeVisible();

  const sandbox = await context.newPage();
  const results: Promise<{ value: unknown; done: boolean }>[] = [];
  sandbox.on("console", (message) => {
    const [result] = message.args();
    if (result) {
      results.push(result.evaluate(({ value, done }) => ({ value, done })));
    }
  });
  await sandbox.addScriptTag({ content: generatorVisualization.source });
  await expect.poll(() => results.length).toBe(4);
  const actual = await Promise.all(results);
  await sandbox.close();
  expect(actual).toEqual([
    { value: 10, done: false },
    { value: 15, done: false },
    { value: "complete", done: true },
    { value: undefined, done: true },
  ]);
  await expect(logs).toHaveText(
    actual.map(
      ({ value, done }) =>
        `{ value: ${JSON.stringify(value) ?? "undefined"}, done: ${done} }`,
    ),
  );

  await slider.press("ArrowLeft");
  await expect(logs).toHaveCount(3);
  await expect(flow.getByText('Returns "complete" and finishes')).toBeVisible();
  await player.getByRole("button", { name: "Restart" }).press("Enter");
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 10");
  await expect(output.getByText("No output yet")).toBeVisible();
});

test("Generators shares playback and keeps theory aligned at narrow widths", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(path);
  const player = page.getByRole("region", { name: "Generators & Iterators" });
  const slider = player.getByRole("slider", { name: "Example step" });
  const theory = page.getByRole("region", {
    name: "What are generators and iterators?",
  });
  const panels = [
    theory,
    ...[
      "How a generator runs",
      "Common generator mistakes",
      "Generator and iterator interview questions",
      "Related JavaScript concepts",
    ].map((name) => page.getByRole("region", { name, exact: true })),
  ];

  await page.clock.install();
  await player
    .getByRole("button", { name: "Play", exact: true })
    .press("Enter");
  await page.clock.runFor(1600);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 2 of 10");
  await slider.press("ArrowRight");
  await page.clock.runFor(1600);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 3 of 10");
  await expect(
    player.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();

  const state = player.getByRole("region", { name: "Generator State" });
  const flow = player.getByRole("region", { name: "Call Flow" });
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const [playerBox, stateBox, flowBox, ...panelBoxes] = await Promise.all([
      player.boundingBox(),
      state.boundingBox(),
      flow.boundingBox(),
      ...panels.map((panel) => panel.boundingBox()),
    ]);
    if (!playerBox || !stateBox || !flowBox || !panelBoxes[0]) {
      throw new Error("Expected all walkthrough panels to render.");
    }
    if (width === 1440) {
      expect(stateBox.y).toBeCloseTo(flowBox.y);
      expect(stateBox.x).toBeLessThan(flowBox.x);
    } else {
      expect(stateBox.x).toBeCloseTo(flowBox.x);
      expect(stateBox.y).toBeLessThan(flowBox.y);
    }
    expect(panelBoxes[0].y).toBeGreaterThanOrEqual(
      playerBox.y + playerBox.height,
    );
    for (const panel of panelBoxes)
      expect(panel?.width).toBeCloseTo(playerBox.width);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
  }

  await player
    .getByRole("link", { name: "Theory", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(/#generators-theory$/);
  await expect(theory).toBeFocused();
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 3 of 10");
  expect(pageErrors).toEqual([]);
});
