"use client";

import { useProblemSession } from "../state/problem-session";

export function SolutionPanel() {
  const { problem } = useProblemSession();
  return (
    <section
      className="p-5 [overflow-wrap:anywhere]"
      aria-label="Problem solution"
    >
      <h2 className="mb-4 text-lg font-semibold">Solution</h2>
      <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs leading-6">
        <code>{problem.solution}</code>
      </pre>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {problem.solutionExplanation}
      </p>
    </section>
  );
}
