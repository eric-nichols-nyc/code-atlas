import { auth } from "@clerk/nextjs/server";
import { Button } from "@workspace/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthSetup } from "@/components/auth-setup";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "JavaScript Learn | Code Atlas" };

export default async function JavaScriptLearnPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  await auth.protect();
  return (
    <main className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-1 flex-col gap-7 px-5 py-8 md:px-6 md:py-10">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-[28px] leading-9 font-semibold tracking-tight md:text-4xl md:leading-11">
          JavaScript Learn
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          JavaScript learning content is coming soon. Explore coding problems in
          Practice while this section is being prepared.
        </p>
      </header>
      <div>
        <Button asChild>
          <Link href="/javascript/practice">Explore practice problems</Link>
        </Button>
      </div>
    </main>
  );
}
