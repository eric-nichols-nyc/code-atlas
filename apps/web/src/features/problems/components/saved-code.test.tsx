import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { sleepProblem } from "@workspace/problems";
import { afterEach, expect, it, vi } from "vitest";
import { readCodeBackup } from "../lib/code-backup";
import { ProblemSession, useProblemSession } from "../state/problem-session";

function Harness() {
  const s = useProblemSession();
  return (
    <>
      <textarea
        aria-label="Code"
        value={s.source}
        onChange={(e) => s.setSource(e.target.value)}
      />
      <p>{s.codeStatus}</p>
      <button type="button" onClick={() => void s.execute("run")}>
        Run
      </button>
      <button type="button" onClick={() => void s.execute("submit")}>
        Submit
      </button>
      <button type="button" onClick={s.retryRestore}>
        Retry
      </button>
    </>
  );
}
const mount = (owner: string) =>
  render(
    <ProblemSession learnerId={owner} problem={sleepProblem}>
      <Harness />
    </ProblemSession>,
  );
const record = (code: string) => ({
  record: {
    problemId: sleepProblem.id,
    flagged: false,
    solvedAt: null,
    legacyCompleted: false,
    lastCode: code,
    codeUpdatedAt: new Date().toISOString(),
  },
});
afterEach(() => vi.unstubAllGlobals());
it("restores account source before editing", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(record("// saved remotely"))),
  );
  mount("restore-account-test");
  await waitFor(() =>
    expect(screen.getByRole("textbox")).toHaveValue("// saved remotely"),
  );
  expect(screen.getByText(/Saved to account/)).toBeVisible();
});
it("never overwrites typing with a delayed saved-code read", async () => {
  let resolve!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((r) => {
          resolve = r;
        }),
    ),
  );
  mount("restore-race-test");
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "// current typing" },
  });
  resolve(Response.json(record("// old remotely saved code")));
  await screen.findByText(/Unsaved edits/);
  expect(screen.getByRole("textbox")).toHaveValue("// current typing");
});
it("saves wrong-answer source, preserves later edits, and restores after reopening", async () => {
  let saved: string | null = null;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith("/api/practice-progress"))
        return Response.json(saved === null ? { record: null } : record(saved));
      saved = JSON.parse(init?.body as string).code;
      return Response.json({
        attemptId: "attempt",
        action: "run",
        verdict: "wrong-answer",
        passed: 0,
        total: 2,
        cases: [],
        persistence: "saved",
      });
    }),
  );
  const view = mount("wrong-answer-save-test");
  await screen.findByText(/Unsaved edits/);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "async function sleep() {}" },
  });
  fireEvent.click(screen.getByText("Run"));
  await screen.findByText(/Saved to account/);
  expect(readCodeBackup("wrong-answer-save-test", sleepProblem.id)).toBeNull();
  view.unmount();
  mount("wrong-answer-save-test");
  await waitFor(() =>
    expect(screen.getByRole("textbox")).toHaveValue(
      "async function sleep() {}",
    ),
  );
});
it("keeps an unsaved browser backup and does not claim a failed database write saved", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.startsWith("/api/practice-progress")
        ? Response.json({ record: null })
        : Response.json({
            attemptId: "attempt",
            action: "submit",
            verdict: "accepted",
            passed: 10,
            total: 10,
            cases: [],
            persistence: "unavailable",
          }),
    ),
  );
  const view = mount("save-outage-test");
  await screen.findByText(/Unsaved edits/);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "// offline code" },
  });
  fireEvent.click(screen.getByText("Submit"));
  await screen.findByText(/Not saved to account/);
  expect(readCodeBackup("save-outage-test", sleepProblem.id)).toBe(
    "// offline code",
  );
  view.unmount();
  mount("save-outage-test");
  await waitFor(() =>
    expect(screen.getByRole("textbox")).toHaveValue("// offline code"),
  );
});
