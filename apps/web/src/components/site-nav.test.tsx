import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ path: "/algorithms/learn/two-pointers" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path }));
vi.mock("next/link", () => ({
  default: (props: React.ComponentProps<"a">) => <a {...props} />,
  useLinkStatus: () => ({ pending: false }),
}));
vi.mock("./nav-auth", () => ({ NavAuth: () => null }));
vi.mock("@workspace/ui/components/theme-switcher", () => ({
  ThemeSwitcher: () => null,
}));

import { SiteNav } from "./site-nav";

afterEach(() => vi.unstubAllEnvs());

it.each([
  ["javascript", "JavaScript"],
  ["react", "React"],
  ["algorithms", "Algorithms"],
])("identifies %s and provides one direct Dashboard link", (subject, label) => {
  vi.stubEnv("NODE_ENV", "development");
  state.path = `/${subject}/learn`;
  const view = render(<SiteNav authConfigured={false} />);
  expect(screen.getByText(label, { exact: true })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: "Dashboard" })).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
    "href",
    "/dashboard",
  );
  expect(screen.queryByRole("link", { name: "Code Atlas" })).toBeNull();
  state.path = `/${subject}/practice`;
  view.rerender(<SiteNav authConfigured={false} />);
  expect(screen.getByText(label, { exact: true })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Practice" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
  state.path = "/dashboard";
  view.rerender(<SiteNav authConfigured={false} />);
  expect(screen.getByRole("link", { name: "Code Atlas" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(
    screen.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
});

it.each(["javascript", "algorithms"])(
  "keeps section links in %s and hides them on focused problems",
  (subject) => {
    state.path = `/${subject}/learn/two-pointers`;
    const view = render(<SiteNav authConfigured={false} />);
    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute(
      "href",
      `/${subject}/learn`,
    );
    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Practice" })).toHaveAttribute(
      "href",
      `/${subject}/practice`,
    );
    fireEvent.click(screen.getByRole("button", { name: /navigation/i }));
    fireEvent.keyDown(screen.getByRole("navigation"), { key: "Escape" });
    expect(screen.getByRole("button", { name: /navigation/i })).toHaveFocus();
    state.path = `/${subject}/practice/valid-anagram`;
    view.rerender(<SiteNav authConfigured={false} />);
    expect(screen.queryByRole("navigation")).toBeNull();
  },
);

it("offers React Learn and development Practice and hides navigation in its workspace", () => {
  vi.stubEnv("NODE_ENV", "development");
  state.path = "/react/practice";
  const view = render(<SiteNav authConfigured={false} />);
  expect(screen.getByRole("link", { name: "Practice" })).toHaveAttribute(
    "href",
    "/react/practice",
  );
  expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute(
    "href",
    "/react/learn",
  );
  state.path = "/react/practice/stale-closure-counter";
  view.rerender(<SiteNav authConfigured={false} />);
  expect(screen.queryByRole("navigation")).toBeNull();
});

it("offers Playground only in JavaScript and marks its route current", () => {
  state.path = "/javascript/practice";
  const view = render(<SiteNav authConfigured={false} />);
  const link = () => screen.getByRole("link", { name: "Playground" });
  expect(link()).toHaveAttribute("href", "/javascript/playground");
  expect(link()).not.toHaveAttribute("aria-current");
  state.path = "/javascript/playground";
  view.rerender(<SiteNav authConfigured={false} />);
  expect(link()).toHaveAttribute("aria-current", "page");
  state.path = "/algorithms/practice";
  view.rerender(<SiteNav authConfigured={false} />);
  expect(screen.queryByRole("link", { name: "Playground" })).toBeNull();
});

it("keeps React Learn active and omits Practice in production, including mobile navigation", () => {
  vi.stubEnv("NODE_ENV", "production");
  state.path = "/react/learn/use-effect-lifecycle";
  render(<SiteNav authConfigured={false} />);
  expect(screen.queryByRole("link", { name: "Practice" })).toBeNull();
  expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute(
    "href",
    "/react/learn",
  );
  expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  for (const link of screen.getAllByRole("link", { name: "Dashboard" }))
    expect(link).toHaveAttribute("href", "/dashboard");
  fireEvent.click(screen.getByRole("button", { name: /navigation/i }));
  fireEvent.keyDown(screen.getByRole("navigation"), { key: "Escape" });
  expect(screen.getByRole("button", { name: /navigation/i })).toHaveFocus();
});
