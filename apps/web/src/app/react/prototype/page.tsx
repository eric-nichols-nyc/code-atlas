import { notFound } from "next/navigation";
import { AuthSetup } from "@/components/auth-setup";
import { ReactSandboxPrototype } from "@/features/react-sandbox/prototype/client";
import { isAuthConfigured } from "@/lib/auth";
import { requirePageLearner } from "@/lib/auth/server";

export default async function ReactPrototypePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  if (!isAuthConfigured()) return <AuthSetup />;
  await requirePageLearner();
  return <ReactSandboxPrototype />;
}
