import { expect, type Page, test } from "@playwright/test";
import { staleClosureCounter as exercise } from "../../apps/web/src/content/react/practice/stale-closure-counter/exercise";

const workspace = "/react/practice/stale-closure-counter";
const tutorPath = `/api/react/exercises/${exercise.id}/tutor`;
const editor = (page: Page) =>
  page.getByRole("textbox", { name: "React TypeScript source", exact: true });
const preview = (page: Page) =>
  page.frameLocator('iframe[title="React live preview"]');
const sample = (text: string) =>
  `export default function App(){return <p>${text}</p>;}`;
const stream = (text: string) =>
  [{ type: "start" }, { type: "delta", text }, { type: "done" }]
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("");
async function edit(page: Page, code: string) {
  await editor(page).click();
  await editor(page).press("ControlOrMeta+a");
  await page.keyboard.insertText(code);
}
async function submit(page: Page) {
  await page.getByRole("button", { name: "Submit", exact: true }).click();
}
async function ask(page: Page, question: string) {
  await page
    .getByRole("textbox", { name: "Your question", exact: true })
    .fill(question);
  await page
    .getByRole("button", { name: "Send question", exact: true })
    .click();
}
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
});

test("discovers React and executes only submitted snapshots without account writes", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() !== "GET" &&
      /practice-progress|\/notes/.test(request.url())
    )
      writes.push(request.url());
  });
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "Explore React JS", exact: true })
    .click();
  await expect(page).toHaveURL("/react/learn");
  await page.getByRole("link", { name: "Practice", exact: true }).click();
  await expect(page).toHaveURL("/react/practice");
  await expect(
    page.getByRole("link", { name: "Practice", exact: true }),
  ).toHaveAttribute("href", "/react/practice");
  await expect(
    page.getByRole("link", { name: "Learn", exact: true }),
  ).toHaveAttribute("href", "/react/learn");
  await page.getByRole("link", { name: "Open exercise", exact: true }).click();
  await expect(page).toHaveURL(workspace);
  await edit(page, sample("FIRST_SNAPSHOT"));
  await page.waitForTimeout(500);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(
    page.getByText("Submit your code to render the React preview."),
  ).toBeVisible();
  await submit(page);
  await expect(preview(page).getByText("FIRST_SNAPSHOT")).toBeVisible({
    timeout: 60000,
  });
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("sandpack.codesandbox.io"));
  await edit(page, sample("LATEST_DRAFT"));
  await page.waitForTimeout(800);
  await expect(preview(page).getByText("FIRST_SNAPSHOT")).toBeVisible();
  await expect(
    page.getByText(/Code changed since last submission/),
  ).toBeVisible();
  expect(page.frames()).toContain(frame);
  await submit(page);
  await edit(page, sample("DRAFT_DURING_COMPILATION"));
  await expect(preview(page).getByText("LATEST_DRAFT")).toBeVisible({
    timeout: 60000,
  });
  await page.waitForTimeout(600);
  await expect(preview(page).getByText("DRAFT_DURING_COMPILATION")).toHaveCount(
    0,
  );
  await page.getByRole("link", { name: "Back to React Practice" }).click();
  await expect(page).toHaveURL("/react/practice");
  expect(writes).toEqual([]);
});

test("submits a working counter fix, preserves undo and themes, and resets only the draft", async ({
  page,
}) => {
  await page.goto(workspace);
  await submit(page);
  await expect(preview(page).getByLabel("Counter value")).toHaveText("1", {
    timeout: 60000,
  });
  await page.waitForTimeout(1200);
  await expect(preview(page).getByLabel("Counter value")).toHaveText("1");
  const fixed = exercise.starter.replace(
    "setCount(count + 1)",
    "setCount(current => current + 1)",
  );
  await edit(page, fixed);
  await editor(page).press("ControlOrMeta+Enter");
  await expect
    .poll(
      async () =>
        Number(await preview(page).getByLabel("Counter value").textContent()),
      { timeout: 60000 },
    )
    .toBeGreaterThanOrEqual(3);
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("sandpack.codesandbox.io"));
  for (const theme of ["Light", "Dark purple", "Dark"]) {
    await page.getByRole("button", { name: "Change theme" }).click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(preview(page).getByLabel("Counter value")).toBeVisible();
    expect(page.frames()).toContain(frame);
  }
  await edit(page, sample("UNDO_MARKER"));
  await editor(page).press("ControlOrMeta+z");
  await expect(
    page.getByText("Showing submitted code.", { exact: true }),
  ).toBeVisible();
  await editor(page).press("Tab");
  await expect(editor(page)).not.toBeFocused();
  await page.getByRole("button", { name: "Reset code", exact: true }).click();
  await expect(
    page.getByText(/Code changed since last submission/),
  ).toBeVisible();
  expect(page.frames()).toContain(frame);
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await submit(page);
  await expect(preview(page).getByLabel("Counter value")).toHaveText("1", {
    timeout: 60000,
  });
  await page.waitForTimeout(1200);
  await expect(preview(page).getByLabel("Counter value")).toHaveText("1");
  await submit(page);
  await expect(preview(page).getByLabel("Counter value")).toHaveText("0", {
    timeout: 60000,
  });
});

