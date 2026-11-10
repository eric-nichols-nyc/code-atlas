import { expect, it, vi } from "vitest";
import { GET as health } from "@/app/api/health/route";
import { GET as me } from "@/app/api/me/route";

const state = vi.hoisted(() => ({
  configured: false,
  userId: null as string | null,
}));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: state.userId }),
}));

it("keeps health public while every protected profile read verifies Clerk identity", async () => {
  expect(await health().json()).toEqual({ status: "ok", service: "web" });
  const request = new Request("http://localhost:3000/api/me");
  expect((await me(request)).status).toBe(503);
  state.configured = true;
  expect((await me(request)).status).toBe(401);
  state.userId = "verified-learner";
  expect(await (await me(request)).json()).toEqual({
    userId: "verified-learner",
  });
});
