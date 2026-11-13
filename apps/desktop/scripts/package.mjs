import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractFile, listPackage } from "@electron/asar";
import { packager } from "@electron/packager";
import { DEVELOPMENT_URL, validateServerUrl } from "../dist/config.js";

const desktop = fileURLToPath(new URL("../", import.meta.url));
const metadata = JSON.parse(
  await readFile(join(desktop, "package.json"), "utf8"),
);
const local = process.argv.includes("--local");
const requestedUrl =
  process.env.CODE_ATLAS_DESKTOP_URL || (local ? DEVELOPMENT_URL : "");
if (!requestedUrl)
  throw new Error(
    "Set CODE_ATLAS_DESKTOP_URL to your hosted HTTPS origin, or use pnpm desktop:package:local.",
  );
const serverUrl = validateServerUrl(requestedUrl, local);
const staging = await mkdtemp(join(tmpdir(), "code-atlas-package-"));
const runtime = ["config.js", "main.js", "window.js"];
try {
  for (const file of runtime)
    await cp(join(desktop, "dist", file), join(staging, "dist", file), {
      recursive: true,
    });
  await writeFile(
    join(staging, "package.json"),
    JSON.stringify({
      name: "code-atlas-desktop",
      productName: "Code Atlas",
      version: metadata.version,
      type: "module",
      main: "dist/main.js",
    }),
  );
  await writeFile(
    join(staging, "desktop-config.json"),
    JSON.stringify({ serverUrl, local }),
  );
  const paths = await packager({
    dir: staging,
    out: join(desktop, "release"),
    name: local ? "Code Atlas Local" : "Code Atlas",
    appBundleId: local
      ? "com.codeatlas.desktop.local"
      : "com.codeatlas.desktop",
    appVersion: metadata.version,
    electronVersion: metadata.devDependencies.electron,
    platform: process.platform,
    arch: process.arch,
    asar: true,
    prune: false,
    overwrite: true,
  });
  for (const path of paths) {
    const archive =
      process.platform === "darwin"
        ? join(
            path,
            `${local ? "Code Atlas Local" : "Code Atlas"}.app`,
            "Contents",
            "Resources",
            "app.asar",
          )
        : join(path, "resources", "app.asar");
    const allowed = new Set([
      "/dist",
      ...runtime.map((file) => `/dist/${file}`),
      "/package.json",
      "/desktop-config.json",
    ]);
    assert.deepEqual(
      new Set(listPackage(archive)),
      allowed,
      "Unexpected files in the desktop package",
    );
    assert.deepEqual(
      JSON.parse(extractFile(archive, "desktop-config.json").toString()),
      { serverUrl, local },
    );
    console.log(
      `Packaged and verified: ${path}\nServer: ${serverUrl}\nUnsigned local build; signing/notarization are not configured.`,
    );
  }
} finally {
  await rm(staging, { recursive: true, force: true });
}
