import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Code Atlas — Know the concept. Write the code.",
  description:
    "Build your JavaScript skills with focused practice, real test results, and saved progress. Try a closure example, then write your own solution.",
};

export default function HomePage() {
  return <LandingPage />;
}
