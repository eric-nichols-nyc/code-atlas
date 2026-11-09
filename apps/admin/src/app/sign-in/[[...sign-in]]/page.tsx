import { SignIn } from "@clerk/nextjs";
import { isAuthConfigured } from "@/lib/auth";

export default function SignInPage() {
  if (!isAuthConfigured())
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Admin setup</h1>
        <p>Connect Clerk using the project README to enable sign-in.</p>
      </main>
    );
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <SignIn />
    </main>
  );
}
