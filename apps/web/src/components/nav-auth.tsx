"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { LogOutIcon } from "@workspace/ui/components/icons";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

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
function NeonAccount() {
  const { data, isPending, error, refetch } = authClient.useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  if (isPending)
    return (
      <div role="status">
        <Skeleton className="size-8 rounded-full" />
        <span className="sr-only">Loading account</span>
      </div>
    );
  if (error)
    return (
      <Button variant="ghost" onClick={() => refetch()}>
        Retry account
      </Button>
    );
  if (!data?.user) return <AuthLinks />;
  const user = data.user;
  const initials = (user.name || user.email)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  async function signOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) setSignOutError(true);
      else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  }
  return (
    <div className="flex items-center gap-2">
      {signOutError && (
        <span role="alert" className="text-sm text-destructive">
          Sign out failed. Try again.
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Open user menu"
          >
            <Avatar>
              {user.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <span className="block max-w-56 truncate">{user.name}</span>
            <span className="block max-w-56 truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={signingOut}
            onSelect={() => {
              void signOut();
            }}
          >
            <LogOutIcon aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
export function NavAuth({ configured }: { configured: boolean }) {
  return configured ? <NeonAccount /> : <AuthLinks />;
}
