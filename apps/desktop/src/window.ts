import { BrowserWindow, session, shell, type WebPreferences } from "electron";
import {
  allowPermission,
  DESKTOP_USER_AGENT,
  externalUrl,
  isApplicationUrl,
} from "./config.js";

export const securePreferences: Readonly<WebPreferences> = Object.freeze({
  nodeIntegration: false,
  nodeIntegrationInWorker: false,
  nodeIntegrationInSubFrames: false,
  contextIsolation: true,
  sandbox: true,
  webSecurity: true,
  allowRunningInsecureContent: false,
  webviewTag: false,
  navigateOnDragDrop: false,
  safeDialogs: true,
});
const downloadProtectedSessions = new WeakSet<object>();

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] || character,
  );
}
export function connectionErrorPage(serverUrl: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'"><title>Code Atlas</title><style>html{color-scheme:dark;font-family:system-ui,sans-serif;background:#0e0e0e;color:#f9f9f9}body{min-height:100vh;margin:0;display:grid;place-items:center}main{max-width:32rem;padding:2rem}h1{font-size:1.7rem;letter-spacing:-.03em}p{color:#a3a3a3;line-height:1.65}a{display:inline-block;padding:.7rem 1.2rem;margin-top:.5rem;border-radius:6px;background:#f9f9f9;color:#111;text-decoration:none}a:focus-visible{outline:3px solid #b7c9e8;outline-offset:4px}</style></head><body><main><h1>Code Atlas couldn’t connect.</h1><p>Check your connection and try again. If you’re using a local build, make sure the Code Atlas web app is running.</p><a href="${escapeHtml(serverUrl)}">Try again</a></main></body></html>`;
}

export function createDesktopWindow(options: {
  serverUrl: string;
  partition?: string;
  show?: boolean;
  development?: boolean;
  openExternal?: (url: string) => Promise<unknown>;
}) {
  const { serverUrl, development = false } = options;
  const desktopSession = session.fromPartition(
    options.partition || "persist:code-atlas",
  );
  desktopSession.setPermissionCheckHandler((_contents, permission, origin) =>
    allowPermission(permission, origin, serverUrl),
  );
  desktopSession.setPermissionRequestHandler(
    (contents, permission, callback, details) =>
      callback(
        allowPermission(
          permission,
          details.requestingUrl || contents.getURL(),
          serverUrl,
        ),
      ),
  );
  if (!downloadProtectedSessions.has(desktopSession)) {
    desktopSession.on("will-download", (event) => event.preventDefault());
    downloadProtectedSessions.add(desktopSession);
  }
  const window = new BrowserWindow({
    title: "Code Atlas",
    width: 1440,
    height: 960,
    minWidth: 360,
    minHeight: 600,
    show: false,
    backgroundColor: "#0e0e0e",
    autoHideMenuBar: process.platform !== "darwin",
    webPreferences: {
      ...securePreferences,
      session: desktopSession,
      devTools: development,
    },
  });
  window.webContents.setUserAgent(
    `${window.webContents.getUserAgent()} ${DESKTOP_USER_AGENT}`,
  );
  const openExternal = options.openExternal || shell.openExternal;
  const openLink = (value: string) => {
    const url = externalUrl(value);
    if (url)
      void openExternal(url).catch(() =>
        console.warn("Unable to open the external link."),
      );
  };
  const navigate = (event: { preventDefault(): void }, url: string) => {
    if (isApplicationUrl(url, serverUrl)) return;
    event.preventDefault();
    openLink(url);
  };
  window.webContents.on("will-navigate", navigate);
  window.webContents.on("will-redirect", navigate);
  window.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  window.webContents.setWindowOpenHandler(({ url }) => {
    openLink(url);
    return { action: "deny" };
  });
  let showingFailure = false;
  window.webContents.on(
    "did-start-navigation",
    (_event, url, _inPlace, mainFrame) => {
      if (mainFrame && isApplicationUrl(url, serverUrl)) showingFailure = false;
    },
  );
  const showFailure = () => {
    if (window.isDestroyed() || showingFailure) return;
    showingFailure = true;
    void window
      .loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(connectionErrorPage(serverUrl))}`,
      )
      .catch(() => console.warn("Unable to display the connection screen."));
  };
  window.webContents.on(
    "did-fail-load",
    (_event, code, _description, _url, mainFrame) => {
      if (mainFrame && code !== -3) showFailure();
    },
  );
  window.webContents.on("did-navigate", (_event, url) => {
    if (isApplicationUrl(url, serverUrl)) showingFailure = false;
  });
  window.webContents.on("render-process-gone", () => showFailure());
  window.once("ready-to-show", () => {
    if (options.show !== false) window.show();
  });
  const load = () => window.loadURL(serverUrl).catch(() => showFailure());
  return { window, load };
}
