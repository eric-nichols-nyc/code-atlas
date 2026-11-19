"use client";
import type { ProblemDefinition } from "@workspace/problems";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import dynamic from "next/dynamic";
import { type ReactNode, useState } from "react";
import { LearningWorkspace } from "../../learning/components/learning-workspace";
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
          <ProblemWorkspace problem={problem}>{children}</ProblemWorkspace>
        </ProblemTutorSession>
      </ProblemNotesSession>
    </ProblemSession>
  );
}

function ProblemWorkspace({
  problem,
  children,
}: {
  problem: ProblemDefinition;
  children: ReactNode;
}) {
  const [tab, setTab] = useState("problem");
  return (
    <LearningWorkspace
      backHref={`/${problem.subjectId}/practice`}
      subjectTitle={
        problem.subjectId === "algorithms" ? "Algorithms" : "JavaScript"
      }
      lesson={
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="learning-panel gap-0"
        >
          <div className="learning-panel-header">
            <TabsList variant="line" aria-label="Problem workspace">
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="problem" className="min-h-0 overflow-y-auto">
            <DescriptionPanel>{children}</DescriptionPanel>
          </TabsContent>
          <TabsContent value="notes" className="min-h-0 overflow-y-auto p-3">
            <ProblemNotes />
          </TabsContent>
        </Tabs>
      }
      code={<CodePanel />}
      output={<ResultPanel />}
      tutor={<ProblemTutor />}
    />
  );
}
