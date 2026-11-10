import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { AuthSetup } from "@/components/auth-setup";
import { javascriptPracticeCatalog } from "@/content/javascript/practice/catalog";
import { JavaScriptPractice } from "@/features/catalog/components/javascript-practice";
import { isAuthConfigured } from "@/lib/auth";
export const metadata: Metadata = { title: "JavaScript Practice | Code Atlas" };
export default async function JavaScriptPracticePage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  const session = await auth.protect();
  return (
    <JavaScriptPractice
      catalog={javascriptPracticeCatalog}
      learnerId={session?.userId}
    />
  );
}
