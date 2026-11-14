import { expect, test } from "@playwright/test";

test("tutor access fails closed before auth configuration", async ({
  request,
}) => {
  const response = await request.post(
    "/api/problems/javascript.counter/tutor",
    {
      data: { question: "I'm stuck here", code: "", history: [] },
    },
  );
  expect(response.status()).toBe(503);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toEqual({
    error: "Authentication is not configured.",
  });
});

test("home introduces the subjects and links to the dashboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Know the concept. Write the code.",
      level: 1,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore subjects" }).click();
  await expect(
    page.getByRole("heading", { name: "Subjects to explore" }),
  ).toBeInViewport();
  await expect(page.getByText("Coming soon", { exact: true })).toHaveCount(2);
  await page.getByRole("link", { name: "Go to dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByText("Authentication setup", { exact: true }),
  ).toBeVisible();
});

test("web dashboard remains in setup mode before credentials", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(
    page.getByText("Authentication setup", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your learning space" }),
  ).toHaveCount(0);
});

test("global navigation follows the active web route", async ({ page }) => {
  await page.goto("/javascript/practice");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(
    navigation.getByRole("link", { name: "Home", exact: true }),
  ).toHaveCount(0);
  await expect(
    navigation.getByRole("link", { name: "Dashboard", exact: true }),
  ).not.toHaveAttribute("aria-current");
  await expect(
    navigation.getByRole("button", { name: "Open navigation" }),
  ).toBeHidden();
  await navigation
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    navigation.getByRole("link", { name: "Dashboard", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByText("Authentication setup", { exact: true }),
  ).toBeVisible();
  await navigation
    .getByRole("link", { name: "Code Atlas", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(navigation).toHaveCount(0);
  await expect(page.locator("html")).toHaveClass(/dark/);
});

for (const [source, destination, label] of [
  ["/javascript/practice", "/javascript/learn", "Learn"],
  ["/javascript/learn", "/javascript/practice", "Practice"],
] as const) {
  for (const width of [1280, 320]) {
    test(`shows pending feedback before a slow ${label} navigation responds at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      if (width === 320) await page.emulateMedia({ reducedMotion: "reduce" });
      let release!: () => void;
      const responseGate = new Promise<void>((resolve) => {
        release = resolve;
      });
      await page.route(
        (url) => url.pathname === destination,
        async (route) => {
          if (route.request().headers().rsc === "1") await responseGate;
          await route.continue();
        },
      );
      try {
        await page.goto(source);
        await expect(
          page.getByRole("button", { name: "Change theme", exact: true }),
        ).toBeEnabled();
        const navigation = page.getByRole("navigation", {
          name: "Main navigation",
        });
        const toggle = navigation.getByRole("button", {
          name: /^(Open|Close) navigation$/,
        });
        if (width === 320) await toggle.click();
        const link = navigation.getByRole("link", { name: label, exact: true });
        const before = width === 1280 ? await link.boundingBox() : null;
        if (label === "Practice") {
          await link.focus();
          await page.keyboard.press("Enter");
        } else await link.click();
        const status = page
          .getByRole("status")
          .filter({ hasText: new RegExp(`^Loading ${label}…$`) });
        await expect(status).toHaveCount(1);
        if (width === 1280) {
          await expect(link.locator("svg")).toHaveClass(
            /motion-safe:animate-spin/,
          );
          const pending = await link.boundingBox();
          expect(pending?.width).toBeCloseTo(before?.width ?? 0, 1);
          await expect(
            navigation.getByRole("link", { name: "Dashboard", exact: true }),
          ).toBeEnabled();
        } else {
          await expect(status).toBeVisible();
          await expect(status.locator("svg")).toHaveCSS(
            "animation-name",
            "none",
          );
          await expect(toggle).toHaveAttribute("aria-expanded", "false");
          await expect(toggle).toBeEnabled();
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
        }
      } finally {
        release();
      }
      await expect(page).toHaveURL(new RegExp(`${destination}$`));
      await expect(
        page
          .getByRole("status")
          .filter({ hasText: new RegExp(`^Loading ${label}…$`) }),
      ).toHaveCount(0);
      await expect(
        page.getByText("Authentication setup", { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("main", { name: /^Loading/ })).toHaveCount(0);
    });
  }
}

test("mobile navigation supports the keyboard and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/javascript/practice");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const toggle = navigation.getByRole("button", {
    name: /^(Open|Close) navigation$/,
  });
  const dashboard = navigation.getByRole("link", {
    name: "Dashboard",
    exact: true,
  });
  await expect(dashboard).toBeHidden();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(dashboard).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await navigation
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("JavaScript navigation centers the active section on desktop", async ({
  page,
}) => {
  await page.goto("/javascript/practice");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const practice = nav.getByRole("link", { name: "Practice", exact: true });
  const learn = nav.getByRole("link", { name: "Learn", exact: true });
  for (const width of [768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const bounds = await nav
      .locator('[data-slot="global-nav-links"]')
      .boundingBox();
    expect(bounds).not.toBeNull();
    expect(
      Math.abs((bounds?.x ?? 0) + (bounds?.width ?? 0) / 2 - width / 2),
    ).toBeLessThanOrEqual(1);
    const brand = await nav
      .locator('[data-slot="global-nav-brand"]')
      .boundingBox();
    const dashboard = await nav
      .getByRole("link", { name: "Dashboard", exact: true })
      .boundingBox();
    expect(brand).not.toBeNull();
    expect(dashboard).not.toBeNull();
    expect(dashboard?.x).toBeGreaterThanOrEqual(
      (brand?.x ?? 0) + (brand?.width ?? 0),
    );
    expect((dashboard?.x ?? 0) + (dashboard?.width ?? 0)).toBeLessThan(
      bounds?.x ?? 0,
    );
  }
  await expect(practice).toHaveAttribute("aria-current", "page");
  await learn.click();
  await expect(page).toHaveURL(/\/javascript\/learn$/);
  await expect(learn).toHaveAttribute("aria-current", "page");
  await expect(practice).not.toHaveAttribute("aria-current");
  await practice.click();
  await expect(page).toHaveURL(/\/javascript\/practice$/);
  await page.goto("/javascript/practice/sleep");
  await expect(nav).toHaveCount(0);
  await page.goto("/javascript/practice");
  await nav.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(practice).toHaveCount(0);
  await expect(learn).toHaveCount(0);
});

test("JavaScript navigation supports mobile keyboard and route changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/javascript/practice");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const toggle = nav.getByRole("button", { name: /^(Open|Close) navigation$/ });
  const learn = nav.getByRole("link", { name: "Learn", exact: true });
  await expect(learn).toBeHidden();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(
    nav.getByRole("link", { name: "Dashboard", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await learn.click();
  await expect(page).toHaveURL(/\/javascript\/learn$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(nav.getByRole("button", { name: "Change theme" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("Next route health works and protected endpoints fail closed", async ({
  request,
}) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: "ok", service: "web" });
  expect((await request.get("/api/me")).status()).toBe(503);
  expect(
    (
      await request.post("/api/problems/javascript.sleep/run", {
        data: { code: "async function sleep(){}", inputs: [10] },
      })
    ).status(),
  ).toBe(503);
});

for (const { origin, setup, navigationLabel } of [
  {
    origin: "http://127.0.0.1:3000",
    setup: "Authentication setup",
    navigationLabel: "Main navigation",
  },
]) {
  test(`${origin} preserves the chosen theme across pages and reloads`, async ({
    page,
  }) => {
    await page.goto(`${origin}/javascript/practice`);
    const themeButton = page.getByRole("button", {
      name: "Change theme",
      exact: true,
    });
    await expect(page.locator("html")).toHaveClass(/dark/);
    await themeButton.click();
    await expect(
      page.getByRole("menuitemradio", { name: "Dark", exact: true }),
    ).toHaveAttribute("aria-checked", "true");
    await page
      .getByRole("menuitemradio", { name: "Light", exact: true })
      .click();
    await expect(page.locator("html")).toHaveClass(/light/);
    await expect(themeButton).toBeFocused();
    await page
      .getByRole("navigation", { name: navigationLabel })
      .getByRole("link", { name: "Dashboard", exact: true })
      .click();
    await expect(page).toHaveURL(`${origin}/dashboard`);
    await expect(page.locator("html")).toHaveClass(/light/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);
    await themeButton.click();
    await expect(
      page.getByRole("menuitemradio", { name: "Light", exact: true }),
    ).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await expect(themeButton).toBeFocused();
    await page
      .getByRole("navigation", { name: navigationLabel })
      .getByRole("link", { name: "Sign in", exact: true })
      .click();
    await expect(page).toHaveURL(`${origin}/sign-in`);
    await expect(page.locator("html")).toHaveClass(/light/);
    await page.goto(origin);
    await expect(page.locator("html")).toHaveClass(/light/);
    await expect(themeButton).toHaveCount(0);
  });

  test(`${origin} follows system appearance and keeps mobile controls accessible`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${origin}/dashboard`);
    const themeButton = page.getByRole("button", {
      name: "Change theme",
      exact: true,
    });
    await expect(themeButton).toBeVisible();
    await themeButton.focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("menuitemradio", { name: "System", exact: true })
      .click();
    await expect(page.locator("html")).toHaveClass(/light/);
    await expect(themeButton).toBeFocused();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await expect(themeButton).toBeVisible();
    await themeButton.click();
    await expect(
      page.getByRole("menuitemradio", { name: "System", exact: true }),
    ).toHaveAttribute("aria-checked", "true");
    await page
      .getByRole("menuitemradio", { name: "Light", exact: true })
      .click();
    await expect(themeButton).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

  test(`${origin} exposes sign-in and sign-up from the navigation`, async ({
    page,
  }) => {
    await page.goto(`${origin}/dashboard`);
    const navigation = page.getByRole("navigation", { name: navigationLabel });
    await navigation
      .getByRole("link", { name: "Sign in", exact: true })
      .click();
    await expect(page).toHaveURL(`${origin}/sign-in`);
    await expect(page.getByText(setup, { exact: true })).toBeVisible();
    await expect(navigation).toHaveCount(0);
    await page.goto(`${origin}/dashboard`);
    await navigation
      .getByRole("link", { name: "Sign up", exact: true })
      .click();
    await expect(page).toHaveURL(`${origin}/sign-up`);
    await expect(page.getByText(setup, { exact: true })).toBeVisible();
    await expect(navigation).toHaveCount(0);
  });

  test(`${origin} resolves nested authentication routes`, async ({ page }) => {
    for (const path of [
      "/sign-in/verify-email-address",
      "/sign-up/verify-email-address",
    ]) {
      const response = await page.goto(`${origin}${path}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByText(setup, { exact: true })).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Main navigation" }),
      ).toHaveCount(0);
    }
  });
}

for (const path of [
  "/algorithms",
  "/algorithms/learn",
  "/algorithms/learn/two-pointers",
  "/algorithms/learn/unknown",
  "/algorithms/practice",
  "/algorithms/practice/valid-anagram",
  "/algorithms/practice/sleep",
  "/algorithms/practice/unknown",
  "/javascript",
  "/javascript/learn",
  "/javascript/learn/two-pointers",
  "/javascript/learn/unknown",
  "/javascript/practice",
  "/javascript/practice/sleep",
  "/javascript/practice/counter",
  "/javascript/practice/curry",
  "/javascript/practice/map-array",
  "/javascript/practice/reduce-array",
  "/javascript/practice/chunk-array",
  "/javascript/practice/function-composition",
  "/javascript/practice/memoize",
  "/javascript/practice/debounce",
  "/javascript/practice/filter-elements-from-array",
  "/javascript/practice/flatten-nested-array",
  "/javascript/practice/fibonacci-generator",
  "/javascript/practice/delay-the-resolution-of-each-promise",
  "/javascript/practice/scope-and-shadowing",
  "/javascript/practice/closures",
  "/javascript/practice/unknown",
]) {
  test(`Subject route ${path} withholds content before credentials`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(
      page.getByText("Authentication setup", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sleep" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Counter" })).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Two Pointers" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Run", exact: true }),
    ).toHaveCount(0);
  });
}

for (const [oldPath, destination] of [
  ["/learn/javascript", "/javascript/practice"],
  ["/learn/javascript/sleep", "/javascript/practice/sleep"],
  ["/learn/javascript/unknown", "/javascript/practice/unknown"],
  ["/javascript", "/javascript/practice"],
  ["/algorithms", "/algorithms/practice"],
] as const) {
  test(`redirects ${oldPath} to ${destination}`, async ({ request }) => {
    const response = await request.get(oldPath, { maxRedirects: 0 });
    expect([307, 308]).toContain(response.status());
    expect(
      new URL(response.headers().location ?? "", "http://127.0.0.1:3000")
        .pathname,
    ).toBe(destination);
  });
}

test("withholds account progress before authentication is configured", async ({
  request,
}) => {
  expect((await request.get("/api/practice-progress")).status()).toBe(503);
  expect(
    (
      await request.patch("/api/practice-progress/javascript.sleep", {
        data: { flagged: true },
      })
    ).status(),
  ).toBe(503);
});

test("withholds personal notes before authentication is configured", async ({
  request,
}) => {
  for (const method of ["get", "put"] as const) {
    const response = await request[method](
      "/api/problems/javascript.sleep/notes",
      method === "put"
        ? {
            data: {
              content: {
                formatVersion: 1,
                document: { ops: [{ insert: "\n" }] },
              },
            },
          }
        : {},
    );
    expect(response.status()).toBe(503);
    expect(response.headers()["cache-control"]).toBe("no-store");
  }
});

for (const path of ["/forgot-password", "/reset-password", "/verify-email"]) {
  test(`${path} remains available before auth configuration`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByText("Authentication setup", { exact: true }),
    ).toBeVisible();
  });
}
test("auth API fails explicitly before credentials", async ({ request }) => {
  const response = await request.get("/api/auth/get-session");
  expect(response.status()).toBe(503);
  expect(response.headers()["cache-control"]).toBe("no-store");
});
