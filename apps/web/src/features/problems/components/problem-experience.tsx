"use client";
import type { ProblemDefinition } from "@workspace/problems";
import type { ReactNode } from "react";
import { LearningWorkspace } from "../../learning/components/learning-workspace";
import { WorkspaceTools } from "../../learning/state/workspace-tools";
import { ProblemSession } from "../state/problem-session";
import { CodePanel } from "./code-panel";
import { DescriptionPanel } from "./description-panel";
import { ResultPanel } from "./result-panel";
export function ProblemExperience({
  problem,
  learnerId,
  children,
}: {
  problem: ProblemDefinition;
  learnerId?: string;
  children: ReactNode;
}) {
  return (
    <ProblemSession
      key={`${learnerId ?? "guest"}:${problem.id}`}
      problem={problem}
      learnerId={learnerId}
    >
      <WorkspaceTools>
        <LearningWorkspace
          lesson={<DescriptionPanel>{children}</DescriptionPanel>}
          code={<CodePanel />}
          output={<ResultPanel />}
        />
      </WorkspaceTools>
    </ProblemSession>
  );
}
