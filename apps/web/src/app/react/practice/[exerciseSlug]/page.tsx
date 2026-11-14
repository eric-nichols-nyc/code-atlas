import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthSetup } from "@/components/auth-setup";
import { staleClosureCounter } from "@/content/react/practice/stale-closure-counter/exercise";
import { ReactWorkspaceClient } from "@/features/react-sandbox/components/react-workspace-client";
import { isReactPilotAvailable } from "@/features/react-sandbox/lib/availability";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "React Practice | Code Atlas" };
export default async function ReactExercisePage({
  params,
}: {
  params: Promise<{ exerciseSlug: string }>;
}) {
  if (!isReactPilotAvailable()) notFound();
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  if ((await params).exerciseSlug !== staleClosureCounter.slug) notFound();
  return <ReactWorkspaceClient />;
}
