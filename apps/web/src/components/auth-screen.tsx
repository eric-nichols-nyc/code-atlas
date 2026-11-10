import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { AuthSetup } from "@/components/auth-setup";
import { isAuthConfigured } from "@/lib/auth";

export async function AuthScreen({ children }: { children: ReactNode }) {
  if (!isAuthConfigured()) return <AuthSetup />;
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Suspense fallback={<p role="status">Loading authentication…</p>}>
        {children}
      </Suspense>
    </main>
  );
}
