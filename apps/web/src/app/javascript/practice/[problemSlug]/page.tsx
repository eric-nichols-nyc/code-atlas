import { auth } from "@clerk/nextjs/server";
import { findProblem } from "@workspace/problems";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthSetup } from "@/components/auth-setup";
import { javascriptPracticeCatalog } from "@/content/javascript/practice/catalog";
import { ProblemExperience } from "@/features/problems/components/problem-experience";
import { isAuthConfigured } from "@/lib/auth";
export const metadata: Metadata = { title: "JavaScript Practice | Code Atlas" };
export default async function ProblemPage({
  params,
}: {
  params: Promise<{ problemSlug: string }>;
}) {
  if (!isAuthConfigured()) return <AuthSetup />;
  await auth.protect();
  const { problemSlug } = await params;
  const problem = findProblem(problemSlug);
  const entry = javascriptPracticeCatalog.find(
    (x) => x.slug === problemSlug && x.status === "published",
  );
  if (!problem || !entry) notFound();
  const { default: Statement } = await import(
    "@/content/javascript/practice/sleep/problem.mdx"
  );
  return (
    <ProblemExperience problem={problem}>
      <Statement />
    </ProblemExperience>
  );
}
