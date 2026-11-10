import { afterEach, beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  configured: true,
  userId: "verified-owner" as string | null,
}));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({
    userId: state.userId,
    getToken: async () => "verified-token",
  }),
}));

import {
  GET,
  PATCH,
  POST,
} from "@/app/api/practice-progress/[[...path]]/route";

const context = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const req = (
  method = "GET",
  body?: unknown,
  origin = "http://localhost:3000",
) =>
  new Request("http://localhost:3000/api/practice-progress/javascript.sleep", {
    method,
    headers: { origin, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
beforeEach(() => {
  state.configured = true;
  state.userId = "verified-owner";
});
afterEach(() => vi.unstubAllGlobals());
it("blocks unauthenticated and foreign-origin progress requests before forwarding", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  state.configured = false;
  expect((await GET(req(), context())).status).toBe(503);
  state.configured = true;
  state.userId = null;
  expect((await GET(req(), context())).status).toBe(401);
  state.userId = "verified-owner";
  expect(
    (
      await PATCH(
        req("PATCH", { flagged: true }, "https://foreign.example"),
        context("javascript.sleep"),
      )
    ).status,
  ).toBe(403);
  expect(fetch).not.toHaveBeenCalled();
});
it("forwards only known progress resources with a verified token and no-store", async () => {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
    Response.json({ records: [] }),
  );
  vi.stubGlobal("fetch", fetch);
  const response = await GET(req(), context());
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(fetch.mock.calls[0]?.[0]).toContain("/v1/practice-progress");
  expect(
    new Headers(fetch.mock.calls[0]?.[1]?.headers).get("Authorization"),
  ).toBe("Bearer verified-token");
  expect(fetch.mock.calls[0]?.[1]?.cache).toBe("no-store");
  expect((await GET(req(), context("unknown"))).status).toBe(404);
  expect((await GET(req(), context("javascript.sleep", "other"))).status).toBe(
    404,
  );
});
it("bounds import payloads and hides upstream infrastructure details", async () => {
  const fetch = vi.fn(async () =>
    Response.json({ error: "secret database credentials" }, { status: 500 }),
  );
  vi.stubGlobal("fetch", fetch);
  expect(
    (
      await POST(
        req("POST", { flagged: ["x".repeat(9000)], solved: [] }),
        context("import"),
      )
    ).status,
  ).toBe(413);
  expect(fetch).not.toHaveBeenCalled();
  const response = await GET(req(), context());
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("secret database");
});
