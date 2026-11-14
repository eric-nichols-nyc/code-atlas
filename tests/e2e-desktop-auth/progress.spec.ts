import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from "@playwright/test";
import {
  counterProblem,
  type ExecutionAction,
  type ExecutionResult,
  type SavedProblemProgress,
} from "@workspace/problems";
import { electronEnvironment } from "../../apps/desktop/src/config";

const origin = "http://localhost:3000/";
const problemPath = "/javascript/practice/counter";
const progressPath = `/api/practice-progress/${counterProblem.id}`;
const desktopRequire = createRequire(
  new URL("../../apps/desktop/package.json", import.meta.url),
);

async function launch(appData: string) {
  // Electron setPath requires its destination to exist, like an installed profile.
  await mkdir(join(appData, "Code Atlas Local"), { recursive: true });
  const application = await electron.launch({
    timeout: 15000,
    executablePath: desktopRequire("electron") as string,
    args: [
      fileURLToPath(
        new URL(
          "../../apps/desktop/scripts/auth-test-entry.mjs",
          import.meta.url,
        ),
      ),
      `--code-atlas-test-app-data=${appData}`,
    ],
    env: electronEnvironment(process.env, origin),
  });
  try {
    const page = await application.firstWindow({ timeout: 15000 });
    expect(
      await application.evaluate(({ app }) => app.getPath("userData")),
    ).toBe(join(appData, "Code Atlas Local"));
    const window = await application.browserWindow(page);
    expect(
      await window.evaluate((window) => window.webContents.session.storagePath),
    ).toBe(join(appData, "Code Atlas Local", "Partitions", "code-atlas"));
    await page.waitForURL(origin);
    return { application, page };
  } catch (error) {
    await application.close();
    throw error;
  }
}

async function progress(page: Page) {
  // Fetch in the real renderer so identity comes from Electron's own cookies.
  const result = await page.evaluate(async (path) => {
    const response = await fetch(path, { cache: "no-store" });
    return { status: response.status, body: await response.json() };
  }, progressPath);
  expect(result.status).toBe(200);
  return (result.body as { record: SavedProblemProgress | null }).record;
}

async function execute(page: Page, action: ExecutionAction, source: string) {
  await page.getByRole("textbox", { name: "JavaScript solution" }).fill(source);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() ===
        new URL(`/api/problems/${counterProblem.id}/${action}`, origin).href &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", {
      name: action === "run" ? "Run" : "Submit",
      exact: true,
    })
    .click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const result = (await response.json()) as ExecutionResult;
  expect(result).toMatchObject({
    action,
    verdict: "accepted",
    persistence: "saved",
  });
  expect(result.total).toBeGreaterThan(0);
  expect(result.passed).toBe(result.total);
  await expect(page.getByTestId("execution-verdict")).toHaveText("Accepted");
  await expect(
    page.getByText("Saved to account · Tab moves focus out"),
  ).toBeVisible();
  return result;
}

test("Electron Run → Submit → full quit → signed-in account restoration", async () => {
  const appData = await mkdtemp(join(tmpdir(), "code-atlas-desktop-auth-"));
  let application: ElectronApplication | undefined;
  try {
    let desktop = await launch(appData);
    application = desktop.application;
    let page = desktop.page;
    await page.goto(new URL("/sign-in", origin).href);
    await expect(page.getByText(/Google sign-in.*browser/)).toBeVisible();
    await page
      .getByRole("textbox", { name: "Email", exact: true })
      .fill(process.env.NEON_TEST_USER_EMAIL as string);
    await page
      .getByLabel("Password", { exact: true })
      .fill(process.env.NEON_TEST_USER_PASSWORD as string);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: "Your learning space" }),
    ).toBeVisible();

    await page.goto(new URL(problemPath, origin).href);
    await expect(page.getByText("Loading saved code…")).toHaveCount(0);
    const before = await progress(page);
    const marker = randomUUID();
    const runSource = `// Electron Run ${marker}\n${counterProblem.solution}`;
    const submittedSource = `// Electron Submit ${marker}\n${counterProblem.solution}`;
    await page.getByRole("spinbutton", { name: "n =", exact: true }).fill("41");
    await page
      .getByRole("spinbutton", { name: "calls =", exact: true })
      .fill("4");
    const run = await execute(page, "run", runSource);
    expect(run.total).toBe(counterProblem.samples.length);
    expect(run.cases[0]?.actual).toEqual([41, 42, 43, 44]);
    expect(await progress(page)).toMatchObject({
      lastCode: runSource,
      solvedAt: before?.solvedAt ?? null,
    });

    const submit = await execute(page, "submit", submittedSource);
    expect(submit.total).toBeGreaterThan(run.total);
    const saved = await progress(page);
    expect(saved?.lastCode).toBe(submittedSource);
    expect(saved?.solvedAt).toEqual(expect.any(String));
    expect(saved?.codeUpdatedAt).toEqual(expect.any(String));
    await page
      .getByRole("textbox", { name: "JavaScript solution" })
      .fill(`// Unsaved typing ${marker}`);
    await expect(
      page.getByText("Unsaved edits · Run or Submit to save"),
    ).toBeVisible();

    // close() calls app.quit(), then waits for the entire native process to exit.
    const firstProcess = application.process();
    await application.close();
    application = undefined;
    expect(firstProcess.exitCode).toBe(0);
    expect(firstProcess.signalCode).toBeNull();
    desktop = await launch(appData);
    application = desktop.application;
    page = desktop.page;
    expect(application.process().pid).not.toBe(firstProcess.pid);
    await page.goto(new URL(problemPath, origin).href);
    await expect(page).toHaveURL(new URL(problemPath, origin).href);
    await expect(
      page.getByRole("textbox", { name: "JavaScript solution" }),
    ).toHaveText(submittedSource, { useInnerText: true });
    await expect(
      page.getByText("Saved to account · Tab moves focus out"),
    ).toBeVisible();
    await expect(page.getByTestId("execution-verdict")).toHaveCount(0);
    expect(await progress(page)).toEqual(saved);
    await page.getByRole("link", { name: "Back", exact: true }).click();
    await expect(
      page.getByRole("img", {
        name: "Counter: solved in your account",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    try {
      await application?.close();
    } finally {
      await rm(appData, { recursive: true, force: true });
    }
  }
});
