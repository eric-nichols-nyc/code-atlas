import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthSetup } from "@/components/auth-setup";
import {
  algorithmsLearningCatalog,
  learningTopics,
} from "@/content/algorithms/learn/catalog";
import { moduleOverviews } from "@/content/algorithms/learn/overviews";
import { LearningModuleOverview } from "@/features/learning/components/learning-module-overview";
import { findLearningModule } from "@/features/learning/lib/learn-catalog";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Algorithms Learn | Code Atlas" };

export default async function LearningModulePage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  const { moduleSlug } = await params;
  const module = findLearningModule(algorithmsLearningCatalog, moduleSlug);
  const loadOverview = moduleOverviews[moduleSlug];
  if (!module || !loadOverview) notFound();
  const { default: Overview } = await loadOverview();
  return (
    <LearningModuleOverview
      module={module}
      topics={learningTopics}
      basePath="/algorithms/learn"
    >
      <Overview />
    </LearningModuleOverview>
  );
}
