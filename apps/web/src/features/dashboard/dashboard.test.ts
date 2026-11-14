import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";

const state = vi.hoisted(() => ({ configured: true }));
const protect = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({
  requirePageLearner: protect,
  learnerStorageId: (id: string) => `neon:${id}`,
}));

beforeEach(() => {
  state.configured = true;
  protect.mockReset();
});

describe("learner dashboard", () => {
  it("keeps subject content unavailable before authentication is configured", async () => {
    state.configured = false;
    render(await DashboardPage());
    expect(screen.getByText("Authentication setup")).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Your learning space" }),
    ).toBeNull();
    expect(protect).not.toHaveBeenCalled();
  });

  it("does not render the dashboard when the server rejects a session", async () => {
    protect.mockRejectedValueOnce(new Error("Sign-in required"));
    await expect(DashboardPage()).rejects.toThrow("Sign-in required");
    expect(protect).toHaveBeenCalledOnce();
  });

  it("shows all three text-only subjects with enabled destinations", async () => {
    render(await DashboardPage());
    expect(protect).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("heading", { name: "Your learning space", level: 1 }),
    ).toBeVisible();
    expect(
      screen
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["JavaScript", "Algorithms", "React JS"]);
    expect(screen.queryByRole("button", { name: "Coming soon" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Explore React JS" }),
    ).toHaveAttribute("href", "/react");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("links JavaScript to its real subject landing", async () => {
    render(await DashboardPage());
    expect(
      screen.getByRole("link", { name: "Explore JavaScript" }),
    ).toHaveAttribute("href", "/javascript");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

it("links Algorithms to its available subject landing", async () => {
  render(await DashboardPage());
  expect(
    screen.getByRole("link", { name: "Explore Algorithms" }),
  ).toHaveAttribute("href", "/algorithms");
});
