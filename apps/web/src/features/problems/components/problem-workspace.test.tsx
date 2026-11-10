import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  counterProblem,
  type ExecutionResult,
  type ProblemDefinition,
  sleepProblem,
} from "@workspace/problems";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readPracticeRecord } from "../../catalog/state/practice-records";
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
function Workspace({
  problem = sleepProblem,
  learnerId,
}: {
  problem?: ProblemDefinition;
  learnerId?: string;
}) {
  return (
    <ProblemExperience problem={problem} learnerId={learnerId}>
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

it("runs Counter with editable start and call count and marks changed inputs stale", async () => {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
    Response.json({
      ...accepted,
      cases: [
        {
          id: "case-1",
          input: { n: -3, calls: 4 },
          expected: [-3, -2, -1, 0],
          actual: [-3, -2, -1, 0],
          hidden: false,
          passed: true,
          verdict: "accepted",
          message: "Sequence matched.",
          logs: [],
        },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetch);
  render(<Workspace problem={counterProblem} />);
  fireEvent.change(
    screen.getByRole("textbox", { name: "JavaScript solution" }),
    { target: { value: counterProblem.solution } },
  );
  fireEvent.change(screen.getByLabelText("n ="), { target: { value: "-3" } });
  fireEvent.change(screen.getByLabelText("calls ="), {
    target: { value: "4" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByTestId("execution-verdict");
  expect(fetch.mock.calls[0]?.[0]).toBe("/api/problems/javascript.counter/run");
  expect(JSON.parse(fetch.mock.calls[0]?.[1]?.body as string).inputs).toEqual([
    { n: -3, calls: 4 },
    { n: -2, calls: 5 },
  ]);
  expect(screen.getByText("Output")).toBeVisible();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Testcase" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByLabelText("calls ="), {
    target: { value: "0" },
  });
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Test Result" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.getByText(/Code or inputs changed/)).toBeVisible();
});

it("records solved only after an accepted Submit, separately from Run and failures", async () => {
  const learnerId = "solved-workspace-test";
  const execution = vi
    .fn()
    .mockResolvedValueOnce(Response.json(accepted))
    .mockResolvedValueOnce(
      Response.json({
        ...accepted,
        action: "submit",
        verdict: "wrong-answer",
        passed: 0,
      }),
    )
    .mockResolvedValueOnce(
      Response.json({ ...accepted, action: "submit", persistence: "saved" }),
    );
  const fetch = vi.fn((url: string) =>
    url.startsWith("/api/practice-progress")
      ? Promise.resolve(Response.json({ record: null }))
      : execution(),
  );
  vi.stubGlobal("fetch", fetch);
  render(<Workspace learnerId={learnerId} />);
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByTestId("execution-verdict");
  expect(readPracticeRecord(learnerId).solved).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await screen.findByText("Wrong Answer", { selector: "h2" });
  expect(readPracticeRecord(learnerId).solved).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await waitFor(() =>
    expect(readPracticeRecord(learnerId).solved).toEqual([sleepProblem.id]),
  );
});

it("discards an old learner's editor session when the account changes", () => {
  const view = render(<Workspace learnerId="first-learner" />);
  fireEvent.change(
    screen.getByRole("textbox", { name: "JavaScript solution" }),
    { target: { value: "// First learner's draft" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Hint 1" }));
  view.rerender(<Workspace learnerId="second-learner" />);
  expect(
    screen.getByRole("textbox", { name: "JavaScript solution" }),
  ).toHaveValue(sleepProblem.starterCode);
  expect(screen.getByRole("button", { name: "Hint 1" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
