import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ configured: true }));
const protect = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({
  requirePageLearner: protect,
  learnerStorageId: (id: string) => `neon:${id}`,
}));

import JavaScriptLearnPage from "@/app/javascript/learn/page";
import JavaScriptPracticePage from "@/app/javascript/practice/page";

beforeEach(() => {
  state.configured = true;
  protect.mockReset();
  protect.mockResolvedValue("test-neon-user");
});
describe.each([
  ["Practice", JavaScriptPracticePage],
  ["Learn", JavaScriptLearnPage],
] as const)("JavaScript %s access", (_section, Page) => {
  it("shows setup without learner content", async () => {
    state.configured = false;
    render(await Page());
    expect(screen.getByText("Authentication setup")).toBeVisible();
    expect(
      screen.queryByRole("tablist", { name: "Problem categories" }),
    ).toBeNull();
    expect(protect).not.toHaveBeenCalled();
  });
  it("withholds content when session is rejected", async () => {
    protect.mockRejectedValueOnce(new Error("denied"));
    await expect(Page()).rejects.toThrow("denied");
  });
});
describe("authorized JavaScript sections", () => {
  it("renders the authorized catalog with a valid problem destination", async () => {
    render(await JavaScriptPracticePage());
    expect(protect).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: /Sleep/ })).toHaveAttribute(
      "href",
      "/javascript/practice/sleep",
    );
    expect(screen.getByRole("status")).toHaveTextContent("8 problems");
  });
  it("reserves Learn without publishing lessons or coding controls", async () => {
    render(await JavaScriptLearnPage());
    expect(protect).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("heading", { name: "JavaScript Learn" }),
    ).toBeVisible();
    expect(
      screen.getByText(/JavaScript learning content is coming soon/),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Explore practice problems" }),
    ).toHaveAttribute("href", "/javascript/practice");
    expect(screen.queryByRole("button", { name: "Run" })).toBeNull();
  });
});
