import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import electron from "electron";
import { electronEnvironment, resolveConnection } from "../dist/config.js";

export const desktopDirectory = fileURLToPath(new URL("../", import.meta.url));
export const repositoryDirectory = fileURLToPath(
  new URL("../../../", import.meta.url),
);
export const { serverUrl } = resolveConnection(false, process.env);

export async function serverReady() {
  try {
    const response = await fetch(new URL("api/health", serverUrl), {
      signal: AbortSignal.timeout(2000),
      redirect: "error",
    });
    const data = await response.json();
    return response.ok && data.status === "ok" && data.service === "web";
  } catch {
    return false;
  }
}

export function launchDesktop(cleanup = () => {}) {
  const child = spawn(electron, [desktopDirectory], {
    cwd: desktopDirectory,
    stdio: "inherit",
    env: electronEnvironment(process.env, serverUrl),
  });
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    child.kill("SIGTERM");
    cleanup();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  child.once("error", (error) => {
    console.error(error.message);
    stop();
    process.exitCode = 1;
  });
  child.once("exit", (code) => {
    cleanup();
    process.exitCode = code ?? 0;
  });
  return child;
}
