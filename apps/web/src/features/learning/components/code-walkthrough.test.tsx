import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { twoPointersWalkthrough } from "@/content/shared/learn/two-pointers/walkthrough";
import type { PreparedWalkthrough } from "../lib/code-walkthrough";
import { CodeWalkthroughClient } from "./code-walkthrough-client";

const walkthrough: PreparedWalkthrough = {
  ...twoPointersWalkthrough,
  codeLines: twoPointersWalkthrough.source.split("\n").map((text, index) => ({
    number: index + 1,
    tokens: [{ text, offset: 0 }],
  })),
};

function selectedLines(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('[data-line][data-active="true"]'),
  ).map((line) => Number(line.getAttribute("data-line")));
}

describe("guided code walkthrough", () => {
  it("synchronizes all six steps, stops at boundaries, goes backward and restarts", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const storageSpy = vi.spyOn(Storage.prototype, "setItem");
    const { container } = render(
      <CodeWalkthroughClient walkthrough={walkthrough} />,
    );
    const previous = screen.getByRole("button", { name: "Previous" });
    const next = screen.getByRole("button", { name: "Next" });
    const restart = screen.getByRole("button", { name: "Restart" });
    const source = container.querySelector("code")?.textContent;
    expect(previous).toBeDisabled();
    expect(restart).toBeDisabled();
    for (const [index, step] of walkthrough.steps.entries()) {
      expect(screen.getByText(`Step ${index + 1} of 6`)).toBeVisible();
      expect(screen.getByText(step.explanation)).toBeVisible();
      expect(selectedLines(container)).toEqual(step.lines);
      expect(container.querySelector("code")?.textContent).toBe(source);
      if (index < 5) fireEvent.click(next);
    }
    expect(next).toBeDisabled();
    expect(previous).toBeEnabled();
    expect(restart).toBeEnabled();
    fireEvent.click(next);
    expect(screen.getByText("Step 6 of 6")).toBeVisible();
    fireEvent.click(previous);
    expect(
      screen.getByText(twoPointersWalkthrough.steps[4].explanation),
    ).toBeVisible();
    expect(selectedLines(container)).toEqual([9, 10]);
    fireEvent.click(restart);
    expect(screen.getByText("Step 1 of 6")).toBeVisible();
    expect(selectedLines(container)).toEqual([2, 3]);
    expect(previous).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /^(Run|Submit|Done)$/ }),
    ).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
    storageSpy.mockRestore();
  });

  it("keeps instance positions independent and resets only on remount", () => {
    const second = {
      ...walkthrough,
      id: "fixture-second",
      title: "Second fixture",
    };
    const { rerender, unmount } = render(
      <>
        <CodeWalkthroughClient walkthrough={walkthrough} />
        <CodeWalkthroughClient walkthrough={second} />
      </>,
    );
    const firstRegion = screen.getByRole("region", { name: walkthrough.title });
    const secondRegion = screen.getByRole("region", { name: second.title });
    expect(firstRegion.getAttribute("aria-labelledby")).not.toBe(
      secondRegion.getAttribute("aria-labelledby"),
    );
    fireEvent.click(within(firstRegion).getByRole("button", { name: "Next" }));
    expect(within(secondRegion).getByText("Step 1 of 6")).toBeVisible();
    rerender(
      <>
        <CodeWalkthroughClient walkthrough={walkthrough} />
        <CodeWalkthroughClient walkthrough={second} />
      </>,
    );
    expect(within(firstRegion).getByText("Step 2 of 6")).toBeVisible();
    unmount();
    render(<CodeWalkthroughClient walkthrough={walkthrough} />);
    expect(screen.getByText("Step 1 of 6")).toBeVisible();
  });

  it("exposes readable source and a polite explanation while hiding decoration", () => {
    const { container } = render(
      <CodeWalkthroughClient walkthrough={walkthrough} />,
    );
    const source = screen.getByLabelText(
      `${walkthrough.title} JavaScript source`,
    );
    expect(source).toHaveAttribute("tabindex", "0");
    expect(source).toHaveTextContent("function isPalindrome");
    const announcement = container.querySelector('[aria-live="polite"]');
    expect(announcement).toHaveAttribute("aria-atomic", "true");
    expect(announcement).toHaveTextContent("Step 1 of 6");
    expect(announcement).toHaveTextContent(walkthrough.steps[0].explanation);
    expect(announcement).not.toContainElement(source);
    expect(
      container.querySelectorAll('[data-line] > [aria-hidden="true"]'),
    ).toHaveLength(17);
    expect(
      container.querySelector('[data-current="true"]')?.parentElement,
    ).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Next" }).tagName).toBe("BUTTON");
  });
});
