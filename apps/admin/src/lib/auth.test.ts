import { describe, expect, it } from "vitest";
import { isAdmin } from "./auth";

describe("admin authorization", () => {
  it("denies signed-out users and empty allowlists", () => {
    expect(isAdmin(null, "user_admin")).toBe(false);
    expect(isAdmin("user_admin", "")).toBe(false);
  });
  it("requires an exact user ID match", () => {
    expect(isAdmin("user_admin", "user_administrator")).toBe(false);
    expect(isAdmin("user_admin", " user_other, user_admin ")).toBe(true);
  });
});
