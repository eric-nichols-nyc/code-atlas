"use client";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import {
  EVALUATION_RUBRIC,
  evaluationScore,
} from "../lib/code-evaluation-contract";
import { useProblemSession } from "../state/problem-session";

export function CodeEvaluationResult() {
  const { evaluation: s, source, pending } = useProblemSession();
  if (s.attemptSource === null) return null;
  const report = s.latest?.report;
  const stale = s.latest && s.latest.source !== source;
  return (
    <section
      aria-label="AI evaluation"
      className="mb-6 flex min-w-0 flex-col gap-4 text-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">AI Evaluation</h2>
        {s.busy && (
          <Button type="button" variant="outline" size="sm" onClick={s.stop}>
            Stop evaluation
          </Button>
        )}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        AI review of your code · no tests executed · available for this visit
      </p>
      <p role="status" aria-live="polite" className="text-muted-foreground">
        {s.busy
          ? "Evaluating correctness, efficiency, code quality and edge cases…"
          : s.error
            ? "Evaluation needs attention."
            : report
              ? "Evaluation complete."
              : ""}
      </p>
      {s.busy && s.attemptSource !== source && (
        <p className="text-muted-foreground">
          Code changed while evaluating. The report will describe the earlier
          version.
        </p>
      )}
      {s.error && (
        <div className="flex flex-wrap items-center gap-3">
          <p role="alert" className="text-destructive">
            {s.error}
          </p>
          {s.signIn && (
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in">Sign in again</Link>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={s.busy || Boolean(pending)}
            onClick={() => void s.evaluate()}
          >
            Retry with current code
          </Button>
        </div>
      )}
      {report && (
        <>
          {s.busy && (
            <p className="text-xs text-muted-foreground">
              Previous completed evaluation
            </p>
          )}
          {stale && (
            <p className="text-muted-foreground">
              Code changed since this evaluation. Select Evaluate to review your
              current code.
            </p>
          )}
          <Card>
            <CardHeader>
              <CardTitle size="lg">
                <span data-testid="evaluation-score">
                  {evaluationScore(report)}/10
                </span>{" "}
                <span className="text-sm">AI assessment</span>
              </CardTitle>
              <CardDescription className="[overflow-wrap:anywhere]">
                {report.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-x-6 gap-y-2">
              <p className="[overflow-wrap:anywhere]">
                <span className="font-medium">Time:</span>{" "}
                {report.timeComplexity}
              </p>
              <p className="[overflow-wrap:anywhere]">
                <span className="font-medium">Space:</span>{" "}
                {report.spaceComplexity}
              </p>
            </CardContent>
          </Card>
          <ol className="flex flex-col gap-5">
            {EVALUATION_RUBRIC.map((item, i) => (
              <li key={item.key} className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">
                    {i + 1}. {item.title}
                  </h3>
                  <Badge variant="secondary">
                    {report.criteria[item.key].score}/{item.max}
                  </Badge>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]">
                  {report.criteria[item.key].explanation}
                </p>
              </li>
            ))}
          </ol>
          {report.improvements.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Suggested improvements</h3>
              <ul className="flex list-disc flex-col gap-2 pl-5">
                {Array.from(new Set(report.improvements)).map((item) => (
                  <li
                    key={item}
                    className="whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
