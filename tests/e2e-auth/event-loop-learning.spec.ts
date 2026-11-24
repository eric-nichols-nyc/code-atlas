import { expect, test } from "@playwright/test";

const path = "/javascript/learn/event-loop";

test("Event Loop theory follows the visualizer and preserves the current step", async ({
  page,
}) => {
  await page.goto(path);
  const visualizer = page.getByRole("region", {
    name: "Event Loop Visualizer",
  });
  const theory = page.getByRole("region", {
    name: "What is the JavaScript event loop?",
  });
  const slider = visualizer.getByRole("slider", { name: "Example step" });
  const [visualizerBox, theoryBox] = await Promise.all([
    visualizer.boundingBox(),
    theory.boundingBox(),
  ]);
  if (!visualizerBox || !theoryBox)
    throw new Error("Expected the visualizer and theory to be visible.");
  expect(theoryBox.y).toBeGreaterThanOrEqual(
    visualizerBox.y + visualizerBox.height,
  );
  expect(theoryBox.x).toBeCloseTo(visualizerBox.x);
  expect(theoryBox.width).toBeCloseTo(visualizerBox.width);

  await slider.press("ArrowRight");
  await visualizer
    .getByRole("link", { name: "Theory", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(/#event-loop-theory$/);
  await expect(theory).toBeFocused();
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 2 of 13");
  await expect(
    theory.getByRole("link", { name: "JavaScript event loop on MDN" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "How the event loop works" })
      .getByRole("listitem"),
  ).toHaveCount(4);
  await expect(
    page
      .getByRole("region", { name: "Common event loop mistakes" })
      .getByRole("heading", { level: 3 }),
  ).toHaveCount(3);
  const questions = page.getByRole("region", {
    name: "Event loop interview questions",
  });
  await expect(questions.getByRole("heading", { level: 3 })).toHaveCount(4);
  await expect(questions.locator("pre")).toContainText('console.log("script")');
  await expect(
    page
      .getByRole("region", { name: "Related JavaScript concepts" })
      .getByRole("link"),
  ).toHaveCount(5);
});

test("Event Loop shows a ready timer waiting for both microtasks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/javascript/learn");
  await page.getByRole("tab", { name: "Async", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Async modules" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Event Loop", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(/\/javascript\/learn\/event-loop$/);

  const example = page.getByRole("region", {
    name: "Event Loop Visualizer",
  });
  const source = example.getByRole("region", {
    name: "Event loop JavaScript source",
  });
  const line = source.locator('[data-active="true"]');
  const slider = example.getByRole("slider", { name: "Example step" });
  const step = example.locator('[aria-live="polite"]');
  const lane = (name: string) =>
    example.getByRole("region", { name, exact: true });
  const consoleEntries = lane("Actual Output").getByRole("listitem");
  const next = example.getByRole("button", { name: "Next", exact: true });
  const previous = example.getByRole("button", {
    name: "Previous",
    exact: true,
  });
  const restart = example.getByRole("button", { name: "Restart", exact: true });

  await expect(example.locator('[aria-live="polite"]')).toHaveCount(1);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 13");
  await expect(previous).toBeDisabled();
  await expect(restart).toBeDisabled();
  await expect(consoleEntries).toHaveCount(0);
  await next.press("Enter");
  await next.press("Enter");
  await expect(step).toContainText("Step 3 of 13");
  await expect(line).toHaveAttribute("data-line", "3");
  await expect(lane("Web APIs")).toContainText("Timer callback");
  await expect(lane("Macrotask Queue").getByRole("listitem")).toHaveCount(0);

  for (let index = 0; index < 4; index++) await slider.press("ArrowRight");
  await expect(line).toHaveAttribute("data-line", "7");
  await expect(lane("Call Stack").getByRole("listitem")).toHaveCount(0);
  await expect(lane("Microtask Queue")).toContainText("Promise reaction");
  await expect(lane("Macrotask Queue")).toContainText("Timer callback");
  await next.press("Enter");
  await expect(lane("Call Stack")).toContainText("Promise reaction");
  await expect(lane("Macrotask Queue")).toContainText("Timer callback");
  await next.press("Enter");
  await expect(line).toHaveAttribute("data-line", "9");
  await expect(lane("Microtask Queue")).toContainText("Follow-up microtask");
  await expect(lane("Macrotask Queue")).toContainText("Timer callback");
  await next.press("Enter");
  await expect(line).toHaveAttribute("data-line", "10");
  await expect(lane("Call Stack")).toContainText("Follow-up microtask");
  await expect(lane("Macrotask Queue")).toContainText("Timer callback");
  await expect(consoleEntries).toHaveCount(4);
  await previous.press("Enter");
  await expect(line).toHaveAttribute("data-line", "9");
  await expect(lane("Microtask Queue")).toContainText("Follow-up microtask");
  await expect(consoleEntries).toHaveCount(3);

  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 1280) {
      await page.evaluate(() => window.scrollTo(0, 0));
      const output = lane("Output and prediction");
      const [mainBox, visualizerBox, sourceBox, runtimeBox, outputBox] =
        await Promise.all([
          page.getByRole("main").boundingBox(),
          example.boundingBox(),
          source.boundingBox(),
          lane("Runtime").boundingBox(),
          output.boundingBox(),
        ]);
      if (!mainBox || !visualizerBox || !sourceBox || !runtimeBox || !outputBox)
        throw new Error("Expected all three Event Loop columns to be visible.");
      expect(mainBox.width).toBe(width);
      expect(sourceBox.x + sourceBox.width).toBeLessThanOrEqual(
        runtimeBox.x + 1,
      );
      expect(runtimeBox.x + runtimeBox.width).toBeLessThanOrEqual(
        outputBox.x + 1,
      );
      const consoleBox = await lane("Actual Output").boundingBox();
      if (!consoleBox) throw new Error("Expected Actual Output to be visible.");
      const visualizerBottom = visualizerBox.y + visualizerBox.height;
      expect(visualizerBottom).toBeGreaterThan(850);
      expect(
        visualizerBottom - consoleBox.y - consoleBox.height,
      ).toBeLessThanOrEqual(2);
      const prediction = output.getByRole("region", {
        name: "Output Prediction",
      });
      const [
        stack,
        apis,
        loop,
        microtasks,
        macrotasks,
        predictionBox,
        guessBox,
      ] = await Promise.all([
        lane("Call Stack").boundingBox(),
        lane("Web APIs").boundingBox(),
        lane("Event Loop").boundingBox(),
        lane("Microtask Queue").boundingBox(),
        lane("Macrotask Queue").boundingBox(),
        prediction.boundingBox(),
        prediction.getByRole("list", { name: "Your prediction" }).boundingBox(),
      ]);
      if (
        !stack ||
        !apis ||
        !loop ||
        !microtasks ||
        !macrotasks ||
        !predictionBox ||
        !guessBox
      )
        throw new Error(
          "Expected the runtime panels and prediction list to be visible.",
        );
      expect(stack.x + stack.width).toBeLessThan(apis.x);
      expect(stack.y).toBe(apis.y);
      expect(apis.x).toBe(loop.x);
      expect(apis.y + apis.height).toBeLessThan(loop.y);
      expect(microtasks.y).toBe(macrotasks.y);
      expect(microtasks.y).toBeGreaterThan(loop.y + loop.height);
      expect(
        visualizerBottom - macrotasks.y - macrotasks.height,
      ).toBeLessThanOrEqual(12);
      expect(predictionBox.width).toBeGreaterThan(outputBox.width - 2);
      expect(guessBox.width).toBeGreaterThan(predictionBox.width - 24);
      const [ring, copy] = await Promise.all([
        lane("Event Loop").locator("[data-loop-indicator]").boundingBox(),
        step.boundingBox(),
      ]);
      if (!ring || !copy)
        throw new Error(
          "Expected the ring and step explanation to be visible.",
        );
      expect(ring.y + ring.height).toBeLessThan(copy.y);
      expect(
        Math.abs(ring.x + ring.width / 2 - copy.x - copy.width / 2),
      ).toBeLessThan(1);
    }
    for (const theme of ["Light", "Dark", "Brown", "System"]) {
      await page.getByRole("button", { name: "Change theme" }).click();
      await page
        .getByRole("menuitemradio", { name: theme, exact: true })
        .click();
      await expect(slider).toHaveAttribute("aria-valuetext", "Step 9 of 13");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: test.info().outputPath(`event-loop-${width}.png`),
      fullPage: true,
    });
    if (width === 320) {
      await slider.press("ArrowRight");
      await slider.press("ArrowLeft");
      await source.focus();
      await expect(source).toBeFocused();
      expect(
        await source.evaluate(
          (element) =>
            element.scrollWidth > element.clientWidth &&
            element.matches(":focus-visible"),
        ),
      ).toBe(true);
    }
  }
  await slider.press("End");
  await expect(slider).toBeFocused();
  await expect(next).toBeDisabled();
  await expect(consoleEntries).toHaveText([
    "Read request",
    "Script finished",
    "Promise reaction",
    "Follow-up microtask",
    "Timer callback",
  ]);
  await expect(lane("Macrotask Queue").getByRole("listitem")).toHaveCount(0);
  await restart.press("Enter");
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 13");
  await slider.press("End");
  await page.reload();
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 13");
});

