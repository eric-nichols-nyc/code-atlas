import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  configured: true,
  userId: "user_test" as string | null,
}));
const getToken = vi.hoisted(() => vi.fn(async () => "test-token"));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: state.userId, getToken }),
}));

import { POST } from "@/app/api/problems/[problemId]/[action]/route";

const context = {
  params: Promise.resolve({ problemId: "javascript.sleep", action: "run" }),
};
function req(body: unknown, origin = "http://localhost:3000") {
  return new Request(
    "http://localhost:3000/api/problems/javascript.sleep/run",
    {
      method: "POST",
      headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}
beforeEach(() => {
  state.configured = true;
  state.userId = "user_test";
  getToken.mockClear();
});
afterEach(() => vi.unstubAllGlobals());
describe("web execution boundary", () => {
  it("withholds execution without configuration/session and rejects foreign origins", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    state.configured = false;
    expect((await POST(req({ code: "x" }), context)).status).toBe(503);
    state.configured = true;
    state.userId = null;
    expect((await POST(req({ code: "x" }), context)).status).toBe(401);
    state.userId = "user_test";
    expect(
      (await POST(req({ code: "x" }, "https://wrong.example"), context)).status,
    ).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects invalid values before contacting the API", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await POST(req({ code: "x", inputs: [0] }), context)).status).toBe(
      400,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("forwards the verified token and returns infrastructure failure without Accepted", async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
      Response.json({ error: "Unavailable" }, { status: 503 }),
    );
    vi.stubGlobal("fetch", fetch);
    const response = await POST(
      req({ code: "async function sleep(){}", inputs: [100] }),
      context,
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Unavailable" });
    expect(
      new Headers(fetch.mock.calls[0]?.[1]?.headers).get("Authorization"),
    ).toBe("Bearer test-token");
  });
});
