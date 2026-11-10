import { SignUp } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth-screen";

export default function SignUpPage() {
  return (
    <AuthScreen>
      <SignUp routing="path" path="/sign-up" />
    </AuthScreen>
  );
}
