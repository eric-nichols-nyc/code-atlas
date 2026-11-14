import { expect, type Page, test } from "@playwright/test";

const tutorPath = "/api/problems/javascript.counter/tutor";
const originalSource =
  "// tutor fixture first\nfunction createCounter(n) { return () => n; }";
const editedSource =
  "// tutor fixture newer\nfunction createCounter(n) { return () => n++; }";
const reply =
  "Keep the running value in the returned function's closure.\n\n```javascript\n// a small hint, not an inserted solution\n```";
const stream = (text: string) =>
  [{ type: "start" }, { type: "delta", text }, { type: "done" }]
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("");
const question = (page: Page) =>
  page.getByRole("textbox", { name: "Your question", exact: true });
const code = (page: Page) =>
  page.getByRole("textbox", { name: "JavaScript solution", exact: true });
async function ask(page: Page, text: string) {
  await question(page).fill(text);
  await page
    .getByRole("button", { name: "Send question", exact: true })
    .click();
}
test("tutor requests only on Send, captures fresh code, survives panels, and ends with the visit", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 960 });
  const requests: {
    code: string;
    question: string;
    history: { role: string; content: string }[];
  }[] = [];
  let releaseFirst!: () => void;
  let releaseStopped!: () => void;
  const first = new Promise<void>((resolve) => {
    releaseFirst = resolve;
  });
  const stopped = new Promise<void>((resolve) => {
    releaseStopped = resolve;
  });
  await page.route(`**${tutorPath}`, async (route) => {
    requests.push(route.request().postDataJSON());
    const number = requests.length;
    if (number === 1) await first;
    if (number === 3) await stopped;
    await route
      .fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: stream(number === 1 ? reply : `Follow-up hint ${number}.`),
      })
      .catch(() => {});
  });
  await page.goto("/javascript/practice/counter");
  await expect(code(page)).toBeVisible();
  await expect(page.getByText("Loading saved code…")).toHaveCount(0);
  const progress = await (
    await page.request.get("/api/practice-progress/javascript.counter")
  ).json();
  const notes = await (
    await page.request.get("/api/problems/javascript.counter/notes")
  ).json();
  await code(page).fill(originalSource);
  await page
    .getByRole("button", { name: "Show AI tutor", exact: true })
    .click();
  await expect(question(page)).toBeVisible();
  await question(page).fill("draft only");
  await page
    .getByRole("button", { name: "Hide AI tutor", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show AI tutor", exact: true })
    .click();
  await expect(question(page)).toHaveValue("draft only");
  expect(requests).toHaveLength(0);
  await ask(page, "I'm stuck here");
  await expect(
    page.getByRole("button", { name: "Stop reply", exact: true }),
  ).toBeVisible();
  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0]?.code).toBe(originalSource);
  await code(page).fill(editedSource);
  await expect(
    page.getByText("Code changed since this question."),
  ).toBeVisible();
  await question(page).fill("draft while waiting");
  await page.getByRole("tab", { name: "Notes", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Your notes", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "AI tutor", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(question(page)).toHaveValue("draft while waiting");
  await expect(
    page.getByRole("button", { name: "Stop reply", exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  releaseFirst();
  await expect(
    page.getByRole("status").filter({ hasText: "Tutor reply complete." }),
  ).toBeVisible();
  await expect(page.getByText(/Keep the running value/)).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 960 });
  await expect(question(page)).toHaveValue("draft while waiting");
  await ask(page, "What should I change next?");
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1]?.code).toBe(editedSource);
  expect(requests[1]?.history).toEqual([
    { role: "user", content: "I'm stuck here" },
    { role: "assistant", content: reply },
  ]);
  await expect(page.getByText("Follow-up hint 2.")).toBeVisible();
  await ask(page, "Explain the next step");
  await expect.poll(() => requests.length).toBe(3);
  await page.getByRole("button", { name: "Stop reply", exact: true }).click();
  await expect(
    page.getByText("Reply stopped. Your question is kept."),
  ).toBeVisible();
  await code(page).fill(`${editedSource}\n// changed before deliberate retry`);
  await question(page).fill("a newer unsent question");
  await page
    .getByRole("button", { name: "Retry with current code", exact: true })
    .click();
  await expect.poll(() => requests.length).toBe(4);
  expect(requests[3]?.code).toContain("changed before deliberate retry");
  expect(requests[3]?.question).toBe("Explain the next step");
  await expect(question(page)).toHaveValue("a newer unsent question");
  await expect(page.getByTestId("tutor-turn")).toHaveCount(3);
  await expect(page.getByText("Follow-up hint 4.")).toBeVisible();
  releaseStopped();
  for (const theme of ["Light", "Dark"]) {
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await expect(question(page)).toHaveValue("a newer unsent question");
  }
  await page.setViewportSize({ width: 320, height: 720 });
  await expect(question(page)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Show AI tutor", exact: true }),
  ).toBeFocused();
  expect(requests).toHaveLength(4);
  expect(
    await (
      await page.request.get("/api/practice-progress/javascript.counter")
    ).json(),
  ).toEqual(progress);
  expect(
    await (
      await page.request.get("/api/problems/javascript.counter/notes")
    ).json(),
  ).toEqual(notes);
  await page.reload();
  await page
    .getByRole("button", { name: "Show AI tutor", exact: true })
    .click();
  await expect(question(page)).toHaveValue("");
  await expect(page.getByTestId("tutor-turn")).toHaveCount(0);
  expect(requests).toHaveLength(4);
});

test("authenticated tutor input validation works through the production endpoint before provider access", async ({
  page,
}) => {
  const response = await page.request.post(tutorPath, {
    data: { question: "help", code: "", history: [], model: "forged" },
  });
  expect(response.status()).toBe(400);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const unknown = await page.request.post("/api/problems/unknown/tutor", {
    data: { question: "help", code: "", history: [] },
  });
  expect(unknown.status()).toBe(404);
});

test("composer and CodeMirror keep their separate Mod-Enter actions", async ({
  page,
}) => {
  let runs = 0;
  let questions = 0;
  await page.route("**/api/problems/javascript.counter/run", async (route) => {
    runs++;
    await route.fulfill({
      json: {
        attemptId: "keyboard-fixture",
        action: "run",
        verdict: "accepted",
        passed: 2,
        total: 2,
        cases: [],
        persistence: "saved",
      },
    });
  });
  await page.route(`**${tutorPath}`, async (route) => {
    questions++;
    await route.fulfill({
      contentType: "text/event-stream",
      body: stream("Keyboard hint."),
    });
  });
  await page.goto("/javascript/practice/counter");
  await expect(code(page)).toBeVisible();
  await code(page).fill(editedSource);
  await code(page).press("ControlOrMeta+Enter");
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  expect(runs).toBe(1);
  expect(questions).toBe(0);
  await page
    .getByRole("button", { name: "Show AI tutor", exact: true })
    .click();
  await question(page).fill("Explain this code");
  await question(page).press("Enter");
  expect(questions).toBe(0);
  await question(page).press("ControlOrMeta+Enter");
  await expect(page.getByText("Keyboard hint.")).toBeVisible();
  expect(questions).toBe(1);
  expect(runs).toBe(1);
});
