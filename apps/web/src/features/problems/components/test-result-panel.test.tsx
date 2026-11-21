import { act, fireEvent, render, screen, within } from "@testing-library/react";
import {
  type CaseResult,
  type ExecutionResult,
  longestSubstringTwoDistinctProblem,
  mostFrequentCharacterProblem,
  type ProblemDefinition,
  sleepProblem,
  validAnagramProblem,
} from "@workspace/problems";
import { afterEach, expect, it, vi } from "vitest";
import {
  useProblemCases,
  useProblemControls,
  useProblemEditor,
  useProblemOutput,
} from "../state/problem-context";
import { ProblemSession } from "../state/problem-session";
import { ResultPanel } from "./result-panel";

let session: ReturnType<typeof useSession>;
function useSession() {
  return {
    ...useProblemControls(),
    ...useProblemCases(),
    ...useProblemEditor(),
    ...useProblemOutput(),
  };
}
function Capture() {
  session = useSession();
  return null;
}
function Workspace({
  problem = mostFrequentCharacterProblem,
  visible = true,
}: {
  problem?: ProblemDefinition;
  visible?: boolean;
}) {
  return (
    <ProblemSession problem={problem}>
      <Capture />
      {visible && <ResultPanel />}
    </ProblemSession>
  );
}
function caseResult(patch: Partial<CaseResult> = {}): CaseResult {
  return {
    id: "case-1",
    verdict: "accepted",
    passed: true,
    input: { str: "aaa" },
    actual: "a",
    expected: "a",
    message: "Matched.",
    logs: [],
    hidden: false,
    ...patch,
  };
}
function outcome(
  cases: CaseResult[],
  patch: Partial<ExecutionResult> = {},
): ExecutionResult {
  return {
    attemptId: "result-tabs",
    action: "run",
    verdict: "accepted",
    total: cases.length,
    passed: cases.filter((item) => item.passed).length,
    cases,
    ...patch,
  };
}
function stubResult(result: ExecutionResult) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(result)),
  );
}
function detail() {
  return screen.getByRole("tabpanel", { name: /Case \d+ ·/ });
}
afterEach(() => vi.unstubAllGlobals());

