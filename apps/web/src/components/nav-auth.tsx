"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";

function AuthLinks() {
  return (
    <>
      <Button asChild variant="ghost">
        <Link href="/sign-in" prefetch={false}>
          Sign in
        </Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up" prefetch={false}>
          Sign up
        </Link>
      </Button>
    </>
  );
}

function AccountLoading() {
  return (
    <div role="status">
      <Skeleton className="size-8 rounded-full" />
      <span className="sr-only">Loading account</span>
    </div>
  );
}

function ClerkAccount() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <AccountLoading />;
  if (!isSignedIn) return <AuthLinks />;
  return <UserButton fallback={<AccountLoading />} />;
}

export function NavAuth({ configured }: { configured: boolean }) {
  return configured ? <ClerkAccount /> : <AuthLinks />;
}
