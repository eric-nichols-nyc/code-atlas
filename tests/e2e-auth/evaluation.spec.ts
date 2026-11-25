import { expect, test } from "@playwright/test";
import {
  evaluationFixture,
  evaluationStream,
} from "../fixtures/code-evaluation";

const endpoint = "/api/problems/javascript.majority-element/evaluate";
const source =
  "function majorityElement(nums) { let candidate; let count = 0; for (const num of nums) { if (count === 0) candidate = num; count += num === candidate ? 1 : -1; } return candidate; }";

test("Evaluate captures unsaved source, preserves results and notes, and keeps evaluation in Feedback at desktop and mobile sizes", async ({
  page,
}) => {
  const requests: { code: string }[] = [];
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**${endpoint}`, async (route) => {
    requests.push(route.request().postDataJSON());
    await gate;
    await route.fulfill({
      contentType: "text/event-stream",
      body: evaluationStream(),
    });
  });
  await page.route(
    "**/api/problems/javascript.majority-element/run",
    async (route) =>
      route.fulfill({
        json: {
          attemptId: "evaluation-journey",
          action: "run",
          verdict: "accepted",
          passed: 2,
          total: 2,
          cases: [],
        },
      }),
  );
  await page.goto("/javascript/practice/majority-element");
  const editor = page.getByRole("textbox", {
    name: "JavaScript solution",
    exact: true,
  });
  await expect(editor).toBeVisible();
  await expect(page.getByText("Loading saved code…")).toHaveCount(0);
  const progress = await (
    await page.request.get("/api/practice-progress/javascript.majority-element")
  ).json();
  const notes = await (
    await page.request.get("/api/problems/javascript.majority-element/notes")
  ).json();
  await editor.fill(source);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  expect(requests).toHaveLength(0);
  await page.getByRole("button", { name: "Evaluate", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0]).toEqual({ code: source });
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Submit", exact: true }),
  ).toBeDisabled();
  await editor.fill(`${source}\n// edited during evaluation`);
  await expect(page.getByText(/Code changed while evaluating/)).toBeVisible();
  release();
  await expect(page.getByTestId("evaluation-score")).toHaveText("10/10");
  await expect(
    page.getByText(/Code changed since this evaluation/),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Feedback", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("execution-verdict")).toHaveCount(0);
  await page.getByRole("tab", { name: "Test Result", exact: true }).click();
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  await expect(page.getByTestId("evaluation-score")).toHaveCount(0);
  await page.getByRole("tab", { name: "Feedback", exact: true }).click();
  await expect(page.getByTestId("evaluation-score")).toHaveText("10/10");
  await expect(
    page
      .getByRole("region", { name: "Test cases and results" })
      .getByRole("tab"),
  ).toHaveCount(3);
  await page.getByRole("button", { name: "Show Notes", exact: true }).click();
  const noteEditor = page.getByRole("textbox", {
    name: "Your notes",
    exact: true,
  });
  await expect(noteEditor).toBeVisible();
  await noteEditor.fill("unsaved evaluation takeaway");
  const codeWithDrawerOpen = page.getByRole("textbox", {
    name: "JavaScript solution",
    exact: true,
    includeHidden: true,
  });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await expect(page.getByTestId("evaluation-score")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(codeWithDrawerOpen).toContainText(source);
    await expect(codeWithDrawerOpen).toContainText(
      "// edited during evaluation",
    );
    await expect(noteEditor).toContainText("unsaved evaluation takeaway");
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  for (const theme of ["Light", "Dark"]) {
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await expect(page.getByTestId("evaluation-score")).toHaveText("10/10");
  }
  expect(requests).toHaveLength(1);
  expect(
    await (
      await page.request.get(
        "/api/practice-progress/javascript.majority-element",
      )
    ).json(),
  ).toEqual(progress);
  expect(
    await (
      await page.request.get("/api/problems/javascript.majority-element/notes")
    ).json(),
  ).toEqual(notes);
  await page.reload();
  await expect(page.getByRole("region", { name: "AI evaluation" })).toHaveCount(
    0,
  );
});

test("Stop, invalid reports and service errors preserve source and retry explicitly with current code", async ({
  page,
}) => {
  let count = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const codes: string[] = [];
  await page.route(`**${endpoint}`, async (route) => {
    codes.push(route.request().postDataJSON().code);
    count++;
    if (count === 1) {
      await gate;
      await route
        .fulfill({ contentType: "text/event-stream", body: evaluationStream() })
        .catch(() => {});
    } else if (count === 2)
      await route.fulfill({
        status: 503,
        json: { error: "AI is temporarily unavailable. Please try again." },
      });
    else
      await route.fulfill({
        contentType: "text/event-stream",
        body: evaluationStream(
          count === 3 ? { score: 100 } : evaluationFixture,
        ),
      });
  });
  await page.goto("/javascript/practice/majority-element");
  const editor = page.getByRole("textbox", {
    name: "JavaScript solution",
    exact: true,
  });
  await expect(editor).toBeVisible();
  await expect(page.getByText("Loading saved code…")).toHaveCount(0);
  await editor.fill(source);
  await page.getByRole("button", { name: "Evaluate", exact: true }).click();
  await expect.poll(() => count).toBe(1);
  await page.getByRole("button", { name: "Stop evaluation" }).click();
  await expect(
    page.getByRole("region", { name: "AI evaluation" }).getByRole("alert"),
  ).toContainText("Evaluation stopped");
  release();
  await editor.fill(`${source}\n// fresh retry`);
  await page.getByRole("button", { name: "Retry with current code" }).click();
  await expect(
    page.getByRole("region", { name: "AI evaluation" }).getByRole("alert"),
  ).toContainText("temporarily unavailable");
  await page.getByRole("button", { name: "Retry with current code" }).click();
  await expect(
    page.getByRole("region", { name: "AI evaluation" }).getByRole("alert"),
  ).toContainText("incomplete or invalid");
  await expect(page.getByTestId("evaluation-score")).toHaveCount(0);
  await page.getByRole("button", { name: "Retry with current code" }).click();
  await expect(page.getByTestId("evaluation-score")).toHaveText("10/10");
  expect(count).toBe(4);
  expect(codes.slice(1)).toEqual(Array(3).fill(`${source}\n// fresh retry`));
});

test("production evaluation endpoint validates before inference", async ({
  request,
}) => {
  const invalid = await request.post(endpoint, {
    data: { code: source, model: "forged" },
  });
  expect(invalid.status()).toBe(400);
  expect(invalid.headers()["cache-control"]).toBe("no-store");
  const empty = await request.post(endpoint, { data: { code: "" } });
  expect(empty.status()).toBe(400);
  const missing = await request.post("/api/problems/unknown/evaluate", {
    data: { code: source },
  });
  expect(missing.status()).toBe(404);
});

test("sample mode gives repeatable colored feedback with zero API calls and preserves the draft across tabs and layouts", async ({
  page,
}) => {
  let evaluationCalls = 0;
  let writes = 0;
  page.on("request", (request) => {
    if (
      request.url().includes("/api/") &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method())
    )
      writes++;
  });
  await page.route(`**${endpoint}`, async (route) => {
    evaluationCalls++;
    await route.fulfill({
      status: 503,
      json: { error: "No AI calls are expected in sample mode." },
    });
  });
  await page.goto("/javascript/practice/majority-element");
  const editor = page.getByRole("textbox", {
    name: "JavaScript solution",
    exact: true,
  });
  await expect(editor).toBeVisible();
  await expect(page.getByText("Loading saved code…")).toHaveCount(0);
  await editor.fill("// unsaved layout review draft");
  await page.getByRole("tab", { name: "Feedback", exact: true }).click();
  const sample = page.getByRole("button", {
    name: "Use sample feedback",
    exact: true,
  });
  await sample.click();
  await expect(sample).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("evaluation-score")).toHaveText("6/10");
  await expect(
    page.getByText("Sample feedback", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("2/2 · Strong", { exact: true })).toBeVisible();
  await expect(page.getByText("3/4 · Improve", { exact: true })).toBeVisible();
  await expect(
    page.getByText("0/1 · Needs attention", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Evaluate", exact: true }).focus();
  for (let i = 0; i < 3; i++) await page.keyboard.press("Enter");
  expect(evaluationCalls).toBe(0);
  expect(writes).toBe(0);
  await page.getByRole("tab", { name: "Test Result", exact: true }).click();
  await expect(page.getByTestId("evaluation-score")).toHaveCount(0);
  await expect(
    page.getByText("Run your code to see test results."),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Feedback", exact: true }).click();
  for (const width of [390, 320, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await expect(page.getByTestId("evaluation-score")).toHaveText("6/10");
    await expect(editor).toContainText("// unsaved layout review draft");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await sample.click();
  await expect(sample).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("evaluation-score")).toHaveCount(0);
  expect(evaluationCalls).toBe(0);
  expect(writes).toBe(0);
});
