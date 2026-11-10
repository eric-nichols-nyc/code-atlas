import { SignIn } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth-screen";

export default function SignInPage() {
  return (
    <AuthScreen>
      <SignIn routing="path" path="/sign-in" />
    </AuthScreen>
  );
}
