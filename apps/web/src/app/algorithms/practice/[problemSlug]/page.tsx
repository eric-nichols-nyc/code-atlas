import { findProblem } from "@workspace/problems";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthSetup } from "@/components/auth-setup";
import { algorithmsPracticeCatalog } from "@/content/algorithms/practice/catalog";
import { problemStatements } from "@/content/algorithms/practice/statements";
import { ProblemExperience } from "@/features/problems/components/problem-experience";
import { evaluationSamplesEnabled } from "@/features/problems/server/evaluation-samples";
import { isAuthConfigured } from "@/lib/auth";
import { learnerStorageId, requirePageLearner } from "@/lib/auth/server";
export const metadata: Metadata = { title: "Algorithms Practice | Code Atlas" };
export default async function ProblemPage({
  params,
}: {
  params: Promise<{ problemSlug: string }>;
}) {
  if (!isAuthConfigured()) return <AuthSetup />;
  const userId = await requirePageLearner();
  const { problemSlug } = await params;
  const problem = findProblem(problemSlug);
  const entry = algorithmsPracticeCatalog.find(
    (x) => x.slug === problemSlug && x.status === "published",
  );
  const loadStatement = problemStatements[problemSlug];
  if (problem?.subjectId !== "algorithms" || !entry || !loadStatement)
    notFound();
  const { default: Statement } = await loadStatement();
  return (
    <ProblemExperience
      problem={problem}
      learnerId={learnerStorageId(userId)}
      evaluationSamples={evaluationSamplesEnabled()}
    >
      <Statement />
    </ProblemExperience>
  );
}
