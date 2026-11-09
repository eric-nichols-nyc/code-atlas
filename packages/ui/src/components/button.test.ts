import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("shared Button", () => {
  it("keeps native disabled behavior", () => {
    render(createElement(Button, { disabled: true }, "Save"));
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
  it("can compose a semantic link without nesting a button", () => {
    render(
      createElement(
        Button,
        { asChild: true },
        createElement("a", { href: "/dashboard" }, "Dashboard"),
      ),
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});
