import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import { Playground } from "@/features/javascript-playground/components/playground";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Playground | Code Atlas" };

export default async function JavaScriptPlaygroundPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  return <Playground />;
}
