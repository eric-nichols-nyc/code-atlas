import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ReactExercisePage from "@/app/react/practice/[exerciseSlug]/page";
import ReactPracticePage from "@/app/react/practice/page";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

const state = vi.hoisted(() => ({ configured: true }));
const protect = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({ requirePageLearner: protect }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not-found");
  },
}));
vi.mock("./components/react-workspace-client", () => ({
  ReactWorkspaceClient: () => <p>Protected React workspace</p>,
}));
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  state.configured = true;
  protect.mockReset();
});
afterEach(() => vi.unstubAllEnvs());
const params = (exerciseSlug = "stale-closure-counter") => ({
  params: Promise.resolve({ exerciseSlug }),
});

it("gates both pages and the dashboard link in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  await expect(ReactPracticePage()).rejects.toThrow("not-found");
  await expect(ReactExercisePage(params())).rejects.toThrow("not-found");
  render(<DashboardContent />);
  expect(screen.queryByRole("link", { name: "Explore React JS" })).toBeNull();
  expect(screen.getByRole("button", { name: "Coming soon" })).toBeDisabled();
  expect(protect).not.toHaveBeenCalled();
});
it("authenticates both resources independently and rejects unknown slugs", async () => {
  protect.mockRejectedValueOnce(new Error("Sign-in required"));
  await expect(ReactPracticePage()).rejects.toThrow("Sign-in required");
  protect.mockRejectedValueOnce(new Error("Sign-in required"));
  await expect(ReactExercisePage(params())).rejects.toThrow("Sign-in required");
  await expect(ReactExercisePage(params("unknown"))).rejects.toThrow(
    "not-found",
  );
  expect(protect).toHaveBeenCalledTimes(3);
});
it("exposes the development catalog and exercise without account controls", async () => {
  render(
    <>
      <DashboardContent />
      {await ReactPracticePage()}
      {await ReactExercisePage(params())}
    </>,
  );
  expect(protect).toHaveBeenCalledTimes(2);
  expect(
    screen.getByRole("link", { name: "Explore React JS" }),
  ).toHaveAttribute("href", "/react/practice");
  expect(screen.getByRole("link", { name: "Open exercise" })).toHaveAttribute(
    "href",
    "/react/practice/stale-closure-counter",
  );
  expect(screen.getByText("Protected React workspace")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /flag|solved|save/i }),
  ).toBeNull();
});
it("keeps setup usable without auth credentials", async () => {
  state.configured = false;
  render(await ReactPracticePage());
  expect(screen.getByText("Authentication setup")).toBeVisible();
  expect(protect).not.toHaveBeenCalled();
});
