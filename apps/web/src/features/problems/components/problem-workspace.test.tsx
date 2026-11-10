import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ExecutionResult, sleepProblem } from "@workspace/problems";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useProblemSession } from "../state/problem-session";
import { ProblemExperience } from "./problem-experience";

function TestEditor() {
  const s = useProblemSession();
  return (
    <textarea
      aria-label="JavaScript solution"
      value={s.source}
      onChange={(e) => s.setSource(e.target.value)}
    />
  );
}
vi.mock("next/dynamic", () => ({ default: () => TestEditor }));
const accepted: ExecutionResult = {
  attemptId: "attempt-one",
  action: "run",
  verdict: "accepted",
  passed: 2,
  total: 2,
  cases: [
    {
      id: "case-1",
      passed: true,
      verdict: "accepted",
      input: 100,
      elapsedMs: 101,
      message: "Waited correctly.",
      logs: [],
      hidden: false,
    },
  ],
};
function Workspace() {
  return (
    <ProblemExperience problem={sleepProblem}>
      <p>Write an asynchronous sleep function.</p>
    </ProblemExperience>
  );
}
afterEach(() => vi.unstubAllGlobals());
describe("real coding workspace", () => {
  it("shows an editable problem and results without visualization or checkpoint", () => {
    render(<Workspace />);
    expect(
      screen.getByRole("heading", { name: "Sleep", level: 1 }),
    ).toBeVisible();
    expect(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
    ).toHaveValue(sleepProblem.starterCode);
    expect(screen.getByRole("button", { name: "Run" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Submit" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/javascript/practice",
    );
    expect(screen.queryByRole("button", { name: "Next step" })).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("tab", { name: "Submissions" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Description" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reset layout" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Problems" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Share code (coming soon)" }),
    ).toBeDisabled();
  });
  it("runs the edited source and input, then marks a result stale after editing", async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
      Response.json(accepted),
    );
    vi.stubGlobal("fetch", fetch);
    render(<Workspace />);
    fireEvent.change(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
      { target: { value: sleepProblem.solution } },
    );
    fireEvent.change(screen.getByLabelText("millis ="), {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await screen.findByText("Accepted", { selector: "h2" });
    const sent = JSON.parse(fetch.mock.calls[0]?.[1]?.body as string);
    expect(sent.code).toBe(sleepProblem.solution);
    expect(sent.inputs).toEqual([150, 200]);
    fireEvent.change(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
      { target: { value: "async function sleep(){}" } },
    );
    expect(screen.getByText(/Code or inputs changed/)).toBeVisible();
    expect(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
    ).toHaveValue("async function sleep(){}");
  });
  it("shows actual submission results and keeps source on failure", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ ...accepted, action: "submit" }))
      .mockRejectedValueOnce(new Error("Runner unavailable"));
    vi.stubGlobal("fetch", fetch);
    render(<Workspace />);
    fireEvent.change(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
      { target: { value: sleepProblem.solution } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByTestId("execution-verdict");
    expect(screen.getByTestId("execution-verdict")).toHaveTextContent(
      "Accepted",
    );
    expect(screen.getByText("2/2 tests passed · Submit")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Runner unavailable"),
    );
    expect(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
    ).toHaveValue(sleepProblem.solution);
  });
  it("opens hints and solution independently without changing the editor", () => {
    render(<Workspace />);
    const editor = screen.getByRole("textbox", { name: "JavaScript solution" });
    const hint = screen.getByRole("button", { name: "Hint 1" });
    const solution = screen.getByRole("button", { name: "Solution" });
    expect(hint).toHaveAttribute("aria-expanded", "false");
    expect(solution).toHaveAttribute("aria-expanded", "false");
    fireEvent.change(editor, { target: { value: "// My work" } });
    fireEvent.click(hint);
    expect(screen.getByText(/A Promise can stay pending/)).toBeVisible();
    fireEvent.click(solution);
    expect(hint).toHaveAttribute("aria-expanded", "true");
    expect(solution).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/function sleep/, { selector: "code" }),
    ).toBeVisible();
    expect(editor).toHaveValue("// My work");
    fireEvent.click(hint);
    expect(hint).toHaveAttribute("aria-expanded", "false");
    expect(solution).toHaveAttribute("aria-expanded", "true");
  });
  it("resets edited code from the header icon", () => {
    render(<Workspace />);
    const reset = screen.getByRole("button", { name: "Reset code" });
    expect(reset).toBeDisabled();
    fireEvent.change(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
      { target: { value: "// My work" } },
    );
    expect(reset).toBeEnabled();
    fireEvent.click(reset);
    expect(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
    ).toHaveValue(sleepProblem.starterCode);
  });
  it("opens the matching tool tab and restores drawer focus", async () => {
    render(<Workspace />);
    const editor = screen.getByRole("textbox", { name: "JavaScript solution" });
    fireEvent.change(editor, { target: { value: "// My work" } });
    const notes = screen.getByRole("button", { name: "Show notes" });
    fireEvent.click(notes);
    expect(screen.getByRole("tab", { name: "Notes" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(notes).toHaveFocus());
    const ai = screen.getByRole("button", { name: "Show AI tutor" });
    fireEvent.click(ai);
    expect(screen.getByRole("tab", { name: "AI tutor" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(ai).toHaveFocus());
    expect(editor).toHaveValue("// My work");
  });
});
