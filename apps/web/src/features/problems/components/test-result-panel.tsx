"use client";

import type { CaseResult, ProblemInput } from "@workspace/problems";
import { CheckIcon, XIcon } from "@workspace/ui/components/icons";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import type { ReactNode } from "react";
import {
  useProblemDefinition,
  useProblemResults,
} from "../state/problem-context";
import { verdictLabels } from "./description-panel";

export function TestResultPanel() {
  const {
    pending,
    error,
    latest,
    stale,
    selectedResultCase,
    setSelectedResultCase,
  } = useProblemResults();
  const problem = useProblemDefinition();
  const result = latest?.result;

  if (pending)
    return (
      <p role="status" className="p-4 text-sm text-muted-foreground">
        {pending === "submit"
          ? "Judging the complete test suite…"
          : "Running your test cases…"}
      </p>
    );
  if (!result)
    return error ? null : (
      <p className="p-4 text-sm text-muted-foreground">
        Run your code to see test results.
      </p>
    );

  const activeCase = result.cases.some(
    (_, index) => String(index) === selectedResultCase,
  )
    ? selectedResultCase
    : "0";
  const compileError = result.cases.find(
    (item) => !item.hidden && item.verdict === "compile-error",
  );

  return (
    <>
      <div className="shrink-0 border-b px-4 py-3">
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2"
        >
          <h2
            className={`text-sm font-semibold ${result.verdict === "accepted" ? "text-interactive" : "text-destructive"}`}
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
          <p className="mt-3 text-sm text-muted-foreground">
            Code or inputs changed. These results belong to the earlier version;
            run again to check your changes.
          </p>
        )}
      </div>
      {result.verdict === "compile-error" ? (
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <dl className="flex flex-col gap-5">
            <ResultSection label="Error" tone="error">
              {compileError?.message ?? "The solution could not be compiled."}
            </ResultSection>
            <Stdout logs={compileError?.logs ?? []} />
          </dl>
        </div>
      ) : result.cases.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          No test case details were returned. Run again to check your code.
        </p>
      ) : (
        <Tabs
          value={activeCase}
          onValueChange={setSelectedResultCase}
          className="min-h-0 min-w-0 flex-1 gap-0 overflow-hidden"
        >
          <div className="shrink-0 overflow-x-auto border-b px-3 py-2">
            <TabsList
              aria-label="Test result cases"
              className="gap-1 bg-transparent p-0"
            >
              {result.cases.map((item, index) => {
                const Icon = item.passed ? CheckIcon : XIcon;
                const label = item.hidden
                  ? `Hidden case ${index + 1}`
                  : `Case ${index + 1}`;
                return (
                  <TabsTrigger
                    key={item.id}
                    value={String(index)}
                    aria-label={`${label} · ${item.passed ? "Passed" : verdictLabels[item.verdict]}`}
                    className="h-8 flex-none px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:shadow-none"
                  >
                    <Icon
                      aria-hidden="true"
                      className={`size-3 ${item.passed ? "text-interactive" : "text-destructive"}`}
                    />
                    {label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          {result.cases.map((item, index) => (
            <TabsContent
              key={item.id}
              value={String(index)}
              className="min-h-0 overflow-auto p-4"
            >
              <CaseDetails item={item} timing={problem.kind === "delay"} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}

function CaseDetails({ item, timing }: { item: CaseResult; timing: boolean }) {
  // Private values and console output never belong in the public detail view.
  if (item.hidden)
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p className={item.passed ? "text-interactive" : "text-destructive"}>
          {item.passed ? "Hidden case passed." : verdictLabels[item.verdict]}
        </p>
        <p className="text-muted-foreground">
          Inputs, output, expected values and console output are private for
          this case.
        </p>
      </div>
    );

  const executionError =
    item.verdict !== "accepted" && item.verdict !== "wrong-answer";
  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <dt className="text-xs font-medium text-muted-foreground">Input</dt>
          <dd>
            {item.input === undefined ? (
              <ValueBox>—</ValueBox>
            ) : (
              <InputValues input={item.input} />
            )}
          </dd>
        </div>
        <Stdout logs={item.logs} />
        {executionError && (
          <ResultSection label="Error" tone="error">
            {item.message}
          </ResultSection>
        )}
        {timing ? (
          <ResultSection label="Observed delay">
            {item.elapsedMs === undefined ? "—" : `${item.elapsedMs} ms`}
          </ResultSection>
        ) : (
          <>
            <ResultSection
              label="Output"
              tone={item.passed ? "default" : "error"}
            >
              {item.actual === undefined ? "—" : JSON.stringify(item.actual)}
            </ResultSection>
            <ResultSection label="Expected" tone="success">
              {item.expected === undefined
                ? "—"
                : JSON.stringify(item.expected)}
            </ResultSection>
          </>
        )}
      </dl>
      {!executionError && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.message}
        </p>
      )}
    </div>
  );
}

function InputValues({ input }: { input: ProblemInput }) {
  const fields: [string, unknown][] =
    typeof input === "number" ? [["millis", input]] : Object.entries(input);
  return (
    <div className="flex flex-col gap-3">
      {fields.map(([name, value]) => (
        <div key={name} className="flex min-w-0 flex-col gap-1.5">
          <p className="font-mono text-xs text-muted-foreground">
            {["predicate", "transform", "reducer"].includes(name) ? "fn" : name}{" "}
            =
          </p>
          <ValueBox>{JSON.stringify(value)}</ValueBox>
        </div>
      ))}
    </div>
  );
}

function Stdout({ logs }: { logs: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
        Stdout
      </dt>
      <dd>
        {logs.length > 0 ? (
          <ValueBox>{logs.join("\n")}</ValueBox>
        ) : (
          <p className="text-sm text-muted-foreground">No console output.</p>
        )}
      </dd>
    </div>
  );
}

function ResultSection({
  label,
  tone = "default",
  children,
}: {
  label: string;
  tone?: "default" | "success" | "error";
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd>
        <ValueBox tone={tone}>{children}</ValueBox>
      </dd>
    </div>
  );
}

function ValueBox({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "error";
}) {
  const color =
    tone === "error"
      ? "text-destructive"
      : tone === "success"
        ? "text-interactive"
        : "text-foreground";
  return (
    <pre
      className={`max-h-40 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 px-3 py-2.5 font-mono text-sm leading-relaxed [overflow-wrap:anywhere] ${color}`}
    >
      {children}
    </pre>
  );
}
