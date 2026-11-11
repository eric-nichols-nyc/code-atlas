import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";
import { isAuthConfigured } from "@/lib/auth";
import { getVerifiedUserId } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Code Atlas — Know the concept. Write the code.",
  description:
    "Build your JavaScript skills with focused practice, real test results, and saved progress. Try a closure example, then write your own solution.",
};

export default async function HomePage() {
  const userId = isAuthConfigured()
    ? await getVerifiedUserId().catch(() => null)
    : null;
  return <LandingPage startHref={userId ? "/dashboard" : "/sign-in"} />;
}
