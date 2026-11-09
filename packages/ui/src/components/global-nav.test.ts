import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import {
  GlobalNav,
  type GlobalNavItem,
  type GlobalNavLinkProps,
} from "./global-nav";

const items: readonly GlobalNavItem[] = [
  { id: "home", label: "Home", href: "#home" },
  { id: "library", label: "Library", href: "#library" },
];

function RouterLink(props: GlobalNavLinkProps) {
  return createElement("a", { ...props, "data-router": "example" });
}

describe("GlobalNav", () => {
  it("accepts consumer branding, actions, active state, and a router adapter", () => {
    render(
      createElement(GlobalNav, {
        brand: "Example brand",
        items,
        activeItemId: "library",
        navigationLabel: "Example navigation",
        linkComponent: RouterLink,
        actions: createElement("button", { type: "button" }, "Account"),
      }),
    );

    const navigation = screen.getByRole("navigation", {
      name: "Example navigation",
    });
    const library = within(navigation).getByRole("link", { name: "Library" });
    expect(library).toHaveAttribute("href", "#library");
    expect(library).toHaveAttribute("aria-current", "page");
    expect(library).toHaveAttribute("data-router", "example");
    expect(
      within(navigation).getByRole("link", { name: "Home" }),
    ).not.toHaveAttribute("aria-current");
    expect(within(navigation).getByText("Example brand")).toBeInTheDocument();
    expect(
      within(navigation).getByRole("button", { name: "Account" }),
    ).toBeInTheDocument();
  });

  it("closes on Escape and restores focus to its disclosure button", () => {
    render(createElement(GlobalNav, { brand: "Example", items }));
    const toggle = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const link = screen.getByRole("link", { name: "Home" });
    link.focus();
    fireEvent.keyDown(link, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("closes after a navigation link is selected", () => {
    render(createElement(GlobalNav, { brand: "Example", items }));
    const toggle = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("link", { name: "Library" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("supports a brand-only header without an empty disclosure control", () => {
    render(createElement(GlobalNav, { brand: "Example" }));
    expect(screen.getByRole("navigation")).toHaveTextContent("Example");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