it("shows only the selected case's snapshot and stdout, independently of editable selection", async () => {
  stubResult(
    outcome(
      [
        caseResult({ logs: ["first log"] }),
        caseResult({
          id: "case-2",
          input: { str: "bb" },
          actual: "x",
          expected: "b",
          passed: false,
          verdict: "wrong-answer",
          logs: ["second log", "another line"],
        }),
      ],
      { verdict: "wrong-answer" },
    ),
  );
  const view = render(<Workspace />);
  act(() => session.setSelectedCase("1"));
  await act(() => session.execute("run"));
  expect(screen.getByTestId("execution-verdict")).toHaveTextContent(
    "Wrong Answer",
  );
  const first = screen.getByRole("tab", { name: "Case 1 · Passed" });
  const second = screen.getByRole("tab", { name: "Case 2 · Wrong Answer" });
  expect(first).toHaveAttribute("aria-selected", "true");
  expect(within(detail()).getByText('"aaa"')).toBeVisible();
  expect(screen.queryByText("second log")).toBeNull();
  fireEvent.mouseDown(second, { button: 0 });
  expect(second).toHaveAttribute("aria-selected", "true");
  expect(within(detail()).getByText('"bb"')).toBeVisible();
  expect(within(detail()).getByText("second log another line")).toBeVisible();
  expect(screen.queryByText("first log")).toBeNull();
  expect(
    within(detail())
      .getAllByRole("definition")
      .slice(-2)
      .map((item) => item.textContent),
  ).toEqual(['"x"', '"b"']);

  act(() => {
    session.setOutputTab("testcase");
    session.setSelectedCase("0");
    session.updateInput(0, { str: "new draft" });
  });
  act(() => session.setOutputTab("test-result"));
  expect(
    screen.getByRole("tab", { name: "Case 2 · Wrong Answer" }),
  ).toHaveAttribute("aria-selected", "true");
  expect(screen.getByText(/Code or inputs changed/)).toBeVisible();
  expect(within(detail()).getByText('"bb"')).toBeVisible();
  view.rerender(<Workspace visible={false} />);
  view.rerender(<Workspace />);
  expect(
    screen.getByRole("tab", { name: "Case 2 · Wrong Answer" }),
  ).toHaveAttribute("aria-selected", "true");
  await act(() => session.execute("run"));
  expect(screen.getByRole("tab", { name: "Case 1 · Passed" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

it.each([
  { problem: longestSubstringTwoDistinctProblem, input: { s: "a" }, value: 0 },
  { problem: validAnagramProblem, input: { s: "a", t: "b" }, value: false },
  { problem: mostFrequentCharacterProblem, input: { str: "" }, value: "" },
])(
  "preserves $value output and expected values and makes empty stdout explicit",
  async ({ problem, input, value }) => {
    stubResult(
      outcome([caseResult({ input, actual: value, expected: value })]),
    );
    render(<Workspace problem={problem} />);
    await act(() => session.execute("run"));
    const sections = within(detail()).getAllByRole("definition");
    expect(sections.slice(-2).map((item) => item.textContent)).toEqual([
      JSON.stringify(value),
      JSON.stringify(value),
    ]);
    expect(within(detail()).getByText("No console output.")).toBeVisible();
  },
);

it("uses a dedicated compile error view with captured stdout instead of case tabs", async () => {
  stubResult(
    outcome(
      [
        caseResult({
          passed: false,
          verdict: "compile-error",
          message: "SyntaxError: unexpected token",
          logs: ["before compilation failed"],
        }),
      ],
      { verdict: "compile-error" },
    ),
  );
  render(<Workspace />);
  await act(() => session.execute("run"));
  expect(screen.getByTestId("execution-verdict")).toHaveTextContent(
    "Compile Error",
  );
  expect(screen.getByText("SyntaxError: unexpected token")).toBeVisible();
  expect(screen.getByText("before compilation failed")).toBeVisible();
  expect(
    screen.queryByRole("tablist", { name: "Test result cases" }),
  ).toBeNull();
});

it.each(["runtime-error", "time-limit-exceeded"] as const)(
  "shows %s on the selected case",
  async (verdict) => {
    stubResult(
      outcome(
        [
          caseResult({
            passed: false,
            verdict,
            actual: undefined,
            message: "Execution stopped here.",
          }),
        ],
        { verdict },
      ),
    );
    render(<Workspace />);
    await act(() => session.execute("run"));
    expect(within(detail()).getByText("Error")).toBeVisible();
    expect(within(detail()).getByText("Execution stopped here.")).toBeVisible();
    expect(within(detail()).getByText('"a"')).toBeVisible();
  },
);

it("keeps hidden details private while showing the server's Submit verdict", async () => {
  stubResult(
    outcome(
      [
        caseResult(),
        caseResult({
          id: "private-1",
          hidden: true,
          passed: false,
          verdict: "wrong-answer",
          input: { str: "private input" },
          actual: "private output",
          expected: "private expected",
          logs: ["private log"],
          message: "private diagnostic",
        }),
      ],
      { action: "submit", verdict: "wrong-answer" },
    ),
  );
  render(<Workspace />);
  await act(() => session.execute("submit"));
  fireEvent.mouseDown(
    screen.getByRole("tab", { name: "Hidden case 2 · Wrong Answer" }),
    { button: 0 },
  );
  expect(
    screen.getByText(
      /Inputs, output, expected values and console output are private/,
    ),
  ).toBeVisible();
  for (const value of [
    "private input",
    "private output",
    "private expected",
    "private log",
    "private diagnostic",
  ])
    expect(screen.queryByText(value, { exact: false })).toBeNull();
  expect(screen.getByText("1/2 tests passed · Submit")).toBeVisible();
});

it("retains Sleep's observed delay", async () => {
  stubResult(
    outcome([
      caseResult({
        input: 100,
        elapsedMs: 101,
        actual: undefined,
        expected: undefined,
      }),
    ]),
  );
  render(<Workspace problem={sleepProblem} />);
  await act(() => session.execute("run"));
  expect(within(detail()).getByText("Observed delay")).toBeVisible();
  expect(within(detail()).getByText("101 ms")).toBeVisible();
  expect(within(detail()).getByText("millis =")).toBeVisible();
});

it("shows empty and pending feedback and retains results when the service fails", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(Response.json(outcome([])));
  vi.stubGlobal("fetch", fetch);
  render(<Workspace />);
  act(() => session.setOutputTab("test-result"));
  expect(screen.getByText("Run your code to see test results.")).toBeVisible();
  await act(() => session.execute("run"));
  expect(screen.getByText(/No test case details were returned/)).toBeVisible();
  let resolve!: (response: Response) => void;
  fetch.mockImplementationOnce(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      }),
  );
  let request!: Promise<void>;
  act(() => {
    request = session.execute("run");
  });
  expect(screen.getByText("Running your test cases…")).toBeVisible();
  expect(screen.queryByTestId("execution-verdict")).toBeNull();
  await act(async () => {
    resolve(Response.json(outcome([caseResult()])));
    await request;
  });
  fetch.mockRejectedValueOnce(new Error("Runner unavailable"));
  await act(() => session.execute("run"));
  expect(screen.getByRole("alert")).toHaveTextContent("Runner unavailable");
  expect(screen.getByTestId("execution-verdict")).toHaveTextContent("Accepted");
  expect(within(detail()).getByText('"aaa"')).toBeVisible();
});
