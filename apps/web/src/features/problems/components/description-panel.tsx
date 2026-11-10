"use client";

import { formatProblemInput } from "@workspace/problems";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import type { ReactNode } from "react";
import { DifficultyBadge } from "../../catalog/components/difficulty-badge";
import { topics } from "../../learning/lib/catalog";
import { useProblemSession } from "../state/problem-session";

export const verdictLabels = {
  accepted: "Accepted",
  "wrong-answer": "Wrong Answer",
  "compile-error": "Compile Error",
  "runtime-error": "Runtime Error",
  "time-limit-exceeded": "Time Limit Exceeded",
};

export function DescriptionPanel({ children }: { children: ReactNode }) {
  const s = useProblemSession();
  const topic = topics.find((item) => item.id === s.problem.topicId);
  return (
    <section className="learning-panel" aria-label="Problem description">
      <div className="min-h-0 flex-1 overflow-y-auto p-5 [overflow-wrap:anywhere]">
        <h1 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
          {s.problem.title}
        </h1>
        <div className="mb-6 flex gap-2">
          <DifficultyBadge difficulty={s.problem.difficulty} />
          <Badge variant={topic?.variant}>{topic?.label}</Badge>
        </div>
        {children}
        <div className="mt-6 flex flex-col gap-5">
          {s.problem.samples.map((example, i) => (
            <section key={example.id}>
              <h2 className="mb-2 text-sm font-semibold">Example {i + 1}</h2>
              <div className="rounded-md border-l-2 bg-background p-3 text-sm leading-relaxed">
                <p className="font-mono [overflow-wrap:anywhere]">
                  Input: {formatProblemInput(example.input)}
                </p>
                <p className="font-mono">
                  {typeof example.input === "number"
                    ? `Expected delay: ≈ ${example.input} ms`
                    : `Output: ${JSON.stringify(example.expected)}`}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {example.explanation}
                </p>
              </div>
            </section>
          ))}
        </div>
        <h2 className="mt-7 mb-3 text-sm font-semibold">Constraints</h2>
        <ul className="flex list-disc flex-col gap-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          {s.problem.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
        <h2 className="mt-7 mb-2 text-sm font-semibold">Hints and solution</h2>
        <Accordion
          type="multiple"
          value={s.helpSections}
          onValueChange={s.setHelpSections}
        >
          {s.problem.hints.map((hint, index) => (
            <AccordionItem key={hint} value={`hint-${index}`}>
              <AccordionTrigger>Hint {index + 1}</AccordionTrigger>
              <AccordionContent className="leading-relaxed">
                {hint}
              </AccordionContent>
            </AccordionItem>
          ))}
          <AccordionItem value="solution">
            <AccordionTrigger>Solution</AccordionTrigger>
            <AccordionContent>
              <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs leading-6">
                <code>{s.problem.solution}</code>
              </pre>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {s.problem.solutionExplanation}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
