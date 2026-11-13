import { describe, expect, it } from "vitest";
import {
  allowPermission,
  electronEnvironment,
  externalUrl,
  isApplicationUrl,
  resolveConnection,
  validateServerUrl,
} from "./config.js";

describe("desktop trust boundary", () => {
  it("uses HTTPS for distribution and permits loopback only in explicit local mode", () => {
    expect(validateServerUrl("https://code.example", false)).toBe(
      "https://code.example/",
    );
    for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
      expect(validateServerUrl(`http://${host}:3000`, true)).toBe(
        `http://${host}:3000/`,
      );
      expect(() => validateServerUrl(`https://${host}`, false)).toThrow();
    }
    for (const url of [
      "http://remote.example",
      "http://localhost.evil.test",
      "file:///app",
      "javascript:alert(1)",
      "https://user:secret@code.example",
      "https://code.example/path",
      "https://code.example/?secret=x",
      "https://code.example/#fragment",
    ]) {
      expect(() => validateServerUrl(url, true)).toThrow();
    }
  });
  it("fixes the packaged origin instead of trusting launch environment overrides", () => {
    expect(
      resolveConnection(
        true,
        { CODE_ATLAS_DESKTOP_URL: "https://attacker.example" },
        { serverUrl: "https://code.example/", local: false },
      ),
    ).toEqual({ serverUrl: "https://code.example/", local: false });
    expect(() => resolveConnection(true, {})).toThrow();
    expect(() =>
      resolveConnection(
        true,
        {},
        { serverUrl: "http://localhost:3000", local: false },
      ),
    ).toThrow();
  });
  it("compares exact origins and opens only safe external HTTPS URLs", () => {
    const origin = "https://code.example/";
    expect(
      isApplicationUrl("https://code.example/javascript/practice", origin),
    ).toBe(true);
    for (const url of [
      "https://code.example.evil.test",
      "https://code.example:8080",
      "http://code.example",
      "https://user@code.example",
      "data:text/html,hi",
      "not a URL",
    ])
      expect(isApplicationUrl(url, origin)).toBe(false);
    expect(externalUrl("https://docs.example/help")).toBe(
      "https://docs.example/help",
    );
    for (const url of [
      "file:///secret",
      "http://remote.example",
      "mailto:a@example.com",
      "javascript:alert(1)",
      "https://user:pass@docs.example",
      "not a URL",
    ])
      expect(externalUrl(url)).toBeUndefined();
  });
  it("denies native permission requests except safe clipboard writes by the app", () => {
    expect(
      allowPermission(
        "clipboard-sanitized-write",
        "https://code.example",
        "https://code.example/",
      ),
    ).toBe(true);
    for (const permission of [
      "media",
      "geolocation",
      "notifications",
      "filesystem",
      "clipboard-read",
      "display-capture",
    ])
      expect(
        allowPermission(
          permission,
          "https://code.example",
          "https://code.example/",
        ),
      ).toBe(false);
    expect(
      allowPermission(
        "clipboard-sanitized-write",
        "https://external.example",
        "https://code.example/",
      ),
    ).toBe(false);
  });
  it("does not pass backend secrets or Node/Electron runtime overrides to the app process", () => {
    const result = electronEnvironment(
      {
        PATH: "/bin",
        HOME: "/Users/example",
        LANG: "en_US",
        LC_ALL: "en_US",
        DATABASE_URL: "private-db",
        NEON_AUTH_COOKIE_SECRET: "private-cookie",
        NEON_AUTH_BASE_URL: "private-auth",
        NODE_OPTIONS: "--inspect",
        ELECTRON_RUN_AS_NODE: "1",
        CODE_ATLAS_DESKTOP_URL: "https://wrong.example",
      },
      "https://code.example/",
    );
    expect(result).toEqual({
      PATH: "/bin",
      HOME: "/Users/example",
      LANG: "en_US",
      LC_ALL: "en_US",
      NODE_ENV: "development",
      CODE_ATLAS_DESKTOP_URL: "https://code.example/",
    });
  });
});
