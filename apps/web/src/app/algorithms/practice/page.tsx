import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import {
  algorithmsPracticeCatalog,
  algorithmTopics,
} from "@/content/algorithms/practice/catalog";
import { PracticeCatalog } from "@/features/catalog/components/javascript-practice";
import { isAuthConfigured } from "@/lib/auth";
import { learnerStorageId, requirePageLearner } from "@/lib/auth/server";
export const metadata: Metadata = { title: "Algorithms Practice | Code Atlas" };
export default async function AlgorithmsPracticePage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  const userId = await requirePageLearner();
  return (
    <PracticeCatalog
      title="Algorithms practice"
      topics={algorithmTopics}
      catalog={algorithmsPracticeCatalog}
      learnerId={learnerStorageId(userId)}
    />
  );
}
