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

it("validates and forwards Counter cases with the session, and strips Submit inputs", async () => {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
    Response.json({
      attemptId: "counter-attempt",
      action: "run",
      verdict: "accepted",
      passed: 1,
      total: 1,
      cases: [],
    }),
  );
  vi.stubGlobal("fetch", fetch);
  const counter = {
    params: Promise.resolve({ problemId: "javascript.counter", action: "run" }),
  };
  expect(
    (await POST(req({ code: "x", inputs: [{ n: 0, calls: 1001 }] }), counter))
      .status,
  ).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
  const inputs = [{ n: -2, calls: 5 }];
  expect(
    (await POST(req({ code: "function createCounter(){}", inputs }), counter))
      .status,
  ).toBe(200);
  expect(fetch.mock.calls[0]?.[0]).toContain(
    "/v1/problems/javascript.counter/run",
  );
  expect(JSON.parse(fetch.mock.calls[0]?.[1]?.body as string).inputs).toEqual(
    inputs,
  );
  expect(
    (
      await POST(req({ code: "x", inputs }), {
        params: Promise.resolve({
          problemId: "javascript.counter",
          action: "submit",
        }),
      })
    ).status,
  ).toBe(200);
  expect(
    JSON.parse(fetch.mock.calls[1]?.[1]?.body as string),
  ).not.toHaveProperty("inputs");
});
