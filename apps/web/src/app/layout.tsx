import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";
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
  const authConfigured = isAuthConfigured();
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <SiteNav authConfigured={authConfigured} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
  return authConfigured ? (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      afterSignOutUrl="/"
    >
      {content}
    </ClerkProvider>
  ) : (
    content
  );
}
