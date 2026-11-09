import { SignUp } from "@clerk/nextjs";
import { AuthSetup } from "@/components/auth-setup";
import { isAuthConfigured } from "@/lib/auth";

export default function SignUpPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <SignUp />
    </main>
  );
}
