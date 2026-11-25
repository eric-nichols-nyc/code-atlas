import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { twoPointersVisualization as example } from "@/content/shared/learn/two-pointers/visualization";
import { TwoPointerVisualization } from "./two-pointer-visualization";
import { TwoPointerVisualizationClient } from "./two-pointer-visualization-client";

describe("Two Pointers palindrome visualization", () => {
  it("compares mirrored letters and brings both pointers to the center", () => {
    const { container } = render(
      <TwoPointerVisualizationClient definition={example} />,
    );
    const next = screen.getByRole("button", { name: "Next" });
    const previous = screen.getByRole("button", { name: "Previous" });
    expect(previous).toBeDisabled();
    for (const [index, frame] of example.frames.entries()) {
      expect(screen.getByText(`Step ${index + 1} of 5`)).toBeVisible();
      expect(screen.getByText(frame.explanation)).toBeVisible();
      expect(container.querySelector('[data-left="true"]')).toHaveAttribute(
        "data-character-index",
        String(frame.left),
      );
      expect(container.querySelector('[data-right="true"]')).toHaveAttribute(
        "data-character-index",
        String(frame.right),
      );
      expect(
        screen.getByRole("slider", { name: "Example step" }),
      ).toHaveAttribute("aria-valuenow", String(index + 1));
      const letter = example.word[frame.left];
      if (frame.phase === "compare")
        expect(screen.getByText(`“${letter}” = “${letter}”`)).toBeVisible();
      if (index < 4) fireEvent.click(next);
    }
    expect(next).toBeDisabled();
    expect(
      screen.getByRole("listitem", {
        name: "Index 3, letter e, left pointer, right pointer",
      }),
    ).toBeVisible();
    expect(screen.getByText("Return true")).toBeVisible();
    fireEvent.click(previous);
    expect(screen.queryByText("Return true")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(container.querySelectorAll('[data-checked="true"]')).toHaveLength(0);
    expect(screen.getByText("Step 1 of 5")).toBeVisible();
  });

  it("scrubs with the keyboard and restores the exact earlier snapshot", () => {
    const { container } = render(
      <TwoPointerVisualizationClient definition={example} />,
    );
    const slider = screen.getByRole("slider", { name: "Example step" });
    fireEvent.keyDown(slider, { key: "End" });
    expect(screen.getByText("Step 5 of 5")).toBeVisible();
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(screen.getByText("Step 4 of 5")).toBeVisible();
    fireEvent.keyDown(slider, { key: "Home" });
    expect(screen.getByText("Step 1 of 5")).toBeVisible();
    expect(container.querySelector('[data-right="true"]')).toHaveAttribute(
      "data-character-index",
      "6",
    );
    expect(
      screen.getByRole("listitem", { name: "Index 0, letter r, left pointer" }),
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
        "Step 1 of 5",
      ),
    ).toBeVisible();
    rerender(
      <>
        <TwoPointerVisualizationClient definition={example} />
        <TwoPointerVisualizationClient definition={second} />
      </>,
    );
    expect(within(first).getByText("Step 2 of 5")).toBeVisible();
    unmount();
    render(<TwoPointerVisualizationClient definition={example} />);
    expect(screen.getByText("Step 1 of 5")).toBeVisible();
  });

  it("retains lesson prose if optional snapshot data is invalid", () => {
    render(
      <article>
        Surrounding lesson prose
        <TwoPointerVisualization definition={{ ...example, word: "" }} />
      </article>,
    );
    expect(screen.getByText(/Surrounding lesson prose/)).toBeVisible();
    expect(
      screen.getByText("Palindrome visualization unavailable."),
    ).toBeVisible();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});
