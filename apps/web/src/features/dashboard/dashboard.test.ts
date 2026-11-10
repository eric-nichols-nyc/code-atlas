import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";

const state = vi.hoisted(() => ({ configured: true }));
const protect = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@clerk/nextjs/server", () => ({ auth: { protect } }));

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

  it("shows the three text-only subjects with unavailable paths disabled", async () => {
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
    for (const button of screen.getAllByRole("button", {
      name: "Coming soon",
    })) {
      expect(button).toBeDisabled();
    }
    expect(screen.getAllByRole("button", { name: "Coming soon" })).toHaveLength(
      2,
    );
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
