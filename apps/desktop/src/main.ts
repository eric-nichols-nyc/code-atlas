import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  type MenuItemConstructorOptions,
  shell,
} from "electron";
import { resolveConnection } from "./config.js";
import { createDesktopWindow } from "./window.js";

async function start() {
  app.setName("Code Atlas");
  let configuration: unknown;
  if (app.isPackaged) {
    try {
      configuration = JSON.parse(
        await readFile(
          new URL("../desktop-config.json", import.meta.url),
          "utf8",
        ),
      );
    } catch {
      configuration = undefined;
    }
  }
  try {
    const connection = resolveConnection(
      app.isPackaged,
      process.env,
      configuration,
    );
    if (!app.isPackaged || connection.local)
      app.setPath("userData", join(app.getPath("appData"), "Code Atlas Local"));
    if (!app.requestSingleInstanceLock()) app.quit();
    else {
      let mainWindow: BrowserWindow | undefined;
      const create = () => {
        const desktop = createDesktopWindow({
          serverUrl: connection.serverUrl,
          development: !app.isPackaged,
        });
        mainWindow = desktop.window;
        mainWindow.on("closed", () => {
          mainWindow = undefined;
        });
        void desktop.load();
      };
      app.on("second-instance", () => {
        if (!mainWindow) create();
        if (mainWindow?.isMinimized()) mainWindow.restore();
        mainWindow?.show();
        mainWindow?.focus();
      });
      app.on("window-all-closed", () => {
        if (process.platform !== "darwin") app.quit();
      });
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) create();
      });
      await app.whenReady();
      const menu: MenuItemConstructorOptions[] = [
        ...(process.platform === "darwin"
          ? [{ role: "appMenu" as const }]
          : []),
        { role: "fileMenu" },
        { role: "editMenu" },
        {
          label: "View",
          submenu: [
            { role: "reload" },
            { role: "forceReload" },
            ...(app.isPackaged ? [] : [{ role: "toggleDevTools" as const }]),
            { type: "separator" },
            { role: "resetZoom" },
            { role: "zoomIn" },
            { role: "zoomOut" },
            { role: "togglefullscreen" },
          ],
        },
        { role: "windowMenu" },
        {
          label: "Help",
          submenu: [
            {
              label: "Open Code Atlas in Browser",
              click: () => {
                void shell.openExternal(connection.serverUrl);
              },
            },
          ],
        },
      ];
      Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
      create();
    }
  } catch {
    await app.whenReady();
    dialog.showErrorBox(
      "Code Atlas setup",
      "This desktop build needs a valid Code Atlas server URL. Rebuild with CODE_ATLAS_DESKTOP_URL set to the hosted HTTPS origin, or use desktop:package:local for development.",
    );
    app.quit();
  }
}
void start();
