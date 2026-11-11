import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Dashboard | Code Atlas" };

export default async function DashboardPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  return <DashboardContent />;
}
