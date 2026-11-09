import { SignIn } from "@clerk/nextjs";
import { AuthSetup } from "@/components/auth-setup";
import { isAuthConfigured } from "@/lib/auth";

export default function SignInPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <SignIn />
    </main>
  );
}
