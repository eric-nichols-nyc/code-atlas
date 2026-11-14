import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { twoPointersWalkthrough } from "@/content/algorithms/learn/two-pointers/walkthrough";
import { CodeWalkthroughClient } from "./code-walkthrough-client";

const state = vi.hoisted(() => ({ configured: true }));
const protect = vi.hoisted(() => vi.fn());
const loadOverview = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({ requirePageLearner: protect }));
vi.mock("@/content/algorithms/learn/overviews", () => ({
  moduleOverviews: { "two-pointers": loadOverview },
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not-found");
  },
}));

import ModuleNotFound from "@/app/algorithms/learn/[moduleSlug]/not-found";
import LearningModulePage from "@/app/algorithms/learn/[moduleSlug]/page";
import LearningError from "@/app/algorithms/learn/error";
import Loading from "@/app/algorithms/learn/loading";

const page = (moduleSlug = "two-pointers") =>
  LearningModulePage({ params: Promise.resolve({ moduleSlug }) });

beforeEach(() => {
  state.configured = true;
  protect.mockReset().mockResolvedValue("learner");
  loadOverview.mockReset().mockResolvedValue({
    default: () => (
      <>
        <p>Original read-only example</p>
        <CodeWalkthroughClient
          walkthrough={{
            ...twoPointersWalkthrough,
            codeLines: twoPointersWalkthrough.source
              .split("\n")
              .map((text, index) => ({
                number: index + 1,
                tokens: [{ text, offset: 0 }],
              })),
          }}
        />
      </>
    ),
  });
});

describe("Algorithms learning module access", () => {
  it("shows setup and never loads protected content without configuration", async () => {
    state.configured = false;
    render(await page());
    expect(screen.getByText("Authentication setup")).toBeVisible();
    expect(protect).not.toHaveBeenCalled();
    expect(loadOverview).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Two Pointers" })).toBeNull();
  });
  it("verifies identity before importing preview content", async () => {
    protect.mockRejectedValueOnce(new Error("sign-in"));
    await expect(page()).rejects.toThrow("sign-in");
    expect(loadOverview).not.toHaveBeenCalled();
  });
  it("opens a direct module URL with only preview content and a real back link", async () => {
    render(await page());
    expect(protect).toHaveBeenCalledOnce();
    expect(loadOverview).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "Two Pointers" })).toBeVisible();
    expect(screen.getByText("Module preview")).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "Lesson outlines" }),
    ).toBeNull();
    expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute(
      "href",
      "/algorithms/learn",
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(screen.getByText("Step 1 of 6")).toBeVisible();
    expect(screen.queryByRole("button", { name: /^(Run|Submit)$/ })).toBeNull();
  });
  it("rejects unknown slugs without importing authored content", async () => {
    await expect(page("unknown")).rejects.toThrow("not-found");
    expect(loadOverview).not.toHaveBeenCalled();
    render(<ModuleNotFound />);
    expect(
      screen.getByRole("heading", { name: "Module unavailable" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute(
      "href",
      "/algorithms/learn",
    );
  });
  it("propagates content failure to an error surface with retry and back navigation", async () => {
    loadOverview.mockRejectedValueOnce(new Error("load failed"));
    await expect(page()).rejects.toThrow("load failed");
    const reset = vi.fn();
    render(<LearningError reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute(
      "href",
      "/algorithms/learn",
    );
    expect(screen.queryByRole("heading", { name: "Two Pointers" })).toBeNull();
  });
  it("announces loading without a module success state", () => {
    render(<Loading />);
    expect(
      screen.getByRole("main", { name: "Loading Algorithms learning" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("heading", { name: "Two Pointers" })).toBeNull();
  });
});
