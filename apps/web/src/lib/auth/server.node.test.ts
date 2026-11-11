import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ configured: false }));
const session = vi.hoisted(() => vi.fn());
const create = vi.hoisted(() => vi.fn(() => ({ getSession: session })));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@neon/auth/next/server", () => ({ createNeonAuth: create }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

import {
  getVerifiedUserId,
  learnerStorageId,
  requirePageLearner,
} from "./server";

beforeEach(() => {
  state.configured = false;
  vi.stubEnv("NEON_AUTH_BASE_URL", "https://example.neonauth.test/auth");
  vi.stubEnv(
    "NEON_AUTH_COOKIE_SECRET",
    "unit-test-cookie-secret-32-characters",
  );
  vi.clearAllMocks();
  session.mockResolvedValue({ data: null, error: null });
});
it("does not initialize the SDK without configuration", async () => {
  expect(await getVerifiedUserId()).toBeNull();
  expect(create).not.toHaveBeenCalled();
  expect(session).not.toHaveBeenCalled();
});
it("reads identity only from a verified session and rejects missing sessions", async () => {
  state.configured = true;
  await expect(requirePageLearner()).rejects.toThrow("redirect:/sign-in");
  session.mockResolvedValue({
    data: { user: { id: "neon-user" } },
    error: null,
  });
  expect(await requirePageLearner()).toBe("neon-user");
  expect(learnerStorageId("neon-user")).toBe("neon:neon-user");
});
it("fails closed on upstream errors rather than trusting cached UI state", async () => {
  state.configured = true;
  session.mockResolvedValue({
    data: { user: { id: "forged" } },
    error: { message: "unavailable" },
  });
  await expect(getVerifiedUserId()).rejects.toThrow(
    "Authentication is temporarily unavailable",
  );
});