test("Event Loop playback pauses, yields to scrubbing, and stops at the end", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(path);
  const example = page.getByRole("region", {
    name: "Event Loop Visualizer",
  });
  const slider = example.getByRole("slider", { name: "Example step" });
  const play = example.getByRole("button", { name: "Play", exact: true });
  const pause = example.getByRole("button", { name: "Pause", exact: true });
  const ring = example.locator("[data-loop-indicator]");
  const animationState = () =>
    ring.evaluate(
      (indicator) => getComputedStyle(indicator, "::before").animationPlayState,
    );
  await expect(slider).toBeVisible();
  expect(await animationState()).toBe("paused");
  await page.clock.install();

  await play.press("Enter");
  await expect(pause).toBeVisible();
  expect(await animationState()).toBe("running");
  await page.clock.runFor(1700);
  await expect(slider).toHaveAttribute("aria-valuenow", "2");
  await pause.press("Enter");
  expect(await animationState()).toBe("paused");
  await page.clock.runFor(3300);
  await expect(slider).toHaveAttribute("aria-valuenow", "2");

  await play.press("Enter");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await ring.evaluate(
      (indicator) => getComputedStyle(indicator, "::before").animationName,
    ),
  ).toBe("none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await slider.press("End");
  await slider.press("ArrowLeft");
  await expect(play).toBeEnabled();
  await page.clock.runFor(3300);
  await expect(slider).toHaveAttribute("aria-valuenow", "12");
  await play.press("Enter");
  await page.clock.runFor(1700);
  await expect(slider).toHaveAttribute("aria-valuenow", "13");
  await expect(play).toBeDisabled();
  await expect(play).toBeFocused();
  expect(await animationState()).toBe("paused");
});

