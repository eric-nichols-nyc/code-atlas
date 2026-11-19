import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  counterProblem,
  majorityElementProblem,
  type ProblemDefinition,
} from "@workspace/problems";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { evaluationFixture } from "../../../../../../tests/fixtures/code-evaluation";
import { ProblemSession, useProblemSession } from "../state/problem-session";
import { CodePanel } from "./code-panel";
import { ResultPanel } from "./result-panel";

function Editor() {
  const s = useProblemSession();
  return (
    <>
      <textarea
        aria-label="Code"
        value={s.source}
        onChange={(e) => s.setSource(e.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          s.setSource("// final character!");
          void s.evaluation.evaluate();
        }}
      >
        Type and evaluate
      </button>
    </>
  );
}
vi.mock("next/dynamic", () => ({ default: () => Editor }));
const requests: {
  code: string;
  signal: AbortSignal;
  controller: ReadableStreamDefaultController<Uint8Array>;
}[] = [];
function View({
  problem = majorityElementProblem,
}: {
  problem?: ProblemDefinition;
}) {
  return (
    <ProblemSession key={problem.id} problem={problem}>
      <CodePanel />
      <ResultPanel />
    </ProblemSession>
  );
}
beforeEach(() => {
  requests.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/run"))
        return Response.json({
          attemptId: "visible",
          action: "run",
          verdict: "accepted",
          passed: 1,
          total: 1,
          cases: [],
        });
      const signal = init?.signal as AbortSignal;
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            requests.push({
              code: JSON.parse(init?.body as string).code,
              signal,
              controller,
            });
            signal.addEventListener(
              "abort",
              () => controller.error(new DOMException("Aborted", "AbortError")),
              { once: true },
            );
          },
        }),
        { headers: { "Content-Type": "text/event-stream" } },
      );
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());
async function finish(index: number, report: unknown = evaluationFixture) {
  await act(async () => {
    const stream = requests[index]?.controller;
    for (const event of [
      { type: "delta", text: JSON.stringify(report) },
      { type: "done" },
    ])
      stream?.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`),
      );
  });
}

it("only evaluates on explicit action, captures immediate code once, preserves judge results and uses exactly two output tabs", async () => {
  render(
    <StrictMode>
      <View />
    </StrictMode>,
  );
  fireEvent.change(screen.getByLabelText("Code"), {
    target: { value: "// unsaved edit" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Reset code" }));
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByTestId("execution-verdict");
  expect(requests).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Type and evaluate" }));
  fireEvent.click(screen.getByRole("button", { name: "Type and evaluate" }));
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(requests[0]?.code).toBe("// final character!");
  expect(screen.getByRole("button", { name: "Run" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Code"), {
    target: { value: "// newer code" },
  });
  expect(screen.getByText(/Code changed while evaluating/)).toBeVisible();
  await finish(0);
  expect(await screen.findByTestId("evaluation-score")).toHaveTextContent(
    "10/10",
  );
  expect(screen.getByText(/Code changed since this evaluation/)).toBeVisible();
  expect(screen.getByTestId("execution-verdict")).toHaveTextContent("Accepted");
  expect(
    within(
      screen.getByRole("region", { name: "Test cases and results" }),
    ).getAllByRole("tab"),
  ).toHaveLength(2);
  expect(screen.getByLabelText("Code")).toHaveValue("// newer code");
  expect(vi.mocked(fetch).mock.calls.map((call) => call[0])).toEqual([
    `/api/problems/${majorityElementProblem.id}/run`,
    `/api/problems/${majorityElementProblem.id}/evaluate`,
  ]);
});
it("stops, retries with fresh source, rejects malformed reports and preserves an earlier completed report", async () => {
  render(<View />);
  fireEvent.click(screen.getByRole("button", { name: "Evaluate" }));
  await waitFor(() => expect(requests).toHaveLength(1));
  await finish(0);
  fireEvent.click(screen.getByRole("button", { name: "Evaluate" }));
  await waitFor(() => expect(requests).toHaveLength(2));
  fireEvent.click(screen.getByRole("button", { name: "Stop evaluation" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Evaluation stopped",
  );
  expect(screen.getByTestId("evaluation-score")).toHaveTextContent("10/10");
  fireEvent.change(screen.getByLabelText("Code"), {
    target: { value: "// fresh retry" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Retry with current code" }),
  );
  await waitFor(() => expect(requests).toHaveLength(3));
  expect(requests[2]?.code).toBe("// fresh retry");
  await finish(2, { score: 100 });
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "incomplete or invalid",
  );
  expect(screen.getByTestId("evaluation-score")).toHaveTextContent("10/10");
});
it("handles sign-in and empty source without discarding edits or sending automatic retries", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json(
        { error: "Sign in to access this resource." },
        { status: 401 },
      ),
    ),
  );
  render(<View />);
  fireEvent.change(screen.getByLabelText("Code"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Evaluate" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Write some code");
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Code"), {
    target: { value: "// kept" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Retry with current code" }),
  );
  expect(
    await screen.findByRole("link", { name: "Sign in again" }),
  ).toBeVisible();
  expect(screen.getByLabelText("Code")).toHaveValue("// kept");
  expect(fetch).toHaveBeenCalledTimes(1);
});
it("aborts and clears evaluation when leaving the problem", async () => {
  const view = render(<View />);
  fireEvent.click(screen.getByRole("button", { name: "Evaluate" }));
  await waitFor(() => expect(requests).toHaveLength(1));
  view.rerender(<View problem={counterProblem} />);
  expect(requests[0]?.signal.aborted).toBe(true);
  expect(screen.queryByRole("region", { name: "AI evaluation" })).toBeNull();
  expect(screen.getByLabelText("Code")).toHaveValue(counterProblem.starterCode);
});
