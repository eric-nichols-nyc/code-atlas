import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  chunkArrayProblem,
  counterProblem,
  curryProblem,
  type ExecutionResult,
  flattenNestedArrayProblem,
  functionCompositionProblem,
  longestSubstringTwoDistinctProblem,
  majorityElementProblem,
  mapArrayProblem,
  memoizeProblem,
  type ProblemDefinition,
  type ProblemInput,
  type ProblemOutput,
  reduceArrayProblem,
  sleepProblem,
  validAnagramProblem,
} from "@workspace/problems";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readPracticeRecord } from "../../catalog/state/practice-records";
import { useProblemEditor } from "../state/problem-context";

import { ProblemExperience } from "./problem-experience";

function TestEditor() {
  const s = useProblemEditor();
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
it("edits one case-sensitive substring field, rejects empty input and sends the current source", async () => {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
    Response.json(accepted),
  );
  vi.stubGlobal("fetch", fetch);
  render(<Workspace problem={longestSubstringTwoDistinctProblem} />);
  expect(screen.getByText("Sliding Window")).toBeVisible();
  expect(screen.queryByLabelText("t =")).toBeNull();
  const field = screen.getByRole("textbox", { name: "s =" });
  fireEvent.change(field, { target: { value: "" } });
  expect(field).toHaveAttribute("aria-invalid", "true");
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(field, { target: { value: "aAaAb" } });
  fireEvent.change(
    screen.getByRole("textbox", { name: "JavaScript solution" }),
    { target: { value: longestSubstringTwoDistinctProblem.solution } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByText("Accepted", { selector: "h2" });
  expect(fetch.mock.calls[0]?.[0]).toBe(
    `/api/problems/${longestSubstringTwoDistinctProblem.id}/run`,
  );
  expect(JSON.parse(fetch.mock.calls[0]?.[1]?.body as string)).toMatchObject({
    code: longestSubstringTwoDistinctProblem.solution,
    inputs: [{ s: "aAaAb" }, { s: "ccaabbb" }, { s: "a" }],
  });
});
it("runs Majority Element with edited nums, rejects invalid cases and renders zero", async () => {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
    Response.json({
      ...accepted,
      cases: [
        {
          id: "case-1",
          input: { nums: [0, 1, 0] },
          expected: 0,
          actual: 0,
          hidden: false,
          passed: true,
          verdict: "accepted",
          message: "Correct.",
          logs: [],
        },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetch);
  render(<Workspace problem={majorityElementProblem} />);
  expect(screen.queryByLabelText("init =")).toBeNull();
  expect(screen.queryByRole("combobox", { name: "fn =" })).toBeNull();
  const nums = screen.getByLabelText("nums =");
  for (const value of ["bad", "[]", "[1,2]", "[1,1,2,2]"]) {
    fireEvent.change(nums, { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      majorityElementProblem.inputError,
    );
    expect(fetch).not.toHaveBeenCalled();
  }
  fireEvent.change(
    screen.getByRole("textbox", { name: "JavaScript solution" }),
    {
      target: { value: majorityElementProblem.solution },
    },
  );
  fireEvent.change(nums, { target: { value: "[0,1,0]" } });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByTestId("execution-verdict");
  expect(fetch.mock.calls[0]?.[0]).toBe(
    "/api/problems/javascript.majority-element/run",
  );
  expect(JSON.parse(fetch.mock.calls[0]?.[1]?.body as string)).toEqual({
    code: majorityElementProblem.solution,
    inputs: [
      { nums: [0, 1, 0] },
      ...majorityElementProblem.samples.slice(1).map((sample) => sample.input),
    ],
  });
  expect(screen.getByText("Output")).toBeVisible();
  expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(fetch.mock.calls[1]?.[0]).toBe(
    "/api/problems/javascript.majority-element/submit",
  );
  expect(JSON.parse(fetch.mock.calls[1]?.[1]?.body as string)).toEqual({
    code: majorityElementProblem.solution,
  });
});

it("runs edited nested arrays and validates unsupported values before making a request", async () => {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
    Response.json({
      ...accepted,
      total: 1,
      passed: 1,
      cases: [
        {
          id: "case-1",
          passed: true,
          verdict: "accepted",
          hidden: false,
          input: { arr: [0, [1, [0]]] },
          expected: [0, 1, 0],
          actual: [0, 1, 0],
          message: "Correct.",
          logs: [],
        },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetch);
  render(<Workspace problem={flattenNestedArrayProblem} />);
  expect(screen.queryByRole("combobox", { name: "fn =" })).toBeNull();
  fireEvent.change(screen.getByLabelText("arr ="), {
    target: { value: "[null]" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    flattenNestedArrayProblem.inputError,
  );
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("arr ="), {
    target: { value: "[0,[1,[0]]]" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByText("Accepted", { selector: "h2" });
  expect(fetch.mock.calls[0]?.[0]).toBe(
    "/api/problems/javascript.flatten-nested-array/run",
  );
  expect(
    JSON.parse(fetch.mock.calls[0]?.[1]?.body as string).inputs[0],
  ).toEqual({ arr: [0, [1, [0]]] });
  expect(screen.getAllByText("[0,1,0]", { selector: "dd" })).toHaveLength(2);
});
it("runs edited curry groups and renders numeric zero for both expected and actual output", async () => {
  const input = { fn: "sum3", groups: [[0], [0, 0]] };
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
    Response.json({
      ...accepted,
      total: 1,
      passed: 1,
      cases: [
        {
          id: "case-1",
          passed: true,
          verdict: "accepted",
          hidden: false,
          input,
          expected: 0,
          actual: 0,
          message: "Correct.",
          logs: [],
        },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetch);
  render(<Workspace problem={curryProblem} />);
  expect(screen.getByRole("combobox", { name: "fn =" })).toBeVisible();
  fireEvent.change(screen.getByLabelText("groups ="), {
    target: { value: "[[0],[0,0]]" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByText("Accepted", { selector: "h2" });
  const sent = JSON.parse(fetch.mock.calls[0]?.[1]?.body as string);
  expect(sent.inputs[0]).toEqual(input);
  expect(screen.getAllByText("0", { selector: "dd" })).toHaveLength(2);
});
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
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Solution" }), {
      button: 0,
    });
    expect(screen.getByTestId("execution-verdict")).toHaveTextContent(
      "Accepted",
    );
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Problem" }), {
      button: 0,
    });
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
  it("shows the solution in its own tab and preserves hints, code and inputs across tabs", () => {
    render(<Workspace />);
    const editor = screen.getByRole("textbox", { name: "JavaScript solution" });
    const hint = screen.getByRole("button", { name: "Hint 1" });
    const solution = screen.getByRole("tab", { name: "Solution" });
    expect(hint).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Solution" })).toBeNull();
    expect(
      screen.queryByRole("region", { name: "Problem solution" }),
    ).toBeNull();
    fireEvent.change(editor, { target: { value: "// My work" } });
    fireEvent.change(screen.getByLabelText("millis ="), {
      target: { value: "150" },
    });
    fireEvent.click(hint);
    expect(screen.getByText(/A Promise can stay pending/)).toBeVisible();
    fireEvent.mouseDown(solution, { button: 0 });
    expect(solution).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: "Solution" });
    const solutionCode = within(panel).getByText(/function sleep/, {
      selector: "code",
    });
    expect(solutionCode).toBeVisible();
    expect(solutionCode.textContent).toBe(sleepProblem.solution);
    expect(
      within(panel).getByText(sleepProblem.solutionExplanation),
    ).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "Problem description" }),
    ).toBeNull();
    expect(editor).toHaveValue("// My work");
    expect(screen.getByLabelText("millis =")).toHaveValue(150);
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Notes" }), {
      button: 0,
    });
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Problem" }), {
      button: 0,
    });
    expect(screen.getByRole("button", { name: "Hint 1" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText(/A Promise can stay pending/)).toBeVisible();
    expect(editor).toHaveValue("// My work");
    expect(screen.getByLabelText("millis =")).toHaveValue(150);
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
  it("places Solution and Notes beside Problem and restores focus after closing the AI tutor", async () => {
    render(<Workspace />);
    const editor = screen.getByRole("textbox", { name: "JavaScript solution" });
    fireEvent.change(editor, { target: { value: "// My work" } });
    const tabs = screen.getByRole("tablist", { name: "Problem workspace" });
    const problem = within(tabs).getByRole("tab", { name: "Problem" });
    const solution = within(tabs).getByRole("tab", { name: "Solution" });
    const notes = within(tabs).getByRole("tab", { name: "Notes" });
    expect(within(tabs).getAllByRole("tab")).toEqual([
      problem,
      solution,
      notes,
    ]);
    expect(problem).toHaveAttribute("aria-selected", "true");
    fireEvent.mouseDown(notes, { button: 0 });
    expect(screen.getByRole("tabpanel", { name: "Notes" })).toBeVisible();
    expect(screen.getByRole("form", { name: "Problem notes" })).toBeVisible();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.mouseDown(problem, { button: 0 });
    expect(
      screen.getByRole("region", { name: "Problem description" }),
    ).toBeVisible();
    const ai = screen.getByRole("button", { name: "Show AI tutor" });
    fireEvent.click(ai);
    const drawer = screen.getByRole("dialog", { name: "AI tutor" });
    expect(within(drawer).queryByRole("tab", { name: "Notes" })).toBeNull();
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

const expansionExamples: {
  problem: ProblemDefinition;
  input: ProblemInput;
  expected: ProblemOutput;
  label: string;
  json: string;
  numeric?: { label: string; value: string };
}[] = [
  {
    problem: mapArrayProblem,
    input: { arr: [0, 2], transform: "double" },
    expected: [0, 4],
    label: "arr =",
    json: "[0,2]",
  },
  {
    problem: reduceArrayProblem,
    input: { nums: [1, -1], reducer: "sum", init: 0 },
    expected: 0,
    label: "nums =",
    json: "[1,-1]",
    numeric: { label: "init =", value: "0" },
  },
  {
    problem: chunkArrayProblem,
    input: { arr: [0, 1, 2], size: 2 },
    expected: [[0, 1], [2]],
    label: "arr =",
    json: "[0,1,2]",
    numeric: { label: "size =", value: "2" },
  },
  {
    problem: functionCompositionProblem,
    input: { functions: [], x: 0 },
    expected: 0,
    label: "functions =",
    json: "[]",
    numeric: { label: "x =", value: "0" },
  },
  {
    problem: memoizeProblem,
    input: { fn: "sum", calls: [[0], [0]] },
    expected: { values: [0, 0], callCount: 1 },
    label: "calls =",
    json: "[[0],[0]]",
  },
];
it.each(expansionExamples)(
  "runs edited $problem.title cases and renders the real result shape",
  async ({ problem, input, expected, label, json, numeric }) => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) =>
      Response.json({
        ...accepted,
        total: 1,
        passed: 1,
        cases: [
          {
            id: "case-1",
            passed: true,
            verdict: "accepted",
            input,
            expected,
            actual: expected,
            message: "Correct.",
            logs: [],
            hidden: false,
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetch);
    render(<Workspace problem={problem} />);
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: "[null]" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      problem.inputError,
    );
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(label), { target: { value: json } });
    if (numeric)
      fireEvent.change(screen.getByLabelText(numeric.label), {
        target: { value: numeric.value },
      });
    fireEvent.change(
      screen.getByRole("textbox", { name: "JavaScript solution" }),
      { target: { value: problem.solution } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await screen.findByText("Accepted", { selector: "h2" });
    expect(fetch.mock.calls[0]?.[0]).toBe(`/api/problems/${problem.id}/run`);
    const body = JSON.parse(fetch.mock.calls[0]?.[1]?.body as string);
    expect(body.code).toBe(problem.solution);
    expect(body.inputs[0]).toEqual(input);
    expect(
      screen.getAllByText(JSON.stringify(expected), { exact: true }).length,
    ).toBeGreaterThanOrEqual(2);
  },
);

it("runs exact Anagram string fields, displays false, flags stale edits and rejects whitespace", async () => {
  const fetch = vi.fn(async (_url: string, init?: RequestInit) => {
    const { inputs } = JSON.parse(init?.body as string);
    const input = inputs[0];
    const expected = input.s === "" && input.t === "";
    return Response.json({
      ...accepted,
      passed: 1,
      total: 1,
      cases: [
        {
          id: "case-1",
          hidden: false,
          passed: true,
          verdict: "accepted",
          message: "Checked.",
          logs: [],
          input,
          expected,
          actual: expected,
        },
      ],
    });
  });
  vi.stubGlobal("fetch", fetch);
  render(<Workspace problem={validAnagramProblem} />);
  expect(screen.getByText("Two Pointers")).toBeVisible();
  expect(screen.getByRole("main")).toHaveAccessibleName(
    "Algorithms practice workspace",
  );
  expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
    "href",
    "/algorithms/practice",
  );
  fireEvent.change(screen.getByLabelText("s ="), { target: { value: "aab" } });
  fireEvent.change(screen.getByLabelText("t ="), { target: { value: "abb" } });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByText("Checked.");
  expect(screen.getAllByText("false")).toHaveLength(2);
  expect(
    JSON.parse(fetch.mock.calls[0]?.[1]?.body as string).inputs[0],
  ).toEqual({ s: "aab", t: "abb" });
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Testcase" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByLabelText("t ="), { target: { value: "aba" } });
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Test Result" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.getByText(/Code or inputs changed/)).toBeVisible();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Testcase" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByLabelText("s ="), { target: { value: " aab" } });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("s =")).toHaveAttribute("aria-invalid", "true");
  fireEvent.change(screen.getByLabelText("s ="), { target: { value: "" } });
  fireEvent.change(screen.getByLabelText("t ="), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  await screen.findAllByText("true");
});