test("Event Loop prediction reorders by keyboard and compares with the final frame", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path);

  const prediction = page.getByRole("region", { name: "Output Prediction" });
  const guess = prediction.getByRole("list", { name: "Your prediction" });
  const entries = guess.getByRole("listitem");
  const actual = prediction.getByRole("list", { name: "Walkthrough output" });
  const status = prediction.getByRole("status");
  const check = prediction.getByRole("button", { name: "Check prediction" });
  const reset = prediction.getByRole("button", { name: "Reset order" });
  const row = (label: string) =>
    prediction.getByRole("button", { name: `Reorder ${label}`, exact: true });
  const initialOrder = [
    "Timer callback",
    "Promise reaction",
    "Read request",
    "Follow-up microtask",
    "Script finished",
  ];
  const finalOrder = [
    "Read request",
    "Script finished",
    "Promise reaction",
    "Follow-up microtask",
    "Timer callback",
  ];

  await page.getByRole("link", { name: "Predict the output" }).press("Enter");
  await expect(prediction).toBeFocused();
  await expect(entries).toHaveText(initialOrder);
  await expect(actual).toHaveCount(0);

  const timer = row("Timer callback");
  await page.keyboard.press("Tab");
  await expect(timer).toBeFocused();
  await page.keyboard.press("Space");
  await expect(timer).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowUp");
  await expect(entries).toHaveText(initialOrder);
  await page.keyboard.press("ArrowDown");
  await expect(entries.nth(1)).toHaveText("Timer callback");
  await expect(timer).toBeFocused();
  await expect(status).toContainText(
    "Timer callback moved to position 2 of 5.",
  );
  await page.keyboard.press("Escape");
  await expect(entries).toHaveText(initialOrder);
  await expect(timer).toBeFocused();
  await expect(timer).toHaveAttribute("aria-pressed", "false");

  const slider = page.getByRole("slider", { name: "Example step" });
  await check.press("Enter");
  await expect(status).toHaveText("1 of 5 positions match.");
  await expect(actual.getByRole("listitem")).toHaveText(finalOrder);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 13");
  await slider.press("End");
  await expect(
    page.getByRole("region", { name: "Actual Output" }).getByRole("listitem"),
  ).toHaveText(finalOrder);
  await page
    .getByRole("button", { name: "Restart", exact: true })
    .press("Enter");
  await expect(entries).toHaveText(initialOrder);
  await expect(actual).toBeVisible();

  await row("Read request").press("Space");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");
  await row("Script finished").press("Space");
  for (let index = 0; index < 3; index++) await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");
  await timer.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(timer).toBeFocused();
  await expect(timer).toHaveAttribute("aria-pressed", "false");
  await expect(entries).toHaveText(finalOrder);
  await expect(status).toContainText("All 5 logs are in the correct order.");
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 13");

  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 1200 });
    await page.getByRole("button", { name: "Change theme" }).click();
    await page
      .getByRole("menuitemradio", {
        name: width === 1280 ? "Light" : "Dark",
        exact: true,
      })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(entries).toHaveText(finalOrder);
    await expect(actual).toBeVisible();
    await prediction.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    await prediction.screenshot({
      path: test.info().outputPath(`output-prediction-${width}.png`),
    });
  }

  await prediction
    .getByRole("button", { name: "Hide comparison" })
    .press("Enter");
  await expect(actual).toHaveCount(0);
  await expect(entries).toHaveText(finalOrder);
  await reset.press("Enter");
  await expect(entries).toHaveText(initialOrder);
  await expect(status).toHaveText("Prediction order reset.");
  await timer.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await check.press("Enter");
  await page.reload();
  await expect(entries).toHaveText(initialOrder);
  await expect(actual).toHaveCount(0);
});

