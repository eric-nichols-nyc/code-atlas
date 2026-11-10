import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { CounterPreview } from "./counter-preview";

it("keeps the closure alive across calls while showing only the three recent returns", () => {
  render(<CounterPreview />);
  const result = screen.getByRole("status", { name: "Latest counter return" });
  expect(result).toHaveTextContent("—");
  const call = screen.getByRole("button", { name: "Call counter()" });
  for (const expected of [10, 11, 12, 13, 14]) {
    fireEvent.click(call);
    expect(result).toHaveTextContent(String(expected));
  }
  const calls = within(
    screen.getByRole("list", { name: "Recent counter calls" }),
  );
  expect(
    calls.getAllByRole("listitem").map((entry) => entry.textContent),
  ).toEqual(["counter() #312", "counter() #413", "counter() #514"]);
  expect(screen.getByText("5 calls")).toBeVisible();
});

it("starts fresh for zero and negative examples and resets to the selected start", () => {
  render(<CounterPreview />);
  const call = () =>
    fireEvent.click(screen.getByRole("button", { name: "Call counter()" }));
  const result = () =>
    screen.getByRole("status", { name: "Latest counter return" });
  call();
  for (const start of [0, -2]) {
    fireEvent.mouseDown(
      screen.getByRole("tab", { name: `Start at ${start}` }),
      {
        button: 0,
        ctrlKey: false,
      },
    );
    expect(result()).toHaveTextContent("—");
    expect(
      screen.getByRole("figure", { name: "Counter example source" }),
    ).toHaveTextContent(`createCounter(${start})`);
    call();
    expect(result()).toHaveTextContent(String(start));
    call();
    expect(result()).toHaveTextContent(String(start + 1));
    fireEvent.click(screen.getByRole("button", { name: "Reset counter" }));
    expect(result()).toHaveTextContent("—");
    expect(
      screen.queryByRole("list", { name: "Recent counter calls" }),
    ).toBeNull();
    call();
    expect(result()).toHaveTextContent(String(start));
  }
});
