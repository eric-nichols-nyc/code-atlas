import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import { javascriptPracticeCatalog } from "@/content/javascript/practice/catalog";
import { JavaScriptPractice } from "@/features/catalog/components/javascript-practice";
import { isAuthConfigured } from "@/lib/auth";
import { learnerStorageId, requirePageLearner } from "@/lib/auth/server";
export const metadata: Metadata = { title: "JavaScript Practice | Code Atlas" };
export default async function JavaScriptPracticePage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  const userId = await requirePageLearner();
  return (
    <JavaScriptPractice
      catalog={javascriptPracticeCatalog}
      learnerId={learnerStorageId(userId)}
    />
  );
}
