import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { twoPointersVisualization as example } from "@/content/javascript/learn/two-pointers/visualization";
import { TwoPointerVisualization } from "./two-pointer-visualization";
import { TwoPointerVisualizationClient } from "./two-pointer-visualization-client";

describe("Two Pointers array visualization", () => {
  it("moves the right pointer then the left, compares sums, and finds the pair", () => {
    const { container } = render(
      <TwoPointerVisualizationClient definition={example} />,
    );
    const next = screen.getByRole("button", { name: "Next" });
    const previous = screen.getByRole("button", { name: "Previous" });
    expect(previous).toBeDisabled();
    for (const [index, frame] of example.frames.entries()) {
      expect(screen.getByText(`Step ${index + 1} of 7`)).toBeVisible();
      expect(screen.getByText(frame.explanation)).toBeVisible();
      expect(container.querySelector('[data-left="true"]')).toHaveAttribute(
        "data-array-index",
        String(frame.left),
      );
      expect(container.querySelector('[data-right="true"]')).toHaveAttribute(
        "data-array-index",
        String(frame.right),
      );
      expect(
        screen.getByRole("slider", { name: "Example step" }),
      ).toHaveAttribute("aria-valuenow", String(index + 1));
      if (index === 1)
        expect(screen.getByText("12 > 9 · sum too large")).toBeVisible();
      if (index === 3)
        expect(screen.getByText("8 < 9 · sum too small")).toBeVisible();
      if (index === 5)
        expect(screen.getByText("9 = 9 · target matched")).toBeVisible();
      if (index < 6) fireEvent.click(next);
    }
    expect(next).toBeDisabled();
    expect(container.querySelectorAll('[data-match="true"]')).toHaveLength(2);
    expect(screen.getByText("Return [1, 3] · values 2 and 7")).toBeVisible();
    fireEvent.click(previous);
    expect(screen.queryByText(/^Return \[1, 3\]/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(container.querySelectorAll('[data-discarded="true"]')).toHaveLength(
      0,
    );
    expect(screen.getByText("Step 1 of 7")).toBeVisible();
  });

  it("scrubs with the keyboard and restores the exact earlier snapshot", () => {
    const { container } = render(
      <TwoPointerVisualizationClient definition={example} />,
    );
    const slider = screen.getByRole("slider", { name: "Example step" });
    fireEvent.keyDown(slider, { key: "End" });
    expect(screen.getByText("Step 7 of 7")).toBeVisible();
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(screen.getByText("Step 6 of 7")).toBeVisible();
    fireEvent.keyDown(slider, { key: "Home" });
    expect(screen.getByText("Step 1 of 7")).toBeVisible();
    expect(container.querySelector('[data-right="true"]')).toHaveAttribute(
      "data-array-index",
      "4",
    );
    expect(
      screen.getByRole("listitem", { name: "Index 0, value 1, left pointer" }),
    ).toBeVisible();
    expect(container.querySelector('[aria-live="polite"]')).toHaveAttribute(
      "aria-atomic",
      "true",
    );
  });

  it("keeps instances independent, preserves a rerender, and resets a remount", () => {
    const second = { ...example, id: "second", title: "Second example" };
    const { rerender, unmount } = render(
      <>
        <TwoPointerVisualizationClient definition={example} />
        <TwoPointerVisualizationClient definition={second} />
      </>,
    );
    const first = screen.getByRole("region", { name: example.title });
    fireEvent.click(within(first).getByRole("button", { name: "Next" }));
    expect(
      within(screen.getByRole("region", { name: second.title })).getByText(
        "Step 1 of 7",
      ),
    ).toBeVisible();
    rerender(
      <>
        <TwoPointerVisualizationClient definition={example} />
        <TwoPointerVisualizationClient definition={second} />
      </>,
    );
    expect(within(first).getByText("Step 2 of 7")).toBeVisible();
    unmount();
    render(<TwoPointerVisualizationClient definition={example} />);
    expect(screen.getByText("Step 1 of 7")).toBeVisible();
  });

  it("retains lesson prose if optional snapshot data is invalid", () => {
    render(
      <article>
        Surrounding lesson prose
        <TwoPointerVisualization definition={{ ...example, numbers: [] }} />
      </article>,
    );
    expect(screen.getByText(/Surrounding lesson prose/)).toBeVisible();
    expect(screen.getByText("Array visualization unavailable.")).toBeVisible();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});
