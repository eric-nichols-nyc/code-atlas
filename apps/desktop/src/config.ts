export const DEVELOPMENT_URL = "http://localhost:3000/";
export const DESKTOP_USER_AGENT = "CodeAtlasDesktop/0.1";

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function validateServerUrl(value: string, allowLocal: boolean): string {
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error(
      "Use the server origin only, without credentials, path, query or fragment.",
    );
  }
  const local = loopbackHosts.has(url.hostname);
  if (
    url.protocol !== "https:" &&
    !(allowLocal && local && url.protocol === "http:")
  ) {
    throw new Error(
      "A hosted desktop build requires an HTTPS Code Atlas server.",
    );
  }
  if (local && !allowLocal)
    throw new Error("Use the explicit local-build command for localhost.");
  return `${url.origin}/`;
}

export interface DesktopConnection {
  serverUrl: string;
  local: boolean;
}
export function resolveConnection(
  packaged: boolean,
  environment: Record<string, string | undefined>,
  configuration?: unknown,
): DesktopConnection {
  if (!packaged)
    return {
      serverUrl: validateServerUrl(
        environment.CODE_ATLAS_DESKTOP_URL || DEVELOPMENT_URL,
        true,
      ),
      local: true,
    };
  if (
    !configuration ||
    typeof configuration !== "object" ||
    Array.isArray(configuration)
  )
    throw new Error("Desktop connection configuration is missing.");
  const config = configuration as Record<string, unknown>;
  if (typeof config.serverUrl !== "string" || typeof config.local !== "boolean")
    throw new Error("Desktop connection configuration is invalid.");
  return {
    serverUrl: validateServerUrl(config.serverUrl, config.local),
    local: config.local,
  };
}

export function isApplicationUrl(value: string, serverUrl: string): boolean {
  try {
    const url = new URL(value);
    return (
      !url.username &&
      !url.password &&
      url.origin === new URL(serverUrl).origin &&
      ["http:", "https:"].includes(url.protocol)
    );
  } catch {
    return false;
  }
}
export function externalUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function allowPermission(
  permission: string,
  origin: string,
  serverUrl: string,
): boolean {
  return (
    permission === "clipboard-sanitized-write" &&
    isApplicationUrl(origin, serverUrl)
  );
}

/** Desktop subprocesses receive platform settings and a public URL, not backend secrets. */
export function electronEnvironment(
  source: Record<string, string | undefined>,
  serverUrl: string,
) {
  const permitted = new Set([
    "PATH",
    "HOME",
    "USER",
    "LOGNAME",
    "SHELL",
    "LANG",
    "TZ",
    "TMPDIR",
    "TMP",
    "TEMP",
    "SystemRoot",
    "SYSTEMROOT",
    "WINDIR",
    "APPDATA",
    "LOCALAPPDATA",
    "DISPLAY",
    "WAYLAND_DISPLAY",
    "XDG_RUNTIME_DIR",
    "XDG_CONFIG_HOME",
    "XDG_CACHE_HOME",
    "DBUS_SESSION_BUS_ADDRESS",
    "XAUTHORITY",
    "__CF_USER_TEXT_ENCODING",
  ]);
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(source))
    if (value !== undefined && (permitted.has(key) || key.startsWith("LC_")))
      result[key] = value;
  result.NODE_ENV = "development";
  result.CODE_ATLAS_DESKTOP_URL = serverUrl;
  return result;
}
