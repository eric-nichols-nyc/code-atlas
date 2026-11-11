import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";
import { redirect } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth";

let instance: ReturnType<typeof createNeonAuth> | undefined;

/** Lazy construction keeps builds and public setup pages independent of secrets. */
export function getAuth() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!isAuthConfigured() || !baseUrl || !secret)
    throw new Error("Neon Auth is not configured.");
  instance ??= createNeonAuth({
    baseUrl,
    cookies: { secret },
  });
  return instance;
}

export async function getVerifiedUserId(): Promise<string | null> {
  if (!isAuthConfigured()) return null;
  const { data, error } = await getAuth().getSession();
  if (error) throw new Error("Authentication is temporarily unavailable.");
  return data?.user?.id ?? null;
}

/** Every protected page verifies its own session, independently of the proxy. */
export async function requirePageLearner() {
  const userId = await getVerifiedUserId();
  if (!userId) redirect("/sign-in");
  return userId;
}

// Provider-qualified browser keys prevent old Clerk backups being imported.
export const learnerStorageId = (userId: string) => `neon:${userId}`;
