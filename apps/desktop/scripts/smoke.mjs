import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import electron from "electron";
import { DEVELOPMENT_URL, electronEnvironment } from "../dist/config.js";

const child = spawn(
  electron,
  [fileURLToPath(new URL("smoke-entry.mjs", import.meta.url))],
  {
    stdio: "inherit",
    env: electronEnvironment(process.env, DEVELOPMENT_URL),
  },
);
const timeout = setTimeout(() => {
  console.error("Native smoke test timed out.");
  child.kill("SIGTERM");
  process.exitCode = 1;
}, 45000);
child.once("error", (error) => {
  clearTimeout(timeout);
  console.error(error.message);
  process.exitCode = 1;
});
child.once("exit", (code) => {
  clearTimeout(timeout);
  if (process.exitCode !== 1) process.exitCode = code ?? 1;
});
