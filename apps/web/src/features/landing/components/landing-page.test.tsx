import { render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ configured: true }));
const session = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@clerk/nextjs/server", () => ({ auth: session }));

import HomePage from "@/app/page";

beforeEach(() => {
  state.configured = true;
  session.mockReset();
});

it.each([
  [true, null, "/sign-in"],
  [true, "verified-learner", "/dashboard"],
  [false, null, "/sign-in"],
] as const)(
  "routes the primary action with auth configured=%s, identity=%s",
  async (configured, userId, href) => {
    state.configured = configured;
    session.mockResolvedValue({ userId });
    render(await HomePage());
    const hero = screen.getByRole("region", {
      name: "Know the concept. Write the code.",
    });
    expect(within(hero).getByText("Code Atlas", { exact: true })).toBeVisible();
    expect(
      within(hero).getByRole("link", { name: "Start practicing" }),
    ).toHaveAttribute("href", href);
    expect(within(hero).getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByText("JavaScript is your starting point")).toBeNull();
    expect(
      screen.queryByRole("list", { name: "Practice benefits" }),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: "Try an example" })).toBeNull();
    expect(session).toHaveBeenCalledTimes(configured ? 1 : 0);
  },
);
