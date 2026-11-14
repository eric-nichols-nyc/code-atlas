import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import { javascriptLearningCatalog } from "@/content/javascript/learn/catalog";
import { JavaScriptLearn } from "@/features/learning/components/javascript-learn";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "JavaScript Learn | Code Atlas" };

export default async function JavaScriptLearnPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  return <JavaScriptLearn catalog={javascriptLearningCatalog} />;
}
