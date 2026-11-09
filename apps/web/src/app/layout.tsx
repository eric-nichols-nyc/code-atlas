import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { isAuthConfigured } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Atlas",
  description: "A JavaScript-first learning platform.",
};
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = (
    <html lang="en">
      <body className="flex min-h-svh flex-col">
        <SiteNav />
        {children}
      </body>
    </html>
  );
  return isAuthConfigured() ? (
    <ClerkProvider>{content}</ClerkProvider>
  ) : (
    content
  );
}
