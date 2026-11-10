import { expect, test } from "@playwright/test";

test("public Counter example works with keyboard controls and opens the real problem", async ({
  page,
}) => {
  await page.goto("/");
  const result = page.getByRole("status", { name: "Latest counter return" });
  const call = page.getByRole("button", {
    name: "Call counter()",
    exact: true,
  });
  await call.focus();
  await page.keyboard.press("Enter");
  await expect(result).toHaveText("10");
  await page.keyboard.press("Space");
  await expect(result).toHaveText("11");
  const start = page.getByRole("tab", { name: "Start at 10", exact: true });
  await start.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Start at 0", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(result).toHaveText("—");
  await call.click();
  await expect(result).toHaveText("0");
  await page
    .getByRole("button", { name: "Reset counter", exact: true })
    .click();
  await expect(result).toHaveText("—");
  const saveQuestion = page.getByRole("button", {
    name: "What happens to my code?",
    exact: true,
  });
  await saveQuestion.focus();
  await page.keyboard.press("Enter");
  await expect(saveQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText(
      "Edits you haven't run or submitted are not automatically saved.",
      { exact: false },
    ),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Open Counter problem", exact: true })
    .click();
  await expect(page).toHaveURL(/\/javascript\/practice\/counter$/);
  await expect(
    page.getByText("Authentication setup", { exact: true }),
  ).toBeVisible();
});

test("landing stays within the viewport in both themes and exposes only published problems", async ({
  page,
}) => {
  await page.goto("/");
  const problems = page.getByRole("list", {
    name: "Published JavaScript problems",
  });
  await expect(problems.getByRole("link")).toHaveCount(6);
  await expect(
    problems.getByRole("link", { name: /^Fibonacci Generator/ }),
  ).toHaveAttribute("href", "/javascript/practice/fibonacci-generator");
  await expect(problems.getByRole("link", { name: /^Sleep/ })).toHaveAttribute(
    "href",
    "/javascript/practice/sleep",
  );
  await expect(
    page.getByRole("button", { name: "Coming soon", exact: true }),
  ).toHaveCount(2);
  for (const theme of ["Dark", "Light"]) {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Change theme" }).click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await page.goto("/");
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await expect(
        page.getByRole("button", { name: "Call counter()", exact: true }),
      ).toBeVisible();
    }
  }
});

test("standalone landing hero directs visitors to sign in", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.getByRole("region", {
    name: "Know the concept. Write the code.",
  });
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  await expect(hero.getByText("Code Atlas", { exact: true })).toBeVisible();
  await expect(page.getByText("JavaScript is your starting point")).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: "Try an example" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("list", { name: "Practice benefits" }),
  ).toHaveCount(0);
  const start = hero.getByRole("link", {
    name: "Start practicing",
    exact: true,
  });
  await expect(start).toHaveAttribute("href", "/sign-in");
  await expect(start).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(start).toHaveCSS("color", "rgb(0, 0, 0)");
  await start.click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(
    page.getByText("Authentication setup", { exact: true }),
  ).toBeVisible();
});

test("intro matches the observed reference timing and only animates opacity and transform", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const hero = page.getByRole("region", {
    name: "Know the concept. Write the code.",
  });
  const heading = hero.getByRole("heading", { level: 1 });
  await expect(heading).toHaveCSS("animation-duration", "0.68s");
  await expect(heading).toHaveCSS("animation-delay", "0.09s");
  await expect(heading).toHaveCSS(
    "animation-timing-function",
    "cubic-bezier(0.22, 1, 0.36, 1)",
  );
  await expect(hero.getByRole("link", { name: "Start practicing" })).toHaveCSS(
    "animation-delay",
    "0.18s",
  );
  const preview = page.getByRole("region", {
    name: "Try JavaScript without signing in",
  });
  await expect(preview).toHaveCSS("animation-duration", "0.52s");
  await expect(preview).toHaveCSS("animation-delay", "0.22s");
  const frames = await heading.evaluate((el) => {
    const effect = el.getAnimations()[0]?.effect;
    return effect instanceof KeyframeEffect
      ? effect.getKeyframes().map((frame) => ({
          opacity: frame.opacity,
          transform: frame.transform,
        }))
      : [];
  });
  expect(frames).toEqual([
    { opacity: "0", transform: "translateY(16px)" },
    { opacity: "1", transform: "translateY(0px)" },
  ]);
  await expect(heading).toHaveCSS("opacity", "1");
});

test("reduced-motion visitors see a static hero with an immediately focusable action", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.getByRole("region", {
    name: "Know the concept. Write the code.",
  });
  const heading = hero.getByRole("heading", { level: 1 });
  const start = hero.getByRole("link", { name: "Start practicing" });
  await expect(heading).toHaveCSS("animation-name", "none");
  await expect(heading).toHaveCSS("opacity", "1");
  await expect(heading).toHaveCSS("transform", "none");
  await expect(start).toHaveCSS("animation-name", "none");
  await page.keyboard.press("Tab");
  await expect(start).toBeFocused();
});
