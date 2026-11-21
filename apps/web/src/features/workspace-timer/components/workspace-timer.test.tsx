import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it } from "vitest";
import { WorkspaceTimer } from "./workspace-timer";

it("keeps a stopwatch controllable after collapsing and restores focus", async () => {
  render(<WorkspaceTimer />);
  const trigger = screen.getByRole("button", { name: "Timer" });
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Start Stopwatch" }));
  expect(
    screen.getByRole("timer", { name: "Stopwatch time" }),
  ).toHaveTextContent("00:00:00");
  fireEvent.click(screen.getByRole("button", { name: "Pause stopwatch" }));
  fireEvent.click(screen.getByRole("button", { name: "Collapse timer" }));
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Resume stopwatch" }));
  fireEvent.click(screen.getByRole("button", { name: "Show in toolbar" }));
  expect(screen.getByRole("button", { name: "Pause stopwatch" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Reset stopwatch" }));
  expect(screen.getByRole("timer")).toHaveTextContent("00:00:00");
  fireEvent.click(trigger);
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(trigger).toHaveFocus();
});

it("rejects invalid countdown values and starts and resets the configured duration", async () => {
  render(<WorkspaceTimer />);
  fireEvent.click(screen.getByRole("button", { name: "Timer" }));
  fireEvent.click(screen.getByRole("radio", { name: "Countdown timer" }));
  const hours = screen.getByRole("textbox", { name: "Hours" });
  const minutes = screen.getByRole("textbox", { name: "Minutes" });
  const start = screen.getByRole("button", { name: "Start Timer" });
  for (const value of ["", "-1", "1.5", "NaN", "100"]) {
    fireEvent.change(hours, { target: { value } });
    expect(start).toBeDisabled();
    expect(hours).toHaveAttribute("aria-invalid", "true");
  }
  fireEvent.change(hours, { target: { value: "0" } });
  for (const value of ["", "60", "-1", "2.5", "0"]) {
    fireEvent.change(minutes, { target: { value } });
    expect(start).toBeDisabled();
  }
  fireEvent.change(minutes, { target: { value: "5" } });
  expect(start).toBeEnabled();
  fireEvent.click(start);
  expect(screen.getByRole("timer", { name: "Timer time" })).toHaveTextContent(
    "00:05:00",
  );
  fireEvent.click(screen.getByRole("button", { name: "Reset timer" }));
  expect(screen.getByRole("timer")).toHaveTextContent("00:05:00");
  expect(screen.getByRole("button", { name: "Resume timer" })).toBeVisible();
  // Flush Popover's focus restoration before cleanup.
  await act(async () => {});
});