test("shows bounded logs, isolated guest access and recoverable submitted errors", async ({
  page,
}) => {
  await page.goto(workspace);
  await edit(
    page,
    'let result="";try{result=window.parent.document.title}catch(error){result=error.name};for(let i=0;i<120;i++)console.log("MESSAGE_"+i);export default function App(){return <p>{result}</p>;}',
  );
  await submit(page);
  await expect(preview(page).getByText("SecurityError")).toBeVisible({
    timeout: 60000,
  });
  await expect(page.locator("iframe")).toHaveAttribute(
    "sandbox",
    "allow-scripts allow-same-origin",
  );
  await expect(page.locator("iframe")).toHaveAttribute(
    "allow",
    /camera 'none'.*microphone 'none'/,
  );
  const frame = page
    .frames()
    .find((frame) => frame.url().includes("sandpack.codesandbox.io"));
  await page.getByRole("tab", { name: "Console / errors" }).click();
  const consolePanel = page.getByRole("tabpanel", { name: "Console / errors" });
  await expect(consolePanel).toContainText("MESSAGE_119");
  await expect(consolePanel).not.toContainText('"MESSAGE_0"');
  await page.getByRole("tab", { name: "Preview", exact: true }).click();
  expect(page.frames()).toContain(frame);
  await edit(
    page,
    'export default function App(){throw new Error("PILOT_RUNTIME_ERROR");return <p/>;}',
  );
  await submit(page);
  await expect(
    page
      .getByRole("tabpanel", { name: "Preview", exact: true })
      .getByRole("alert"),
  ).toContainText("PILOT_RUNTIME_ERROR", { timeout: 60000 });
  await edit(page, sample("RECOVERED"));
  await submit(page);
  await expect(preview(page).getByText("RECOVERED")).toBeVisible({
    timeout: 60000,
  });
  await edit(
    page,
    "export default function App(){return <main>Invalid</div>;}",
  );
  await submit(page);
  await expect(
    page
      .getByRole("tabpanel", { name: "Preview", exact: true })
      .getByRole("alert"),
  ).toContainText("App.tsx", { timeout: 60000 });
  await edit(
    page,
    'const value:number="TS_WITHOUT_SEMANTIC_CHECK";export default function App(){return <p>{value}</p>;}',
  );
  await submit(page);
  await expect(
    preview(page).getByText("TS_WITHOUT_SEMANTIC_CHECK"),
  ).toBeVisible({ timeout: 60000 });
});

test("a blocked bundler times out and Submit retries without losing drafts", async ({
  page,
}) => {
  await page.route("https://2-19-8-sandpack.codesandbox.io/**", (route) =>
    route.abort(),
  );
  await page.goto(workspace);
  await edit(page, sample("BLOCKED_FIRST"));
  await submit(page);
  await expect(
    page.getByRole("status").filter({ hasText: "Preparing React preview" }),
  ).toBeVisible();
  await edit(page, sample("RETRY_LATEST_DRAFT"));
  const question = page.getByRole("textbox", {
    name: "Your question",
    exact: true,
  });
  await question.fill("Keep my unsent question");
  await expect(
    page.getByRole("status").filter({ hasText: "Preview service unavailable" }),
  ).toBeVisible({ timeout: 35000 });
  await expect(question).toHaveValue("Keep my unsent question");
  await page.unroute("https://2-19-8-sandpack.codesandbox.io/**");
  await submit(page);
  await expect(preview(page).getByText("RETRY_LATEST_DRAFT")).toBeVisible({
    timeout: 60000,
  });
  await expect(question).toHaveValue("Keep my unsent question");
});

