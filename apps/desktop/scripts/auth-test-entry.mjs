import { isAbsolute } from "node:path";
import { app } from "electron";

// Redirect only the app-data root before loading the real compiled entry point.
// main.js still owns the single-instance lock, persistent partition and lifecycle.
const appData = app.commandLine.getSwitchValue("code-atlas-test-app-data");
if (!appData || !isAbsolute(appData))
  throw new Error("A temporary absolute app-data directory is required.");
app.setPath("appData", appData);
await import("../dist/main.js");
