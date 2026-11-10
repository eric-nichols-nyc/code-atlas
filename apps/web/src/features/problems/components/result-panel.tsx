"use client";
import { formatProblemInput } from "@workspace/problems";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { inputDraft } from "../lib/input-drafts";
import { useProblemSession } from "../state/problem-session";
import { CaseInputFields } from "./case-input-fields";
import { verdictLabels } from "./description-panel";
export function ResultPanel() {
  const s = useProblemSession();
  const index = Math.min(Number(s.selectedCase), s.inputs.length - 1);
  const result = s.latest?.result;
  const stale =
    s.latest &&
    (s.latest.source !== s.source ||
      (result?.action === "run" &&
        JSON.stringify(s.latest.inputs) !== JSON.stringify(s.parsedInputs)));
  return (
    <section className="learning-panel" aria-label="Test cases and results">
      <Tabs
        value={s.outputTab}
        onValueChange={s.setOutputTab}
        className="min-h-0 flex-1 gap-0"
      >
        <div className="learning-panel-header">
          <TabsList variant="line">
            <TabsTrigger value="testcase">Testcase</TabsTrigger>
            <TabsTrigger value="test-result">Test Result</TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {s.error && (
            <p
              role="alert"
              className="mb-4 text-sm leading-relaxed text-destructive"
            >
              {s.error}
            </p>
          )}
          <TabsContent value="testcase">
            <div className="mb-4 flex flex-wrap gap-2">
              {s.inputs.map((_, i) => (
                <Button
                  key={s.inputIds.current[i]}
                  variant={i === index ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => s.setSelectedCase(String(i))}
                  aria-pressed={i === index}
                >
                  Case {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={s.inputs.length >= 5 || Boolean(s.pending)}
                onClick={() => {
                  s.inputIds.current.push(crypto.randomUUID());
                  const sample = s.problem.samples[0];
                  if (!sample) return;
                  s.setInputs([...s.inputs, inputDraft(sample.input)]);
                  s.setSelectedCase(String(s.inputs.length));
                }}
              >
                Add case
              </Button>
            </div>
            <CaseInputFields index={index} />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Run checks these visible inputs. Submit uses the complete server
              test suite.
            </p>
          </TabsContent>
          <TabsContent value="test-result">
            <div role="status" aria-live="polite">
              {s.pending ? (
                <p className="py-4 text-sm text-muted-foreground">
                  {s.pending === "submit"
                    ? "Judging the complete test suite…"
                    : "Running your test cases…"}
                </p>
              ) : result ? (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2
                      className="text-base font-semibold"
                      data-testid="execution-verdict"
                    >
                      {verdictLabels[result.verdict]}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {result.passed}/{result.total} tests passed ·{" "}
                      {result.action === "submit" ? "Submit" : "Run"}
                    </span>
                  </div>
                  {stale && (
                    <p className="mb-4 rounded-md border p-3 text-sm text-muted-foreground">
                      Code or inputs changed. These results belong to the
                      earlier version; run again to check your changes.
                    </p>
                  )}
                  <ol className="flex flex-col gap-3">
                    {result.cases.map((c, i) => (
                      <li
                        key={c.id}
                        className="rounded-md border bg-background p-3 text-sm"
                      >
                        <p className="mb-2 font-medium">
                          {c.hidden ? "Hidden case" : `Case ${i + 1}`} ·{" "}
                          {c.passed ? "Passed" : verdictLabels[c.verdict]}
                        </p>
                        {!c.hidden && (
                          <dl className="mb-2 grid grid-cols-2 gap-2 font-mono text-xs">
                            <dt>Input</dt>
                            <dd className="min-w-0 [overflow-wrap:anywhere]">
                              {c.input === undefined
                                ? "—"
                                : formatProblemInput(c.input)}
                            </dd>
                            {s.problem.kind === "delay" ? (
                              <>
                                <dt>Observed delay</dt>
                                <dd>
                                  {c.elapsedMs === undefined
                                    ? "—"
                                    : `${c.elapsedMs} ms`}
                                </dd>
                              </>
                            ) : (
                              <>
                                <dt>Expected</dt>
                                <dd className="max-h-32 overflow-auto [overflow-wrap:anywhere]">
                                  {c.expected
                                    ? JSON.stringify(c.expected)
                                    : "—"}
                                </dd>
                                <dt>Output</dt>
                                <dd className="max-h-32 overflow-auto [overflow-wrap:anywhere]">
                                  {c.actual ? JSON.stringify(c.actual) : "—"}
                                </dd>
                              </>
                            )}
                          </dl>
                        )}
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {c.message}
                        </p>
                        {c.logs.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-medium">
                              Console output
                            </p>
                            <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs [overflow-wrap:anywhere]">
                              {c.logs.join("\n")}
                            </pre>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                !s.error && (
                  <p className="py-5 text-sm text-muted-foreground">
                    Run your code to see test results.
                  </p>
                )
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
