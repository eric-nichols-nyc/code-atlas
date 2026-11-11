import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ configured: false }));
const upstream = vi.hoisted(() => vi.fn());
const getAuth = vi.hoisted(() =>
  vi.fn(() => ({
    handler: () => ({
      GET: upstream,
      POST: upstream,
      PUT: upstream,
      PATCH: upstream,
      DELETE: upstream,
    }),
  })),
);
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({ getAuth }));

import { DELETE, GET, PATCH, POST, PUT } from "@/app/api/auth/[...path]/route";

beforeEach(() => {
  vi.clearAllMocks();
  state.configured = false;
});
it("returns no-store setup errors without initializing the SDK", async () => {
  const response = await GET(
    new Request("http://localhost/api/auth/get-session"),
    { params: Promise.resolve({ path: ["get-session"] }) },
  );
  expect(response.status).toBe(503);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(getAuth).not.toHaveBeenCalled();
});
it.each([GET, POST, PUT, PATCH, DELETE])(
  "forwards requests/context through the official SDK",
  async (handler) => {
    state.configured = true;
    const response = new Response("null");
    upstream.mockResolvedValue(response);
    const request = new Request("http://localhost/api/auth/get-session");
    const context = { params: Promise.resolve({ path: ["get-session"] }) };
    expect(await handler(request, context)).toBe(response);
    expect(upstream).toHaveBeenCalledWith(request, context);
  },
);
it("does not leak upstream errors or configuration", async () => {
  state.configured = true;
  upstream.mockRejectedValue(new Error("private backend configuration"));
  const response = await POST(
    new Request("http://localhost/api/auth/sign-in/email"),
    { params: Promise.resolve({ path: ["sign-in", "email"] }) },
  );
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private backend");
});
