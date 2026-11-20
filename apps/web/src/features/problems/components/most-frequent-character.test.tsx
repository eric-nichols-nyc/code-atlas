import { fireEvent, render, screen } from "@testing-library/react";
import { mostFrequentCharacterProblem as problem } from "@workspace/problems";
import { expect, it, vi } from "vitest";
import {
  algorithmsPracticeCatalog,
  algorithmTopics,
} from "@/content/algorithms/practice/catalog";
import { PracticeCatalog } from "@/features/catalog/components/javascript-practice";
import { useProblemSession } from "../state/problem-session";
import { ProblemExperience } from "./problem-experience";

function TestEditor() {
  const session = useProblemSession();
  return (
    <textarea
      aria-label="JavaScript solution"
      value={session.source}
      onChange={(event) => session.setSource(event.target.value)}
    />
  );
}
vi.mock("next/dynamic", () => ({ default: () => TestEditor }));

it("discovers the challenge through Hash Maps", () => {
  render(
    <PracticeCatalog
      title="Algorithms practice"
      topics={algorithmTopics}
      catalog={algorithmsPracticeCatalog}
    />,
  );
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Hash Maps" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.getByRole("link", { name: problem.title })).toHaveAttribute(
    "href",
    "/algorithms/practice/most-frequent-character",
  );
  expect(screen.queryByRole("link", { name: "Valid Anagram" })).toBeNull();
});

it("runs exact string drafts, shows empty output and prevents oversized inputs", async () => {
  const fetch = vi.fn(async (_url: string, init?: RequestInit) => {
    const { inputs } = JSON.parse(init?.body as string);
    return Response.json({
      attemptId: "frequency-run",
      action: "run",
      verdict: "accepted",
      passed: 1,
      total: 1,
      cases: [
        {
          id: "case-1",
          hidden: false,
          passed: true,
          verdict: "accepted",
          message: "Checked character frequency.",
          logs: [],
          input: inputs[0],
          expected: "",
          actual: "",
        },
      ],
    });
  });
  vi.stubGlobal("fetch", fetch);
  render(
    <ProblemExperience problem={problem}>
      <p>Most Frequent Character statement.</p>
    </ProblemExperience>,
  );
  expect(screen.getByText("Hash Maps")).toBeVisible();
  const field = screen.getByRole("textbox", { name: "str =" });
  fireEvent.change(field, { target: { value: "x".repeat(1001) } });
  expect(field).toHaveAttribute("aria-invalid", "true");
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent(problem.inputError);
  fireEvent.change(field, { target: { value: " a\n😀 " } });
  fireEvent.change(
    screen.getByRole("textbox", { name: "JavaScript solution" }),
    { target: { value: problem.solution } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await screen.findByText("Checked character frequency.");
  expect(fetch.mock.calls[0]?.[0]).toBe(`/api/problems/${problem.id}/run`);
  expect(
    JSON.parse(fetch.mock.calls[0]?.[1]?.body as string).inputs[0],
  ).toEqual({ str: " a\n😀 " });
  expect(screen.getAllByText('""', { exact: true })).toHaveLength(2);
});
