import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  counterProblem,
  type ProblemDefinition,
  sleepProblem,
} from "@workspace/problems";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProblemSession, useProblemSession } from "./problem-session";
import { ProblemTutorSession, useProblemTutor } from "./problem-tutor";

const requests: {
  body: {
    code: string;
    question: string;
    history: { role: string; content: string }[];
  };
  signal: AbortSignal;
  controller: ReadableStreamDefaultController<Uint8Array>;
}[] = [];
function Harness() {
  const session = useProblemSession();
  const tutor = useProblemTutor();
  return (
    <>
      <textarea
        aria-label="Code"
        value={session.source}
        onChange={(event) => session.setSource(event.target.value)}
      />
      <textarea
        aria-label="Question"
        value={tutor.draft}
        onChange={(event) => tutor.setDraft(event.target.value)}
      />
      <button type="button" onClick={() => void tutor.send()}>
        Ask
      </button>
      <button
        type="button"
        onClick={() => {
          session.setSource("// final character!");
          tutor.setDraft("I'm stuck here");
          void tutor.send();
        }}
      >
        Type and ask
      </button>
      <button type="button" onClick={session.resetCode}>
        Reset
      </button>
      <button type="button" onClick={() => void session.execute("run")}>
        Run
      </button>
      <button type="button" onClick={tutor.stop}>
        Stop
      </button>
      {tutor.error && <p role="alert">{tutor.error}</p>}
      {tutor.turns.map((turn) => (
        <div key={turn.id} data-testid="turn">
          <p>{turn.question}</p>
          <p>{turn.answer}</p>
          <p>{turn.status}</p>
          <p>{turn.source}</p>
          {turn.error && <p>{turn.error}</p>}
          <button type="button" onClick={() => void tutor.retry(turn)}>
            Retry
          </button>
        </div>
      ))}
    </>
  );
}
function View({
  problem = counterProblem,
  learner = "guest",
}: {
  problem?: ProblemDefinition;
  learner?: string;
}) {
  return (
    <ProblemSession key={`${learner}:${problem.id}`} problem={problem}>
      <ProblemTutorSession>
        <Harness />
      </ProblemTutorSession>
    </ProblemSession>
  );
}
beforeEach(() => {
  requests.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, options?: RequestInit) => {
      if (path.endsWith("/run"))
        return Response.json({
          attemptId: "run",
          action: "run",
          verdict: "wrong-answer",
          passed: 0,
          total: 2,
          cases: [],
        });
      const signal = options?.signal as AbortSignal;
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            requests.push({
              body: JSON.parse(options?.body as string),
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
async function emit(index: number, event: unknown) {
  await act(async () => {
    requests[index]?.controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`),
    );
  });
}
async function finish(index: number, text = "Try a closure.") {
  await emit(index, { type: "delta", text });
  await emit(index, { type: "done" });
}

it("makes no tutor request for editing, drafts, Reset, Run or Strict Mode mounting, then captures immediate typing once", async () => {
  render(
    <StrictMode>
      <View />
    </StrictMode>,
  );
  fireEvent.change(screen.getByLabelText("Code"), {
    target: { value: "// local edit" },
  });
  fireEvent.change(screen.getByLabelText("Question"), {
    target: { value: "draft" },
  });
  fireEvent.click(screen.getByText("Reset"));
  fireEvent.click(screen.getByText("Run"));
  await act(async () => {});
  expect(requests).toHaveLength(0);
  fireEvent.click(screen.getByText("Type and ask"));
  fireEvent.click(screen.getByText("Ask"));
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(requests[0]?.body).toMatchObject({
    code: "// final character!",
    question: "I'm stuck here",
    history: [],
  });
  await finish(0);
  await screen.findByText("completed");
});
it("keeps an immutable pending source and sends newly edited code with completed dialogue on follow-up", async () => {
  render(<View />);
  fireEvent.click(screen.getByText("Type and ask"));
  await waitFor(() => expect(requests).toHaveLength(1));
  fireEvent.change(screen.getByLabelText("Code"), {
    target: { value: "// changed while pending" },
  });
  expect(requests[0]?.body.code).toBe("// final character!");
  expect(requests).toHaveLength(1);
  await finish(0);
  fireEvent.change(screen.getByLabelText("Question"), {
    target: { value: "What next?" },
  });
  fireEvent.click(screen.getByText("Ask"));
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[1]?.body.code).toBe("// changed while pending");
  expect(requests[1]?.body.history).toEqual([
    { role: "user", content: "I'm stuck here" },
    { role: "assistant", content: "Try a closure." },
  ]);
  await finish(1);
});
it("stops without retrying and explicitly retries with current code while preserving a newer draft", async () => {
  render(<View />);
  fireEvent.click(screen.getByText("Type and ask"));
  await waitFor(() => expect(requests).toHaveLength(1));
  await emit(0, { type: "delta", text: "Partial hint" });
  fireEvent.change(screen.getByLabelText("Question"), {
    target: { value: "newer unsent question" },
  });
  fireEvent.click(screen.getByText("Stop"));
  await screen.findByText("stopped");
  expect(requests).toHaveLength(1);
  fireEvent.change(screen.getByLabelText("Code"), {
    target: { value: "// fresh retry source" },
  });
  fireEvent.click(screen.getByText("Retry"));
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[1]?.body).toMatchObject({
    code: "// fresh retry source",
    question: "I'm stuck here",
    history: [],
  });
  expect(screen.getAllByTestId("turn")).toHaveLength(1);
  expect(screen.getByLabelText("Question")).toHaveValue(
    "newer unsent question",
  );
  await finish(1);
});
it("rejects oversized source/questions locally and retains both drafts", async () => {
  render(<View />);
  fireEvent.change(screen.getByLabelText("Code"), {
    target: { value: "x".repeat(33000) },
  });
  fireEvent.change(screen.getByLabelText("Question"), {
    target: { value: "help" },
  });
  fireEvent.click(screen.getByText("Ask"));
  expect(await screen.findByRole("alert")).toHaveTextContent("32 KiB");
  expect(screen.getByLabelText("Question")).toHaveValue("help");
  expect(requests).toHaveLength(0);
  fireEvent.change(screen.getByLabelText("Code"), { target: { value: "" } });
  fireEvent.change(screen.getByLabelText("Question"), {
    target: { value: "q".repeat(4100) },
  });
  fireEvent.click(screen.getByText("Ask"));
  expect(await screen.findByRole("alert")).toHaveTextContent("4 KiB");
  expect(requests).toHaveLength(0);
});
it("clears chat/draft and cancels the old stream when problem or account changes", async () => {
  const view = render(<View />);
  fireEvent.click(screen.getByText("Type and ask"));
  await waitFor(() => expect(requests).toHaveLength(1));
  fireEvent.change(screen.getByLabelText("Question"), {
    target: { value: "unsent" },
  });
  view.rerender(<View problem={sleepProblem} />);
  await waitFor(() => expect(requests[0]?.signal.aborted).toBe(true));
  expect(screen.queryByTestId("turn")).toBeNull();
  expect(screen.getByLabelText("Question")).toHaveValue("");
  fireEvent.change(screen.getByLabelText("Question"), {
    target: { value: "new account draft" },
  });
  view.rerender(<View problem={sleepProblem} learner="another" />);
  expect(screen.getByLabelText("Question")).toHaveValue("");
  expect(requests).toHaveLength(1);
});
