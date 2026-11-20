import { act, render, waitFor } from "@testing-library/react";
import { counterProblem, type ExecutionResult } from "@workspace/problems";
import { afterEach, expect, it, vi } from "vitest";
import { readPracticeRecord } from "../../catalog/state/practice-records";
import { readCodeBackup } from "../lib/code-backup";
import {
  useProblemCases,
  useProblemControls,
  useProblemEditor,
  useProblemEvaluation,
  useProblemHints,
  useProblemOutput,
  useProblemResults,
} from "./problem-context";
import { ProblemSession } from "./problem-session";

function useSession() {
  return {
    ...useProblemCases(),
    ...useProblemEditor(),
    ...useProblemControls(),
    ...useProblemResults(),
    ...useProblemOutput(),
    ...useProblemHints(),
    evaluation: useProblemEvaluation(),
  };
}

let session: ReturnType<typeof useSession>;
function Capture() {
  session = useSession();
  return null;
}
function mount(learnerId?: string) {
  return render(
    <ProblemSession problem={counterProblem} learnerId={learnerId}>
      <Capture />
    </ProblemSession>,
  );
}
function deferredResponse() {
  let resolve!: (response: Response) => void;
  return {
    promise: new Promise<Response>((done) => {
      resolve = done;
    }),
    resolve: (body: unknown) => resolve(Response.json(body)),
  };
}
const accepted: ExecutionResult = {
  attemptId: "hook-refactor",
  action: "run",
  verdict: "accepted",
  passed: 2,
  total: 2,
  cases: [],
  persistence: "saved",
};
const savedRecord = {
  record: {
    problemId: counterProblem.id,
    flagged: false,
    solvedAt: null,
    legacyCompleted: false,
    lastCode: "// old account source",
    codeUpdatedAt: "2026-11-20T12:00:00.000Z",
  },
};
afterEach(() => vi.unstubAllGlobals());

it("retains parsed cases across unrelated edits, adds independent cases, and caps them at five", () => {
  mount();
  const parsed = session.parsedInputs;
  act(() => session.setSource("// current draft"));
  act(() => session.setHelpSections(["hint-0"]));
  act(() => session.setSelectedCase("1"));
  expect(session.parsedInputs).toBe(parsed);

  act(() => session.addCase());
  expect(session.selectedCase).toBe("2");
  expect(session.parsedInputs[2]).toEqual(parsed[0]);
  act(() => session.updateInput(2, { value: "42" }));
  expect(session.parsedInputs[2]).toEqual({ n: 42, calls: 3 });
  expect(session.parsedInputs[0]).toEqual(parsed[0]);
  act(() => session.addCase());
  act(() => session.addCase());
  act(() => session.addCase());
  expect(session.inputs).toHaveLength(5);
  expect(new Set(session.inputIds).size).toBe(5);
  expect(session.selectedCase).toBe("4");
  act(() => session.updateInput(4, { calls: "" }));
  expect(session.parsedInputs[4]).toBeUndefined();
});

it("captures the last keystroke once, excludes overlapping actions and preserves newer source/inputs after saving", async () => {
  const run = deferredResponse();
  const fetch = vi.fn((url: string, _init?: RequestInit) =>
    url.startsWith("/api/practice-progress")
      ? Promise.resolve(Response.json({ record: null }))
      : run.promise,
  );
  vi.stubGlobal("fetch", fetch);
  const learner = "hook-snapshot-test";
  mount(learner);
  await waitFor(() => expect(session.codeStatus).toContain("Unsaved edits"));
  act(() => {
    session.setSource("// final character!");
    void session.execute("run");
    void session.execute("submit");
    void session.evaluation.evaluate();
  });
  expect(fetch).toHaveBeenCalledTimes(2);
  const sent = JSON.parse(fetch.mock.calls[1]?.[1]?.body as string);
  expect(sent.code).toBe("// final character!");
  act(() => session.setSource("// newer typing"));
  act(() => session.updateInput(0, { value: "42" }));
  await act(async () => run.resolve(accepted));
  expect(session.source).toBe("// newer typing");
  expect(session.latest?.source).toBe("// final character!");
  expect(session.latest?.inputs).toEqual(sent.inputs);
  expect(session.parsedInputs[0]).toEqual({ n: 42, calls: 3 });
  expect(session.codeStatus).toContain("Unsaved edits");
  expect(readCodeBackup(learner, counterProblem.id)).toBeNull();
});

it.each(["Reset", "invalid Run"])(
  "keeps %s ahead of a delayed account restore",
  async (action) => {
    const restore = deferredResponse();
    const fetch = vi.fn(() => restore.promise);
    vi.stubGlobal("fetch", fetch);
    mount(`hook-restore-${action}`);
    if (action === "Reset") {
      act(() => session.resetCode());
    } else {
      act(() => session.updateInput(0, { value: "" }));
      await act(async () => session.execute("run"));
      expect(session.error).toBe(counterProblem.inputError);
      expect(session.outputTab).toBe("testcase");
    }
    await act(async () => restore.resolve(savedRecord));
    expect(session.source).toBe(counterProblem.starterCode);
    expect(session.readCurrentSource()).toBe(counterProblem.starterCode);
    expect(fetch).toHaveBeenCalledTimes(1);
  },
);

it("aborts execution on session exit and ignores late success without recording completion", async () => {
  const submit = deferredResponse();
  let signal: AbortSignal | undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/practice-progress"))
        return Promise.resolve(Response.json({ record: null }));
      signal = init?.signal as AbortSignal;
      return submit.promise;
    }),
  );
  const learner = "hook-cancel-test";
  const view = mount(learner);
  await waitFor(() => expect(session.codeStatus).toContain("Unsaved edits"));
  act(() => {
    session.setSource("// cancelled submission");
    void session.execute("submit");
  });
  view.unmount();
  expect(signal?.aborted).toBe(true);
  await act(async () => submit.resolve({ ...accepted, action: "submit" }));
  expect(readPracticeRecord(learner).solved).toEqual([]);
  expect(readCodeBackup(learner, counterProblem.id)).toBe(
    "// cancelled submission",
  );
});