test("Event Loop prediction drags whole rows before and after a target", async ({
  page,
}) => {
  await page.goto(path);
  await page.getByRole("link", { name: "Predict the output" }).click();
  const prediction = page.getByRole("region", { name: "Output Prediction" });
  const entries = prediction
    .getByRole("list", { name: "Your prediction" })
    .getByRole("listitem");
  const row = (label: string) =>
    prediction.getByRole("button", { name: `Reorder ${label}`, exact: true });
  const timer = row("Timer callback");
  const followUp = row("Follow-up microtask");
  const [from, target] = await Promise.all([
    timer.boundingBox(),
    followUp.boundingBox(),
  ]);
  if (!from || !target)
    throw new Error("Expected both draggable rows to be visible.");

  await page.mouse.move(from.x + 20, from.y + 20);
  await page.mouse.down();
  try {
    await page.mouse.move(target.x + 20, target.y + target.height - 8, {
      steps: 12,
    });
    await page.mouse.move(target.x + 22, target.y + target.height - 8);
    await expect(entries.nth(3)).toHaveAttribute("data-drop-edge", "after");
    await expect(entries.first()).toHaveText("Timer callback");
  } finally {
    await page.mouse.up();
  }
  await expect(entries).toHaveText([
    "Promise reaction",
    "Read request",
    "Follow-up microtask",
    "Timer callback",
    "Script finished",
  ]);
  await expect(timer).toBeFocused();
  await expect(prediction.locator("[data-drop-edge]")).toHaveCount(0);

  await row("Read request").dragTo(row("Promise reaction"), {
    targetPosition: { x: 20, y: 8 },
  });
  await expect(entries).toHaveText([
    "Read request",
    "Promise reaction",
    "Follow-up microtask",
    "Timer callback",
    "Script finished",
  ]);
  await expect(prediction.getByRole("status")).toContainText(
    "Read request moved to position 1 of 5.",
  );
});

