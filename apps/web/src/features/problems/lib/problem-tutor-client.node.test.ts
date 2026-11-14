import { counterProblem, type ExecutionResult } from "@workspace/problems";
import { expect, it } from "vitest";
import { readTutorStream, visibleTutorFeedback } from "./problem-tutor-client";
import type { TutorEvent } from "./problem-tutor-contract";

const response = (text: string, finish = true) =>
  new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of new TextEncoder().encode(text))
          controller.enqueue(Uint8Array.of(byte));
        if (finish) controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
it("reads byte-split UTF-8 and SSE frames through confirmed completion", async () => {
  const events: TutorEvent[] = [];
  await readTutorStream(
    response(
      'data: {"type":"start"}\n\ndata: {"type":"delta","text":"Try café ☕"}\n\ndata: {"type":"done"}\n\n',
    ),
    (event) => events.push(event),
    new AbortController().signal,
  );
  expect(events).toEqual([
    { type: "start" },
    { type: "delta", text: "Try café ☕" },
    { type: "done" },
  ]);
});
it("rejects failed, empty, disconnected, invalid and oversized streams without retrying", async () => {
  for (const text of [
    'data: {"type":"delta","text":"partial"}\n\n',
    'data: {"type":"done"}\n\n',
    'data: {"type":"error","message":"Try again"}\n\n',
    'data: {"type":"tool_call"}\n\n',
    `data: ${JSON.stringify({ type: "delta", text: "x".repeat(65537) })}\n\n`,
  ])
    await expect(
      readTutorStream(response(text), () => {}, new AbortController().signal),
    ).rejects.toThrow();
  await expect(
    readTutorStream(
      Response.json(
        { error: "Sign in to access this resource." },
        { status: 401 },
      ),
      () => {},
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ status: 401 });
});
it("projects only matching visible Run feedback, with no case ids or private fields", () => {
  const result: ExecutionResult = {
    attemptId: "attempt",
    action: "run",
    verdict: "wrong-answer",
    passed: 0,
    total: 1,
    cases: [
      {
        id: "case-1",
        hidden: false,
        passed: false,
        verdict: "wrong-answer",
        input: { n: 0, calls: 1 },
        actual: [1],
        expected: [0],
        message: "Different output",
        logs: [],
      },
    ],
  };
  const latest = { source: "code", inputs: [{ n: 0, calls: 1 }], result };
  const firstCase = result.cases[0];
  if (!firstCase) throw new Error("Visible case fixture is missing");
  const projected = visibleTutorFeedback(
    counterProblem,
    "code",
    latest.inputs,
    latest,
  );
  expect(projected.runFeedback?.cases[0]).not.toHaveProperty("id");
  expect(projected.runFeedback?.cases[0]?.actual).toEqual([1]);
  for (const input of [
    { ...latest, source: "old" },
    { ...latest, result: { ...result, action: "submit" as const } },
    {
      ...latest,
      result: { ...result, cases: [{ ...firstCase, hidden: true }] },
    },
    { ...latest, inputs: [{ n: 1, calls: 1 }] },
  ])
    expect(
      visibleTutorFeedback(counterProblem, "code", latest.inputs, input),
    ).toEqual({ feedbackOmitted: true });
  expect(
    visibleTutorFeedback(counterProblem, "code", [undefined], latest),
  ).toEqual({ feedbackOmitted: true });
  expect(
    visibleTutorFeedback(counterProblem, "code", latest.inputs, {
      ...latest,
      result: {
        ...result,
        cases: [{ ...firstCase, logs: ["x".repeat(9000)] }],
      },
    }),
  ).toEqual({ feedbackOmitted: true });
});
