import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { counterProblem } from "@workspace/problems";
import { afterEach, expect, it, vi } from "vitest";
import { ProblemSession, useProblemSession } from "./problem-session";

afterEach(() => vi.unstubAllGlobals());
function Harness({ capture }: { capture: (value: string) => void }) {
  const session = useProblemSession();
  return (
    <>
      <p>{session.source}</p>
      <button
        type="button"
        onClick={() => {
          session.setSource("// final character!");
          capture(session.readCurrentSource());
        }}
      >
        Type and snapshot
      </button>
      <button
        type="button"
        onClick={() => {
          session.setSource("");
          capture(session.readCurrentSource());
        }}
      >
        Empty
      </button>
      <button
        type="button"
        onClick={() => {
          session.resetCode();
          capture(session.readCurrentSource());
        }}
      >
        Reset
      </button>
      <button
        type="button"
        onClick={() => {
          capture(session.readCurrentSource());
        }}
      >
        Snapshot
      </button>
    </>
  );
}
it("reads synchronously before rendering, then reflects account restore, empty source and Reset", async () => {
  let captured = "";

  const fetch = vi.fn(async () =>
    Response.json({
      record: {
        problemId: counterProblem.id,
        flagged: false,
        solvedAt: null,
        legacyCompleted: false,
        lastCode: "// account source",
        codeUpdatedAt: new Date().toISOString(),
      },
    }),
  );
  vi.stubGlobal("fetch", fetch);
  render(
    <ProblemSession problem={counterProblem} learnerId="snapshot-test">
      <Harness
        capture={(value) => {
          captured = value;
        }}
      />
    </ProblemSession>,
  );
  await waitFor(() =>
    expect(screen.getByText("// account source")).toBeVisible(),
  );
  fireEvent.click(screen.getByText("Snapshot"));
  expect(captured).toBe("// account source");
  fireEvent.click(screen.getByText("Type and snapshot"));
  expect(captured).toBe("// final character!");
  fireEvent.click(screen.getByText("Empty"));
  expect(captured).toBe("");
  fireEvent.click(screen.getByText("Reset"));
  expect(captured).toBe(counterProblem.starterCode);
  expect(fetch).toHaveBeenCalledTimes(1);
});
