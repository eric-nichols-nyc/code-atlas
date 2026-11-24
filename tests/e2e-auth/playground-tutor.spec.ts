import { expect, test } from "@playwright/test";

const tutorPath = "/api/javascript/playground/tutor";
const firstHint =
  "Trace the value assigned to count. What do you expect it to be?";
const stream = (text: string) =>
  [{ type: "start" }, { type: "delta", text }, { type: "done" }]
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("");

test("asks about the current draft and preserves the tutor, editor, and console", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests: {
    code: string;
    question: string;
    history: { role: string; content: string }[];
    runError?: string;
  }[] = [];
  await page.route(`**${tutorPath}`, async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "text/event-stream",
      body: stream(
        requests.length === 1 ? firstHint : `Follow-up ${requests.length}`,
      ),
    });
  });
  await page.goto("/javascript/playground");
  const editor = page.getByRole("textbox", { name: "JavaScript source" });
  const question = page.getByRole("textbox", { name: "Your question" });
  const openTutor = page.getByRole("button", { name: "Show AI tutor" });
  const closeTutor = page.getByRole("button", { name: "Hide AI tutor" });
  const consolePanel = page.getByRole("region", { name: "Console" });
  const send = page.getByRole("button", { name: "Send question" });
  const firstSource = "const count = 0;\nconsole.log(count);";
  await editor.fill(firstSource);
  await openTutor.click();
  await question.fill("I'm stuck here");
  expect(requests).toHaveLength(0);
  await question.press("ControlOrMeta+Enter");
  await expect(page.getByText(firstHint, { exact: true })).toBeVisible();
  expect(requests[0]).toEqual({
    code: firstSource,
    question: "I'm stuck here",
    history: [],
  });
  await expect(consolePanel.getByRole("status")).toHaveText("Ready");

  const failedSource = 'throw new Error("Example runtime error");';
  await editor.fill(failedSource);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(consolePanel.getByText("Example runtime error")).toBeVisible();
  await expect(
    page.getByText("Code changed since this question."),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  await question.fill("Why did it fail?");
  await send.click();
  await expect(page.getByText("Follow-up 2", { exact: true })).toBeVisible();
  expect(requests[1]).toEqual({
    code: failedSource,
    question: "Why did it fail?",
    history: [
      { role: "user", content: "I'm stuck here" },
      { role: "assistant", content: firstHint },
    ],
    runError: "Example runtime error",
  });

  await editor.fill("console.log(1)");
  await question.fill("What changed?");
  await send.click();
  await expect(page.getByText("Follow-up 3", { exact: true })).toBeVisible();
  expect(requests[2]?.code).toBe("console.log(1)");
  expect(requests[2]).not.toHaveProperty("runError");
  await expect(
    consolePanel.getByText("Output is from your last run."),
  ).toBeVisible();
  await question.fill("An unsent question");
  await closeTutor.click();
  await expect(question).toBeHidden();
  await openTutor.click();
  await expect(question).toHaveValue("An unsent question");

  await page.setViewportSize({ width: 320, height: 800 });
  const drawer = page.getByRole("dialog", { name: "AI tutor" });
  await expect(drawer).toBeVisible();
  await expect(question).toHaveValue("An unsent question");
  await expect(drawer.getByText("Follow-up 3", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  await question.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(openTutor).toBeFocused();
  await expect(editor).toHaveText("console.log(1)");
  await expect(consolePanel.getByText("Example runtime error")).toBeVisible();
  expect(requests).toHaveLength(3);

  await page.reload();
  await openTutor.click();
  await expect(question).toHaveValue("");
  await expect(page.getByTestId("tutor-turn")).toHaveCount(0);
  expect(requests).toHaveLength(3);
});

test("keeps the script and supports retry on tutor failure", async ({
  page,
}) => {
  const payloads: { code: string; question: string }[] = [];
  await page.route(`**${tutorPath}`, async (route) => {
    payloads.push(route.request().postDataJSON());
    if (payloads.length === 1) {
      await route.fulfill({
        status: 503,
        json: { error: "The tutor is temporarily unavailable." },
      });
      return;
    }
    await route.fulfill({
      contentType: "text/event-stream",
      body: stream(firstHint),
    });
  });
  await page.goto("/javascript/playground");
  const editor = page.getByRole("textbox", { name: "JavaScript source" });
  await editor.fill("let count = 0");
  await page.getByRole("button", { name: "Show AI tutor" }).click();
  await page
    .getByRole("textbox", { name: "Your question" })
    .fill("How do I increment this?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page.getByText("The tutor is temporarily unavailable."),
  ).toBeVisible();
  await expect(editor).toHaveText("let count = 0");
  await editor.fill("let count = 1");
  await page.getByRole("button", { name: "Retry with current code" }).click();
  await expect(page.getByText(firstHint, { exact: true })).toBeVisible();
  expect(payloads[1]).toMatchObject({
    code: "let count = 1",
    question: "How do I increment this?",
  });
});
