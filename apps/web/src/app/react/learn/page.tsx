import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import {
  learningTopics,
  reactLearningCatalog,
} from "@/content/react/learn/catalog";
import { LearningCatalog } from "@/features/learning/components/javascript-learn";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "React Learn | Code Atlas" };

export default async function ReactLearnPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  return (
    <LearningCatalog
      title="React Learn"
      topics={learningTopics}
      basePath="/react/learn"
      catalog={reactLearningCatalog}
    />
  );
}
