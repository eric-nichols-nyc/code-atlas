import { act, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useWorkspaceLayout } from "../hooks/use-workspace-layout";

function MeasurementHarness() {
  const layout = useWorkspaceLayout();
  return (
    <div ref={layout.host}>
      <output aria-label="Workspace measurement">
        {layout.mode}:{layout.capacity.height}
      </output>
    </div>
  );
}
it("measures document position and reveals desktop after a scrolled mobile flow", async () => {
  let width = 390;
  const oldHeight = window.innerHeight;
  const oldScroll = window.scrollY;
  Object.defineProperty(window, "innerHeight", {
    value: 900,
    configurable: true,
  });
  const geometry = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(() => new DOMRect(0, 110 - window.scrollY, width, 100));
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() =>
    Object.defineProperty(window, "scrollY", {
      value: 0,
      configurable: true,
    }),
  );
  try {
    const view = render(<MeasurementHarness />);
    await waitFor(() =>
      expect(screen.getByLabelText("Workspace measurement")).toHaveTextContent(
        "flow:766",
      ),
    );
    width = 1440;
    Object.defineProperty(window, "scrollY", {
      value: 1200,
      configurable: true,
    });
    act(() => window.dispatchEvent(new Event("resize")));
    await waitFor(() =>
      expect(screen.getByLabelText("Workspace measurement")).toHaveTextContent(
        "wide:766",
      ),
    );
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
    expect(document.documentElement.dataset.learningWorkspace).toBe("wide");
    view.unmount();
    expect(document.documentElement.dataset.learningWorkspace).toBeUndefined();
  } finally {
    geometry.mockRestore();
    scroll.mockRestore();
    Object.defineProperty(window, "innerHeight", {
      value: oldHeight,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", {
      value: oldScroll,
      configurable: true,
    });
  }
});
