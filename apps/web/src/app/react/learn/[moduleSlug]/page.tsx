import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthSetup } from "@/components/auth-setup";
import {
  learningTopics,
  reactLearningCatalog,
} from "@/content/react/learn/catalog";
import { moduleOverviews } from "@/content/react/learn/overviews";
import { LearningModuleOverview } from "@/features/learning/components/learning-module-overview";
import { findLearningModule } from "@/features/learning/lib/learn-catalog";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "React Learn | Code Atlas" };

export default async function LearningModulePage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  const { moduleSlug } = await params;
  const module = findLearningModule(reactLearningCatalog, moduleSlug);
  const loadOverview = moduleOverviews[moduleSlug];
  if (!module || !loadOverview) notFound();
  const { default: Overview } = await loadOverview();
  return (
    <LearningModuleOverview
      module={module}
      topics={learningTopics}
      basePath="/react/learn"
    >
      <Overview />
    </LearningModuleOverview>
  );
}
