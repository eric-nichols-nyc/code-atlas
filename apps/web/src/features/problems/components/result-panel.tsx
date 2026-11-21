"use client";
import { Button } from "@workspace/ui/components/button";
import {
  SparklesIcon,
  SquareCheckIcon,
  TerminalIcon,
} from "@workspace/ui/components/icons";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { memo } from "react";
import {
  useProblemCases,
  useProblemOutput,
  useProblemResults,
} from "../state/problem-context";
import { CaseInputFields } from "./case-input-fields";
import { CodeEvaluationResult } from "./code-evaluation";
import { TestResultPanel } from "./test-result-panel";

const outputTabClassName = "gap-1 px-1.5 text-xs sm:gap-1.5 sm:px-2 sm:text-sm";

export function ResultPanel() {
  const s = {
    ...useProblemResults(),
    ...useProblemOutput(),
  };
  return (
    <section className="learning-panel" aria-label="Test cases and results">
      <Tabs
        value={s.outputTab}
        onValueChange={s.setOutputTab}
        className="min-h-0 min-w-0 flex-1 gap-0"
      >
        <div className="learning-panel-header overflow-x-auto">
          <TabsList
            variant="line"
            tone="accent"
            aria-label="Execution output"
            className="shrink-0"
          >
            <TabsTrigger value="testcase" className={outputTabClassName}>
              <SquareCheckIcon
                aria-hidden="true"
                className="size-3 sm:size-4"
              />
              Testcase
            </TabsTrigger>
            <TabsTrigger value="test-result" className={outputTabClassName}>
              <TerminalIcon aria-hidden="true" className="size-3 sm:size-4" />
              Test Result
            </TabsTrigger>
            <TabsTrigger value="feedback" className={outputTabClassName}>
              <SparklesIcon aria-hidden="true" className="size-3 sm:size-4" />
              Feedback
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {s.error && s.outputTab !== "feedback" && (
            <p
              role="alert"
              className="shrink-0 px-4 pt-4 text-sm leading-relaxed text-destructive"
            >
              {s.error}
            </p>
          )}
          <TabsContent value="testcase" className="min-h-0 overflow-auto p-4">
            <TestCases pending={Boolean(s.pending)} />
          </TabsContent>
          <TabsContent
            value="test-result"
            className="flex min-h-0 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <TestResultPanel />
          </TabsContent>
          <TabsContent value="feedback" className="min-h-0 overflow-auto p-4">
            <Feedback />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}

const Feedback = memo(CodeEvaluationResult);

const TestCases = memo(function TestCases({ pending }: { pending: boolean }) {
  const s = useProblemCases();
  const index = Math.min(Number(s.selectedCase), s.inputs.length - 1);
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {s.inputs.map((_, i) => (
          <Button
            key={s.inputIds[i]}
            variant={i === index ? "success" : "ghost"}
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
          disabled={s.inputs.length >= 5 || pending}
          onClick={s.addCase}
        >
          Add case
        </Button>
      </div>
      <CaseInputFields index={index} />
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Run checks these visible inputs. Submit uses the complete server test
        suite.
      </p>
    </>
  );
});