test("tutor snapshots use unsent source through stop, retry and follow-up", async ({
  page,
}) => {
  const requests: { code: string; question: string; history: unknown[] }[] = [];
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**${tutorPath}`, async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) await waiting;
    await route
      .fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: stream("A bounded source-only hint."),
      })
      .catch(() => {});
  });
  await page.goto(workspace);
  await edit(page, sample("UNSUBMITTED_ONE"));
  expect(requests).toHaveLength(0);
  await ask(page, "First question");
  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0]?.code).toBe(sample("UNSUBMITTED_ONE"));
  await page.getByRole("button", { name: "Stop reply", exact: true }).click();
  await expect(
    page.getByText("Reply stopped. Your question is kept."),
  ).toBeVisible();
  await edit(page, sample("UNSUBMITTED_RETRY"));
  await page
    .getByRole("textbox", { name: "Your question", exact: true })
    .fill("Newer draft question");
  await page
    .getByRole("button", { name: "Retry with current code", exact: true })
    .click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1]?.code).toBe(sample("UNSUBMITTED_RETRY"));
  expect(requests[1]?.question).toBe("First question");
  await expect(
    page.getByText("Tutor reply complete.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Your question", exact: true }),
  ).toHaveValue("Newer draft question");
  release();
  await submit(page);
  await expect(preview(page).getByText("UNSUBMITTED_RETRY")).toBeVisible({
    timeout: 60000,
  });
  await edit(page, sample("LATEST_UNSUBMITTED"));
  await ask(page, "Follow up");
  await expect.poll(() => requests.length).toBe(3);
  expect(requests[2]?.code).toBe(sample("LATEST_UNSUBMITTED"));
  expect(requests[2]?.history).toHaveLength(2);
  await expect(page.getByTestId("tutor-turn")).toHaveCount(2);
  await expect(
    page.getByText("Code changed since this question.").first(),
  ).toBeVisible();
  await expect(preview(page).getByText("UNSUBMITTED_RETRY")).toBeVisible();
});

test("rejects anonymous access, guest origins and unknown resources", async ({
  browser,
  page,
}) => {
  const anonymous = await browser.newContext({
    baseURL: "http://localhost:3000",
    storageState: { cookies: [], origins: [] },
  });
  const visitor = await anonymous.newPage();
  await visitor.goto(workspace);
  await expect(visitor).toHaveURL(/sign-in/);
  const input = { code: "", question: "Help", history: [] };
  const denied = await anonymous.request.post(tutorPath, {
    headers: { origin: "http://localhost:3000" },
    data: input,
  });
  expect(denied.status()).toBe(401);
  await anonymous.close();
  expect(
    (
      await page.request.post(tutorPath, {
        headers: { origin: "https://2-19-8-sandpack.codesandbox.io" },
        data: input,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/react/exercises/unknown/tutor", {
        data: input,
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await page.request.post(tutorPath, {
        data: { ...input, runFeedback: {} },
      })
    ).status(),
  ).toBe(400);
  await page.goto("/react/practice/unknown");
  await expect(
    page.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();
});

test("preserves representative JavaScript and Algorithms editor/tutor journeys", async ({
  page,
}) => {
  for (const [subject, slug, id] of [
    ["javascript", "counter", "javascript.counter"],
    ["algorithms", "valid-anagram", "algorithms.valid-anagram"],
  ]) {
    const requests: { code: string }[] = [];
    await page.route(`**/api/problems/${id}/tutor`, async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: stream("Existing workspace hint."),
      });
    });
    await page.goto(`/${subject}/practice/${slug}`);
    const source = page.getByRole("textbox", {
      name: "JavaScript solution",
      exact: true,
    });
    await expect(source).toBeVisible();
    await expect(page.getByText("Loading saved code…")).toHaveCount(0);
    const draft = `// ${subject} regression draft\nfunction example(){return 1;}`;
    await source.fill(draft);
    await page
      .getByRole("button", { name: "Show AI tutor", exact: true })
      .click();
    await ask(page, "Read this current draft");
    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]?.code).toBe(draft);
    await expect(page.getByText("Existing workspace hint.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Run", exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Submit", exact: true }),
    ).toBeEnabled();
  }
});
