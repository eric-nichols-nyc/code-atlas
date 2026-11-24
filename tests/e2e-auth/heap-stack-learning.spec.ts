import { expect, test } from "@playwright/test";
import { heapStackVisualization } from "../../apps/web/src/content/javascript/learn/heap-stack/visualization";

const path = "/javascript/learn/heap-stack";

test("Heap & Stack traces calls, independent local values, and one shared object", async ({
  context,
  page,
}) => {
  await page.goto("/javascript/learn");
  await page.getByRole("tab", { name: "Memory", exact: true }).click();
  await page
    .getByRole("link", { name: "Heap & Stack", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(path);

  const player = page.getByRole("region", { name: "Heap & Stack Visualizer" });
  const stack = player.getByRole("region", { name: "Call Stack" });
  const heap = player.getByRole("region", { name: "Heap", exact: true });
  const output = player.getByRole("region", { name: "Console Output" });
  const source = player.getByRole("region", {
    name: "Heap and stack JavaScript source",
  });
  const active = source.locator('[data-active="true"]');
  const slider = player.getByRole("slider", { name: "Example step" });
  const scrub = async (step: number) => {
    await slider.press("Home");
    for (let index = 1; index < step; index++) await slider.press("ArrowRight");
  };

  await expect(stack.getByRole("heading", { level: 3 })).toHaveText(["Script"]);
  await expect(heap.getByText("No tracked objects")).toBeVisible();
  await expect(output.getByText("No output yet")).toBeVisible();

  await scrub(4);
  await expect(active).toHaveAttribute("data-line", "10");
  await expect(stack.locator("dd").filter({ hasText: "Object 1" })).toHaveCount(
    2,
  );
  await expect(heap.getByText("2 references", { exact: true })).toBeVisible();

  await scrub(7);
  await expect(active).toHaveAttribute("data-line", "3");
  await expect(stack.getByRole("heading", { level: 3 })).toHaveText([
    "increment()",
    "run()",
    "Script",
  ]);
  await expect(stack.getByRole("listitem").first()).toContainText("Top");
  await expect(
    stack.getByRole("listitem").nth(0).locator("dd").last(),
  ).toHaveText("2");
  await expect(
    stack.getByRole("listitem").nth(1).locator("dd").first(),
  ).toHaveText("1");
  await expect(heap.getByText("3 references", { exact: true })).toBeVisible();
  await expect(heap.locator("dd")).toHaveText("5");

  await scrub(10);
  await expect(stack.getByRole("heading", { level: 3 })).toHaveText([
    "run()",
    "Script",
  ]);
  await expect(heap.getByText("2 references", { exact: true })).toBeVisible();
  const sandbox = await context.newPage();
  const actualOutput: string[] = [];
  sandbox.on("console", (message) => actualOutput.push(message.text()));
  await sandbox.addScriptTag({ content: heapStackVisualization.source });
  await expect.poll(() => actualOutput).toEqual(["2 5", "1 5"]);
  await sandbox.close();
  await expect(output.getByRole("listitem")).toHaveText(actualOutput);

  await slider.press("End");
  await expect(stack.getByText("Stack empty")).toBeVisible();
  await expect(heap.getByText("Eligible for collection")).toBeVisible();
  await player.getByRole("button", { name: "Restart" }).press("Enter");
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 12");
  await expect(output.getByText("No output yet")).toBeVisible();
});

test("Heap & Stack shares playback and keeps theory full width", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(path);
  const player = page.getByRole("region", { name: "Heap & Stack Visualizer" });
  const slider = player.getByRole("slider", { name: "Example step" });
  const stack = player.getByRole("region", { name: "Call Stack" });
  const heap = player.getByRole("region", { name: "Heap", exact: true });
  const theory = page.getByRole("region", {
    name: "What are the heap and the stack?",
  });
  const panels = [
    theory,
    ...[
      "How calls and references work",
      "Common heap and stack mistakes",
      "Heap and stack interview questions",
      "Related JavaScript concepts",
    ].map((name) => page.getByRole("region", { name, exact: true })),
  ];
  const [stackBox, heapBox] = await Promise.all([
    stack.boundingBox(),
    heap.boundingBox(),
  ]);
  expect(stackBox?.y).toBe(heapBox?.y);
  expect(stackBox?.x ?? 0).toBeLessThan(heapBox?.x ?? 0);

  await page.clock.install();
  await player
    .getByRole("button", { name: "Play", exact: true })
    .press("Enter");
  await page.clock.runFor(1600);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 2 of 12");
  await slider.press("ArrowRight");
  await page.clock.runFor(1600);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 3 of 12");
  await expect(
    player.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const [playerBox, ...panelBoxes] = await Promise.all([
      player.boundingBox(),
      ...panels.map((panel) => panel.boundingBox()),
    ]);
    if (!playerBox || !panelBoxes[0])
      throw new Error("Expected the player and Theory to render.");
    expect(panelBoxes[0].y).toBeGreaterThanOrEqual(
      playerBox.y + playerBox.height,
    );
    for (const panel of panelBoxes) {
      expect(panel?.x).toBeCloseTo(playerBox.x);
      expect(panel?.width).toBeCloseTo(playerBox.width);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
  }

  await player
    .getByRole("link", { name: "Theory", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(/#heap-stack-theory$/);
  await expect(theory).toBeFocused();
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 3 of 12");
  expect(pageErrors).toEqual([]);
});
