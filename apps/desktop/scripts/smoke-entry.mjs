import assert from "node:assert/strict";
import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";
import { app, BrowserWindow } from "electron";
import { createDesktopWindow } from "../dist/window.js";

// Owned local fixture, in-memory session, no accounts, secrets or learner records.
let available = true;
let cookieSeen = false;
const server = createServer((request, response) => {
  if (!available) {
    request.socket.destroy();
    return;
  }
  cookieSeen ||= request.headers.cookie?.includes("desktop-smoke=yes") || false;
  response.setHeader(
    "Set-Cookie",
    "desktop-smoke=yes; HttpOnly; SameSite=Lax; Path=/",
  );
  response.setHeader("Content-Type", "text/html");
  response.end(
    "<!doctype html><title>Code Atlas fixture</title><h1>Desktop fixture ready</h1>",
  );
});
const external = [];
app.on("window-all-closed", () => {});
async function until(check) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      if (await check()) return;
    } catch {
      /* Navigation may be in flight. */
    }
    await setTimeout(50);
  }
  throw new Error("Native assertion did not become true before its deadline.");
}
async function smoke() {
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const serverUrl = `http://127.0.0.1:${server.address().port}/`;
    await app.whenReady();
    const options = {
      serverUrl,
      show: false,
      partition: `smoke-${Date.now()}`,
      openExternal: async (url) => {
        external.push(url);
      },
    };
    let desktop = createDesktopWindow(options);
    await desktop.load();
    const contents = desktop.window.webContents;
    const preferences = contents.getLastWebPreferences();
    for (const key of ["sandbox", "contextIsolation", "webSecurity"])
      assert.equal(preferences[key], true, key);
    for (const key of [
      "nodeIntegration",
      "nodeIntegrationInWorker",
      "nodeIntegrationInSubFrames",
      "webviewTag",
    ])
      assert.equal(preferences[key], false, key);
    assert.deepEqual(
      await contents.executeJavaScript(
        "({require:typeof require,process:typeof process,title:document.title})",
      ),
      {
        require: "undefined",
        process: "undefined",
        title: "Code Atlas fixture",
      },
    );
    await contents.executeJavaScript(
      "window.open('https://example.com/desktop-test'); window.open('file:///etc/passwd'); window.open('javascript:alert(1)');",
      true,
    );
    await until(() => external.length === 1);
    assert.deepEqual(external, ["https://example.com/desktop-test"]);
    assert.equal(BrowserWindow.getAllWindows().length, 1, "Popups are denied");
    await contents.executeJavaScript(
      "location.href = 'https://example.com/navigation-test'",
      true,
    );
    await until(() => external.length === 2);
    assert.equal(
      new URL(contents.getURL()).origin,
      new URL(serverUrl).origin,
      "Main window stays on the app origin",
    );
    desktop.window.destroy();
    desktop = createDesktopWindow(options);
    await desktop.load();
    assert.equal(
      cookieSeen,
      true,
      "Same desktop session survives window recreation",
    );
    available = false;
    await desktop.load();
    const failureVisible = async () =>
      (
        await desktop.window.webContents.executeJavaScript(
          "document.body.innerText",
        )
      ).includes("couldn’t connect");
    await until(failureVisible);
    await desktop.window.webContents.executeJavaScript(
      "document.querySelector('a').click()",
      true,
    );
    await until(failureVisible);
    available = true;
    await desktop.window.webContents.executeJavaScript(
      "document.querySelector('a').click()",
      true,
    );
    await until(
      async () =>
        (await desktop.window.webContents.executeJavaScript(
          "document.title",
        )) === "Code Atlas fixture",
    );
    desktop.window.destroy();
    console.log(
      "PASS: native renderer isolation, denied popups, external navigation, session reuse, connection failure and retry.",
    );
    app.exit(0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  } finally {
    server.closeAllConnections();
    server.close();
  }
}
void smoke();
