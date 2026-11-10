"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import type { ReactNode } from "react";
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
  return (
    <section className="learning-panel" aria-label="Problem description">
      <div className="min-h-0 flex-1 overflow-y-auto p-5 [overflow-wrap:anywhere]">
        <h1 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
          {s.problem.title}
        </h1>
        <div className="mb-6 flex gap-2">
          <Badge variant="secondary">{s.problem.difficulty}</Badge>
          <Badge variant="rose">Async</Badge>
        </div>
        {children}
        <div className="mt-6 flex flex-col gap-5">
          {s.problem.samples.map((example, i) => (
            <section key={example.id}>
              <h2 className="mb-2 text-sm font-semibold">Example {i + 1}</h2>
              <div className="rounded-md border-l-2 bg-background p-3 text-sm leading-relaxed">
                <p className="font-mono">Input: millis = {example.millis}</p>
                <p className="font-mono">
                  Expected delay: ≈ {example.millis} ms
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
