import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthSetup } from "@/components/auth-setup";
import { ReactPracticeCatalog } from "@/features/react-sandbox/components/react-practice-catalog";
import { isReactPilotAvailable } from "@/features/react-sandbox/lib/availability";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "React Practice | Code Atlas" };
export default async function ReactPracticePage() {
  if (!isReactPilotAvailable()) notFound();
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  return <ReactPracticeCatalog />;
}
