import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard | Code Atlas" };

export default async function DashboardPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  await auth.protect();
  return <DashboardContent />;
}
