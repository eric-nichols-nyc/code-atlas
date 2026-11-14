"use client";
import type { ProblemDefinition } from "@workspace/problems";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { LearningWorkspace } from "../../learning/components/learning-workspace";
import { WorkspaceTools } from "../../learning/state/workspace-tools";
import { ProblemNotesSession } from "../state/problem-notes";
import { ProblemSession } from "../state/problem-session";
import { ProblemTutorSession } from "../state/problem-tutor";
import { CodePanel } from "./code-panel";
import { DescriptionPanel } from "./description-panel";
import { ProblemNotes } from "./problem-notes";
import { ResultPanel } from "./result-panel";

const ProblemTutor = dynamic(
  () => import("./problem-tutor").then((module) => module.ProblemTutor),
  {
    loading: () => (
      <p role="status" className="p-3 text-sm text-muted-foreground">
        Loading tutor…
      </p>
    ),
  },
);
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
      <ProblemNotesSession problemId={problem.id} learnerId={learnerId}>
        <ProblemTutorSession>
          <WorkspaceTools>
            <LearningWorkspace
              lesson={<DescriptionPanel>{children}</DescriptionPanel>}
              code={<CodePanel />}
              output={<ResultPanel />}
              notes={<ProblemNotes />}
              tutor={<ProblemTutor />}
            />
          </WorkspaceTools>
        </ProblemTutorSession>
      </ProblemNotesSession>
    </ProblemSession>
  );
}
