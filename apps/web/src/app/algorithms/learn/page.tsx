import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import {
  algorithmsLearningCatalog,
  learningTopics,
} from "@/content/algorithms/learn/catalog";
import { LearningCatalog } from "@/features/learning/components/javascript-learn";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Algorithms Learn | Code Atlas" };

export default async function AlgorithmsLearnPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  return (
    <LearningCatalog
      title="Algorithms Learn"
      topics={learningTopics}
      basePath="/algorithms/learn"
      catalog={algorithmsLearningCatalog}
    />
  );
}
