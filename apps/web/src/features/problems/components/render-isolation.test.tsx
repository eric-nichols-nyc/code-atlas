import { act, render, screen } from "@testing-library/react";
import { counterProblem } from "@workspace/problems";
import { Profiler, type ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  evaluationFixture,
  evaluationStream,
} from "../../../../../../tests/fixtures/code-evaluation";
import {
  useProblemCases,
  useProblemControls,
  useProblemEditor,
  useProblemEvaluation,
  useProblemHints,
} from "../state/problem-context";
import { ProblemSession } from "../state/problem-session";
import { ProblemTutorSession, useProblemTutor } from "../state/problem-tutor";
import { CaseInputFields } from "./case-input-fields";
import { CodePanel } from "./code-panel";
import { DescriptionPanel } from "./description-panel";
import { ProblemTutor } from "./problem-tutor";
import { ResultPanel } from "./result-panel";
import { SolutionPanel } from "./solution-panel";

vi.mock("next/dynamic", () => ({ default: () => () => null }));
const markdown = vi.hoisted(() => vi.fn());
vi.mock("react-markdown", async (original) => {
  const actual = await original<typeof import("react-markdown")>();
  return {
    ...actual,
    default: (props: Parameters<typeof actual.default>[0]) => {
      markdown(props.children);
      return <actual.default {...props} />;
    },
  };
});

let editor: ReturnType<typeof useProblemEditor>;
let controls: ReturnType<typeof useProblemControls>;
let cases: ReturnType<typeof useProblemCases>;
let hints: ReturnType<typeof useProblemHints>;
let evaluation: ReturnType<typeof useProblemEvaluation>;
let tutor: ReturnType<typeof useProblemTutor>;
const commits: Record<string, number> = {};
function Capture() {
  editor = useProblemEditor();
  controls = useProblemControls();
  cases = useProblemCases();
  hints = useProblemHints();
  evaluation = useProblemEvaluation();
  tutor = useProblemTutor();
  return null;
}
function EditorProbe() {
  useProblemEditor();
  return null;
}
function Measure({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Profiler
      id={id}
      onRender={() => {
        commits[id] = (commits[id] ?? 0) + 1;
      }}
    >
      {children}
    </Profiler>
  );
}
function mount(solution = false) {
  return render(
    <ProblemSession problem={counterProblem}>
      <ProblemTutorSession>
        <Capture />
        <Measure id="content">
          {solution ? (
            <SolutionPanel />
          ) : (
            <DescriptionPanel>
              <p>Statement</p>
            </DescriptionPanel>
          )}
        </Measure>
        <Measure id="controls">
          <CodePanel />
        </Measure>
        <Measure id="results">
          <ResultPanel />
        </Measure>
        <Measure id="cases">
          <CaseInputFields index={0} />
        </Measure>
        <Measure id="tutor">
          <ProblemTutor />
        </Measure>
        <Measure id="editor">
          <EditorProbe />
        </Measure>
      </ProblemTutorSession>
    </ProblemSession>,
  );
}
function resetCounts() {
  for (const key of Object.keys(commits)) commits[key] = 0;
  markdown.mockClear();
}
const accepted = {
  attemptId: "isolation",
  action: "run",
  verdict: "accepted",
  passed: 2,
  total: 2,
  cases: [],
};
afterEach(() => vi.unstubAllGlobals());

it.each([false, true])(
  "isolates twenty source edits from unchanged panels (Solution: %s)",
  async (solution) => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    mount(solution);
    await act(async () => {});
    act(() => editor.setSource("// warmup"));
    resetCounts();
    for (let i = 0; i < 20; i++) act(() => editor.setSource(`// edit ${i}`));
    expect(commits).toMatchObject({
      content: 0,
      controls: 0,
      results: 0,
      cases: 0,
      tutor: 0,
      editor: 20,
    });
    expect(fetch).not.toHaveBeenCalled();
  },
);

it("isolates hint expansion and case selection from the editor and other panels", async () => {
  mount();
  await act(async () => {});
  resetCounts();
  for (let i = 0; i < 10; i++)
    act(() => hints.setHelpSections(i % 2 ? [] : ["hint-0"]));
  expect(commits).toMatchObject({
    controls: 0,
    results: 0,
    cases: 0,
    tutor: 0,
    editor: 0,
  });
  resetCounts();
  for (let i = 0; i < 10; i++)
    act(() => cases.setSelectedCase(String((i + 1) % 2)));
  expect(commits).toMatchObject({
    content: 0,
    controls: 0,
    tutor: 0,
    editor: 0,
  });
});

