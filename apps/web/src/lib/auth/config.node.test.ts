import { afterEach, expect, it, vi } from "vitest";
import { isAuthConfigured } from "../auth";

afterEach(() => vi.unstubAllEnvs());
it("requires both a Neon URL and a sufficiently long cookie secret", () => {
  vi.stubEnv("NEON_AUTH_BASE_URL", "");
  vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "");
  expect(isAuthConfigured()).toBe(false);
  vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.example.test");
  vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "short");
  expect(isAuthConfigured()).toBe(false);
  vi.stubEnv(
    "NEON_AUTH_COOKIE_SECRET",
    "unit-test-secret-longer-than-32-characters",
  );
  expect(isAuthConfigured()).toBe(true);
});
