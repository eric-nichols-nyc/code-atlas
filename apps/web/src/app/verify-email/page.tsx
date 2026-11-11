import { AuthScreen } from "@/components/auth-screen";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function AuthPage() {
  return (
    <AuthScreen>
      <AuthForm initialView="verify-email" />
    </AuthScreen>
  );
}