test("Event Loop switches source, playback, and prediction together", async ({
  page,
}) => {
  await page.goto(path);
  const presets = page.getByRole("group", { name: "Example preset" });
  const easy = presets.getByRole("button", { name: "Easy", exact: true });
  const complex = presets.getByRole("button", { name: "Complex", exact: true });
  const source = page.getByRole("region", {
    name: "Event loop JavaScript source",
  });
  const slider = page.getByRole("slider", { name: "Example step" });
  const actual = page
    .getByRole("region", { name: "Actual Output" })
    .getByRole("listitem");
  const prediction = page.getByRole("region", { name: "Output Prediction" });
  const guess = prediction
    .getByRole("list", { name: "Your prediction" })
    .getByRole("listitem");
  const check = prediction.getByRole("button", { name: "Check prediction" });
  const comparison = prediction.getByRole("list", {
    name: "Walkthrough output",
  });

  await expect(easy).toHaveAttribute("aria-pressed", "true");
  await expect(source).toContainText("queueMicrotask");
  await expect(guess).toHaveCount(5);
  await page.clock.install();
  await slider.press("ArrowRight");
  await expect(actual).toHaveText(["Read request"]);
  await check.press("Enter");
  await expect(comparison).toBeVisible();
  await page.getByRole("button", { name: "Play", exact: true }).press("Enter");
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();

  await complex.press("Enter");
  await expect(complex).toBeFocused();
  await expect(complex).toHaveAttribute("aria-pressed", "true");
  await expect(easy).toHaveAttribute("aria-pressed", "false");
  await expect(source).toContainText("Timer microtask");
  await expect(source).not.toContainText("Read request");
  await expect(source.locator('[data-active="true"]')).toHaveAttribute(
    "data-line",
    "1",
  );
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 17");
  await expect(actual).toHaveCount(0);
  await expect(comparison).toHaveCount(0);
  await expect(guess).toHaveText([
    "First timer",
    "Start batch",
    "Second timer",
    "First microtask",
    "End script",
    "Timer microtask",
  ]);
  await page.clock.runFor(3200);
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 17");

  await slider.press("End");
  const finalOrder = [
    "Start batch",
    "End script",
    "First microtask",
    "First timer",
    "Timer microtask",
    "Second timer",
  ];
  await expect(actual).toHaveText(finalOrder);
  await check.press("Enter");
  await expect(comparison.getByRole("listitem")).toHaveText(finalOrder);
  await complex.press("Enter");
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 17 of 17");
  await expect(comparison).toBeVisible();

  await easy.press("Enter");
  await expect(slider).toHaveAttribute("aria-valuetext", "Step 1 of 13");
  await expect(source).toContainText("Read request");
  await expect(actual).toHaveCount(0);
  await expect(guess).toHaveCount(5);
  await expect(comparison).toHaveCount(0);
});
