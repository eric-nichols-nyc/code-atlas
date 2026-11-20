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
import { SparklesIcon } from "@workspace/ui/components/icons";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import {
  EVALUATION_RUBRIC,
  evaluationScore,
} from "../lib/code-evaluation-contract";
import { SAMPLE_EVALUATION_SOURCE } from "../lib/code-evaluation-sample";
import { useProblemSession } from "../state/problem-session";

const tones = {
  strong: {
    badge: "easy",
    text: "text-difficulty-easy",
    border: "border-l-difficulty-easy",
    label: "Strong",
  },
  partial: {
    badge: "amber",
    text: "text-difficulty-medium",
    border: "border-l-difficulty-medium",
    label: "Improve",
  },
  attention: {
    badge: "rose",
    text: "text-difficulty-hard",
    border: "border-l-difficulty-hard",
    label: "Needs attention",
  },
} as const;

export function CodeEvaluationResult() {
  const { evaluation: s, source, pending } = useProblemSession();
  const report = s.latest?.report;
  const sample = s.latest?.kind === "sample";
  const stale = s.latest?.kind === "ai" && s.latest.source !== source;
  const score = report ? evaluationScore(report) : 0;
  const tone =
    tones[score >= 9 ? "strong" : score >= 6 ? "partial" : "attention"];
  return (
    <section
      aria-label="AI evaluation"
      className="flex min-w-0 flex-col gap-4 text-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SparklesIcon
            aria-hidden="true"
            className="size-4 text-category-recommended"
          />
          <h2 className="text-base font-semibold">Code assessment</h2>
          {sample && <Badge variant="amber">Sample feedback</Badge>}
        </div>
        {s.busy && (
          <Button type="button" variant="outline" size="sm" onClick={s.stop}>
            Stop evaluation
          </Button>
        )}
      </div>
      {s.sampleEnabled && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant={s.sampleMode ? "secondary" : "outline"}
            aria-pressed={s.sampleMode}
            disabled={s.busy || Boolean(pending)}
            onClick={() => s.setSamplePreview(!s.sampleMode)}
          >
            Use sample feedback
          </Button>
          <p className="text-xs text-muted-foreground">
            {s.sampleMode
              ? "Sample mode is on. Evaluate loads the example without an AI call."
              : "Preview the layout with a fixed example. No AI call."}
          </p>
        </div>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {sample
          ? "Example report for Majority Element. It does not assess your current code."
          : "AI review of your code · no tests executed · available for this visit"}
      </p>
      <p role="status" aria-live="polite" className="text-muted-foreground">
        {s.busy
          ? "Evaluating correctness, efficiency, code quality and edge cases…"
          : s.error
            ? "Evaluation needs attention."
            : sample
              ? "Sample feedback ready."
              : report
                ? "Evaluation complete."
                : "Select Evaluate to get feedback on your current code."}
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle size="lg">
                  <span data-testid="evaluation-score" className={tone.text}>
                    {score}/10
                  </span>{" "}
                  <span className="text-sm">
                    {sample ? "Sample assessment" : "AI assessment"}
                  </span>
                </CardTitle>
                <Badge variant={tone.badge}>
                  {score >= 9
                    ? "Strong solution"
                    : score >= 6
                      ? "Needs improvement"
                      : "Needs attention"}
                </Badge>
              </div>
              <CardDescription className="[overflow-wrap:anywhere]">
                {report.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <p className="flex flex-wrap items-center gap-2 [overflow-wrap:anywhere]">
                <Badge variant="blue">Time</Badge>
                <span className="font-mono text-xs">
                  {report.timeComplexity}
                </span>
              </p>
              <p className="flex flex-wrap items-center gap-2 [overflow-wrap:anywhere]">
                <Badge variant="blue">Space</Badge>
                <span className="font-mono text-xs">
                  {report.spaceComplexity}
                </span>
              </p>
            </CardContent>
          </Card>
          <ol className="flex flex-col gap-3">
            {EVALUATION_RUBRIC.map((item, i) => {
              const finding = report.criteria[item.key];
              const sectionTone =
                tones[
                  finding.score === item.max
                    ? "strong"
                    : finding.score > 0
                      ? "partial"
                      : "attention"
                ];
              return (
                <li
                  key={item.key}
                  className={cn(
                    "flex min-w-0 flex-col gap-3 rounded-lg border border-l-4 bg-card p-4",
                    sectionTone.border,
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">
                      {i + 1}. {item.title}
                    </h3>
                    <Badge variant={sectionTone.badge}>
                      {finding.score}/{item.max} · {sectionTone.label}
                    </Badge>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]">
                    {finding.explanation}
                  </p>
                </li>
              );
            })}
          </ol>
          {report.improvements.length > 0 && (
            <div className="flex flex-col gap-3 rounded-lg border border-badge-blue-border bg-card p-4">
              <h3 className="font-semibold text-badge-blue-foreground">
                Suggested improvements
              </h3>
              <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-badge-blue-foreground">
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
          {sample && (
            <details className="min-w-0 rounded-lg border p-4">
              <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-ring">
                Example source used for this sample
              </summary>
              <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
                {SAMPLE_EVALUATION_SOURCE}
              </pre>
            </details>
          )}
        </>
      )}
    </section>
  );
}
