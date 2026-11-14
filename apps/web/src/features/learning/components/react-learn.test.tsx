import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useEffectLifecycleWalkthrough } from "@/content/react/learn/use-effect-lifecycle/walkthrough";
import { CodeWalkthroughClient } from "./code-walkthrough-client";

const state = vi.hoisted(() => ({ configured: true, published: true }));
const protect = vi.hoisted(() => vi.fn());
const loadOverview = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({ requirePageLearner: protect }));
vi.mock("@/content/react/learn/catalog", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/content/react/learn/catalog")>();
  return {
    ...actual,
    get reactLearningCatalog() {
      return state.published
        ? actual.reactLearningCatalog
        : actual.reactLearningCatalog.map((entry) => ({
            ...entry,
            status: "planned",
          }));
    },
  };
});
vi.mock("@/content/react/learn/overviews", () => ({
  moduleOverviews: { "use-effect-lifecycle": loadOverview },
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not-found");
  },
}));

import ModuleNotFound from "@/app/react/learn/[moduleSlug]/not-found";
import LearningModulePage from "@/app/react/learn/[moduleSlug]/page";
import LearningError from "@/app/react/learn/error";
import Loading from "@/app/react/learn/loading";
import ReactLearnPage from "@/app/react/learn/page";

const lesson = (moduleSlug = "use-effect-lifecycle") =>
  LearningModulePage({ params: Promise.resolve({ moduleSlug }) });

beforeEach(() => {
  state.configured = true;
  state.published = true;
  protect.mockReset().mockResolvedValue("learner");
  loadOverview.mockReset().mockResolvedValue({
    default: () => (
      <CodeWalkthroughClient
        walkthrough={{
          ...useEffectLifecycleWalkthrough,
          codeLines: useEffectLifecycleWalkthrough.source
            .split("\n")
            .map((text, index) => ({
              number: index + 1,
              tokens: [{ text, offset: 0 }],
            })),
        }}
      />
    ),
  });
});

it.each([ReactLearnPage, lesson])(
  "withholds catalog and lesson without configuration",
  async (page) => {
    state.configured = false;
    render(await page());
    expect(screen.getByText("Authentication setup")).toBeVisible();
    expect(protect).not.toHaveBeenCalled();
    expect(loadOverview).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", {
        name: /useEffect lifecycle|React Learn/,
      }),
    ).toBeNull();
  },
);

it.each([ReactLearnPage, lesson])(
  "rejects a session before showing content",
  async (page) => {
    protect.mockRejectedValueOnce(new Error("Sign-in required"));
    await expect(page()).rejects.toThrow("Sign-in required");
    expect(loadOverview).not.toHaveBeenCalled();
  },
);

it("filters Hooks and clears intersecting search/difficulty without changing category", async () => {
  render(await ReactLearnPage());
  expect(protect).toHaveBeenCalledOnce();
  expect(screen.getByRole("heading", { name: "React Learn" })).toBeVisible();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Hooks" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByRole("searchbox", { name: "Search modules" }), {
    target: { value: "  USEEFFECT  " },
  });
  expect(
    screen.getByRole("link", { name: "useEffect lifecycle" }),
  ).toHaveAttribute("href", "/react/learn/use-effect-lifecycle");
  expect(screen.getByRole("cell", { name: "1" })).toBeVisible();
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Difficulty" }), {
    key: "Enter",
  });
  fireEvent.click(await screen.findByRole("option", { name: "Hard" }));
  expect(screen.getByRole("status")).toHaveTextContent("0 modules");
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByRole("searchbox", { name: "Search modules" })).toHaveValue(
    "",
  );
  expect(screen.getByRole("tab", { name: "Hooks" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("status")).toHaveTextContent("1 module");
  expect(
    screen.queryByRole("button", { name: /flag|run|submit|complete/i }),
  ).toBeNull();
});

it("opens the direct lesson with six manual steps and no execution or persistence", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  const storageSpy = vi.spyOn(Storage.prototype, "setItem");
  const { container } = render(await lesson());
  expect(protect).toHaveBeenCalledOnce();
  expect(loadOverview).toHaveBeenCalledOnce();
  expect(
    screen.getByRole("heading", { name: "useEffect lifecycle" }),
  ).toBeVisible();
  expect(screen.getByText("Module preview")).toBeVisible();
  expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute(
    "href",
    "/react/learn",
  );
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Restart" })).toBeDisabled();
  for (const [index, step] of useEffectLifecycleWalkthrough.steps.entries()) {
    expect(screen.getByText(`Step ${index + 1} of 6`)).toBeVisible();
    expect(screen.getByText(step.explanation)).toBeVisible();
    expect(
      Array.from(
        container.querySelectorAll('[data-active="true"][data-line]'),
      ).map((line) => Number(line.getAttribute("data-line"))),
    ).toEqual(step.lines);
    if (index < 5)
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
  }
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  expect(container.querySelector('[aria-live="polite"]')).toHaveAttribute(
    "aria-atomic",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Restart" }));
  expect(screen.getByText("Step 1 of 6")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /^(Run|Submit|Done)$/ }),
  ).toBeNull();
  expect(fetchSpy).not.toHaveBeenCalled();
  expect(storageSpy).not.toHaveBeenCalled();
  fetchSpy.mockRestore();
  storageSpy.mockRestore();
});

it.each(["unknown", "two-pointers"])(
  "rejects unknown or foreign module %s",
  async (slug) => {
    await expect(lesson(slug)).rejects.toThrow("not-found");
    expect(loadOverview).not.toHaveBeenCalled();
  },
);

it("withholds an unpublished lesson", async () => {
  state.published = false;
  await expect(lesson()).rejects.toThrow("not-found");
  expect(loadOverview).not.toHaveBeenCalled();
});

it("provides loading, retry and unavailable feedback with a React return", async () => {
  const view = render(<Loading />);
  expect(
    screen.getByRole("main", { name: "Loading React learning" }),
  ).toHaveAttribute("aria-busy", "true");
  const reset = vi.fn();
  loadOverview.mockRejectedValueOnce(new Error("load failed"));
  await expect(lesson()).rejects.toThrow("load failed");
  view.rerender(<LearningError reset={reset} />);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(reset).toHaveBeenCalledOnce();
  expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute(
    "href",
    "/react/learn",
  );
  view.rerender(<ModuleNotFound />);
  expect(
    screen.getByRole("heading", { name: "Module unavailable" }),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "Back to Learn" })).toHaveAttribute(
    "href",
    "/react/learn",
  );
});
