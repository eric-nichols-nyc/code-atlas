"use client";

import { isAuthApiError } from "@neon/auth/next";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { authClient } from "@/lib/auth/client";

type View =
  | "sign-in"
  | "sign-up"
  | "forgot-password"
  | "reset-password"
  | "verify-email";
const titles: Record<View, string> = {
  "sign-in": "Sign in to Code Atlas",
  "sign-up": "Create your Code Atlas account",
  "forgot-password": "Forgot your password?",
  "reset-password": "Reset your password",
  "verify-email": "Verify your email",
};
const actions: Record<View, string> = {
  "sign-in": "Sign in",
  "sign-up": "Create account",
  "forgot-password": "Send reset code",
  "reset-password": "Reset password",
  "verify-email": "Verify email",
};

function signInError(error: { code?: string; message?: string }) {
  return error.code === "INVALID_EMAIL_OR_PASSWORD" ||
    error.code === "invalid_credentials"
    ? "Account not found or password is incorrect."
    : error.message || "Unable to sign in. Check your details and try again.";
}

export function AuthForm({ initialView }: { initialView: View }) {
  const router = useRouter();
  const id = useId();
  const [view, setView] = useState(initialView);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const hasPassword = ["sign-in", "sign-up", "reset-password"].includes(view);
  const hasCode = view === "reset-password" || view === "verify-email";
  function finish() {
    router.replace("/dashboard");
    router.refresh();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      if (view === "sign-in") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) setError(signInError(result.error));
        else finish();
      } else if (view === "sign-up") {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email,
          password,
        });
        if (result.error)
          setError(result.error.message || "Unable to create your account.");
        else {
          const session = await authClient.getSession();
          if (session.data?.user) finish();
          else {
            const sent = await authClient.emailOtp.sendVerificationOtp({
              email,
              type: "email-verification",
            });
            setView("verify-email");
            setPassword("");
            if (sent.error)
              setError(
                sent.error.message ||
                  "Unable to send a verification code. Try again below.",
              );
            else setNotice("Check your email for a verification code.");
          }
        }
      } else if (view === "forgot-password") {
        const result = await authClient.emailOtp.requestPasswordReset({
          email,
        });
        if (result.error)
          setError(result.error.message || "Unable to request a reset code.");
        else {
          setView("reset-password");
          setNotice(
            "If an account exists for this email, a reset code has been sent.",
          );
        }
      } else if (view === "reset-password") {
        const result = await authClient.emailOtp.resetPassword({
          email,
          otp: code.trim(),
          password,
        });
        if (result.error)
          setError(
            result.error.message ||
              "Unable to reset your password. Check the code.",
          );
        else {
          setPassword("");
          setCode("");
          setView("sign-in");
          setNotice("Password updated. Sign in with your new password.");
        }
      } else {
        const result = await authClient.emailOtp.verifyEmail({
          email,
          otp: code.trim(),
        });
        if (result.error)
          setError(
            result.error.message ||
              "Unable to verify your email. Check the code.",
          );
        else {
          const session = await authClient.getSession();
          if (session.data?.user) finish();
          else {
            setView("sign-in");
            setNotice("Email verified. You can now sign in.");
          }
        }
      }
    } catch (cause) {
      setError(
        isAuthApiError(cause)
          ? view === "sign-in"
            ? signInError(cause)
            : cause.message
          : "Authentication is temporarily unavailable. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  async function google() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      });
      if (result.error)
        setError(result.error.message || "Unable to continue with Google.");
    } catch {
      setError("Authentication is temporarily unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }
  async function resend() {
    setPending(true);
    setError("");
    setNotice("");
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (result.error)
        setError(result.error.message || "Unable to send a verification code.");
      else setNotice("Check your email for a new verification code.");
    } catch {
      setError("Unable to send a code. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">
          <h1>{titles[view]}</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={submit}>
          <FieldGroup>
            {view === "sign-up" && (
              <Field>
                <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
                <Input
                  id={`${id}-name`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  required
                  disabled={pending}
                />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
              <Input
                id={`${id}-email`}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={pending}
              />
            </Field>
            {hasCode && (
              <Field>
                <FieldLabel htmlFor={`${id}-code`}>Email code</FieldLabel>
                <Input
                  id={`${id}-code`}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={12}
                  required
                  disabled={pending}
                />
              </Field>
            )}
            {hasPassword && (
              <Field>
                <FieldLabel htmlFor={`${id}-password`}>
                  {view === "reset-password" ? "New password" : "Password"}
                </FieldLabel>
                <Input
                  id={`${id}-password`}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    view === "sign-in" ? "current-password" : "new-password"
                  }
                  minLength={view === "sign-in" ? undefined : 8}
                  maxLength={128}
                  required
                  disabled={pending}
                />
              </Field>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="text-sm text-muted-foreground">
                {notice}
              </p>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Please wait…" : actions[view]}
            </Button>
          </FieldGroup>
        </form>
        {(view === "sign-in" || view === "sign-up") && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={google}
            disabled={pending}
          >
            Continue with Google
          </Button>
        )}
        {view === "verify-email" && (
          <Button
            type="button"
            variant="outline"
            onClick={resend}
            disabled={pending || !email}
          >
            Resend verification code
          </Button>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {view === "sign-in" ? (
            <>
              <Link className="hover:text-foreground" href="/sign-up">
                Create account
              </Link>
              <Link className="hover:text-foreground" href="/forgot-password">
                Forgot password?
              </Link>
              <Link className="hover:text-foreground" href="/verify-email">
                Verify email
              </Link>
            </>
          ) : (
            <Link className="hover:text-foreground" href="/sign-in">
              Back to sign in
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
