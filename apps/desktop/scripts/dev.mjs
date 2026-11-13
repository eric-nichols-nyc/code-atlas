import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { setTimeout } from "node:timers/promises";
import { DEVELOPMENT_URL } from "../dist/config.js";
import {
  launchDesktop,
  repositoryDirectory,
  serverReady,
  serverUrl,
} from "./launch.mjs";

let server;
let cleaned = false;
let startupError;
const stopStartup = () => {
  cleanup();
  process.exit(130);
};
function cleanup() {
  if (cleaned || !server?.pid) return;
  cleaned = true;
  if (process.platform === "win32")
    spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  else {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      /* Already exited. */
    }
  }
}
function occupied() {
  const url = new URL(serverUrl);
  return new Promise((resolve) => {
    const socket = createConnection({
      host: url.hostname,
      port: Number(url.port || 80),
    });
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}
try {
  if (!(await serverReady())) {
    if (serverUrl !== DEVELOPMENT_URL)
      throw new Error(
        "Start the configured Code Atlas server before launching desktop development.",
      );
    if (await occupied())
      throw new Error(
        "Port 3000 is occupied by a server that is not ready as Code Atlas. Free the port or set CODE_ATLAS_DESKTOP_URL to your running app.",
      );
    console.log("Starting the Code Atlas web server on localhost:3000…");
    server = spawn(
      process.platform === "win32" ? "pnpm.cmd" : "pnpm",
      [
        "exec",
        "turbo",
        "run",
        "dev",
        "--filter=@workspace/web",
        "--",
        "--webpack",
      ],
      {
        cwd: repositoryDirectory,
        stdio: "inherit",
        detached: process.platform !== "win32",
        env: process.env,
      },
    );
    server.once("error", (error) => {
      startupError = error;
    });
    process.once("SIGINT", stopStartup);
    process.once("SIGTERM", stopStartup);
    const deadline = Date.now() + 90000;
    while (!(await serverReady())) {
      if (startupError) throw startupError;
      if (server.exitCode !== null || Date.now() > deadline)
        throw new Error(
          "The Code Atlas web server did not become ready. Check its startup output.",
        );
      await setTimeout(500);
    }
  }
  process.removeListener("SIGINT", stopStartup);
  process.removeListener("SIGTERM", stopStartup);
  console.log(`Opening Code Atlas desktop: ${serverUrl}`);
  const desktop = launchDesktop(cleanup);
  server?.once("exit", () => desktop.kill("SIGTERM"));
} catch (error) {
  cleanup();
  console.error(error.message);
  process.exitCode = 1;
}
