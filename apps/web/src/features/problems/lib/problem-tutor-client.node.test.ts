import { counterProblem, type ExecutionResult } from "@workspace/problems";
import { expect, it } from "vitest";
import { visibleTutorFeedback } from "./problem-tutor-client";

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