it("updates result freshness once per match transition and keeps cases isolated", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(accepted)),
  );
  mount();
  await act(async () => controls.execute("run"));
  const source = editor.source;
  resetCounts();
  for (let i = 0; i < 20; i++) act(() => editor.setSource(`// changed ${i}`));
  expect(screen.getByText(/Code or inputs changed/)).toBeVisible();
  expect(commits).toMatchObject({ content: 0, cases: 0, tutor: 0, results: 1 });
  act(() => editor.setSource(source));
  expect(screen.queryByText(/Code or inputs changed/)).toBeNull();
  expect(commits.results).toBe(2);
  act(() => cases.updateInput(0, { value: "42" }));
  expect(screen.getByText(/Code or inputs changed/)).toBeVisible();
  act(() => cases.updateInput(0, { value: "10" }));
  expect(screen.queryByText(/Code or inputs changed/)).toBeNull();
});

it("keeps evaluation stale feedback live without recurring report updates", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(evaluationStream(evaluationFixture), {
          headers: { "Content-Type": "text/event-stream" },
        }),
    ),
  );
  mount();
  await act(async () => evaluation.evaluate());
  expect(screen.getByTestId("evaluation-score")).toHaveTextContent("10/10");
  const source = editor.source;
  resetCounts();
  for (let i = 0; i < 20; i++) act(() => editor.setSource(`// changed ${i}`));
  expect(screen.getByText(/Code changed since this evaluation/)).toBeVisible();
  expect(commits).toMatchObject({ content: 0, cases: 0, tutor: 0, results: 1 });
  act(() => editor.setSource(source));
  expect(screen.queryByText(/Code changed since this evaluation/)).toBeNull();
  expect(commits.results).toBe(2);
});

it("updates tutor notices without rerendering completed Markdown, including a return to captured code", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          'data: {"type":"delta","text":"Try a **closure**."}\n\ndata: {"type":"done"}\n\n',
          { headers: { "Content-Type": "text/event-stream" } },
        ),
    ),
  );
  mount();
  act(() => tutor.setDraft("Explain the closure"));
  await act(async () => tutor.send());
  expect(screen.getByText("closure", { selector: "strong" })).toBeVisible();
  const source = editor.source;
  resetCounts();
  for (let i = 0; i < 20; i++) act(() => editor.setSource(`// changed ${i}`));
  expect(screen.getByText("Code changed since this question.")).toBeVisible();
  expect(commits).toMatchObject({ content: 0, cases: 0, results: 0, tutor: 1 });
  expect(markdown).not.toHaveBeenCalled();
  act(() => editor.setSource(source));
  expect(screen.queryByText("Code changed since this question.")).toBeNull();
  expect(commits.tutor).toBe(2);
  expect(markdown).not.toHaveBeenCalled();

  act(() => editor.setSource("// second question source"));
  act(() => tutor.setDraft("Explain this version"));
  await act(async () => tutor.send());
  expect(screen.getAllByText("Code changed since this question.")).toHaveLength(
    1,
  );
  act(() => editor.setSource("// matches neither question"));
  expect(screen.getAllByText("Code changed since this question.")).toHaveLength(
    2,
  );
  act(() => editor.setSource(source));
  expect(screen.getAllByText("Code changed since this question.")).toHaveLength(
    1,
  );
});

it("updates in-flight evaluation freshness without rerendering on every subsequent edit", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      await gate;
      return new Response(evaluationStream(), {
        headers: { "Content-Type": "text/event-stream" },
      });
    }),
  );
  mount();
  let request!: Promise<void>;
  act(() => {
    request = evaluation.evaluate();
  });
  const source = editor.source;
  resetCounts();
  for (let i = 0; i < 20; i++) act(() => editor.setSource(`// changed ${i}`));
  expect(screen.getByText(/Code changed while evaluating/)).toBeVisible();
  expect(commits).toMatchObject({ content: 0, cases: 0, tutor: 0, results: 1 });
  act(() => editor.setSource(source));
  expect(screen.queryByText(/Code changed while evaluating/)).toBeNull();
  await act(async () => {
    release();
    await request;
  });
  expect(screen.getByTestId("evaluation-score")).toHaveTextContent("10/10");
});
