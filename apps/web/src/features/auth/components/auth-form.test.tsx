import { AuthApiError } from "@neon/auth/next";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AuthForm } from "./auth-form";

const client = vi.hoisted(() => ({
  signIn: { email: vi.fn(), social: vi.fn() },
  signUp: { email: vi.fn() },
  getSession: vi.fn(),
  emailOtp: {
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    sendVerificationOtp: vi.fn(),
  },
}));
const replace = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/client", () => ({ authClient: client }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
beforeEach(() => {
  vi.resetAllMocks();
  client.getSession.mockResolvedValue({ data: { user: { id: "neon-user" } } });
});
function email() {
  fireEvent.change(screen.getByLabelText("Email", { exact: true }), {
    target: { value: "learner@example.com" },
  });
}
function password(label = "Password") {
  fireEvent.change(screen.getByLabelText(label, { exact: true }), {
    target: { value: "test-password-only" },
  });
}
function submit(
  name:
    | "Sign in"
    | "Create account"
    | "Send reset code"
    | "Reset password"
    | "Continue with Google",
) {
  fireEvent.click(screen.getByRole("button", { name }));
}
it("uses Neon email login and opens Dashboard", async () => {
  client.signIn.email.mockResolvedValue({ error: null });
  render(<AuthForm initialView="sign-in" />);
  email();
  password();
  submit("Sign in");
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  expect(client.signIn.email).toHaveBeenCalledWith({
    email: "learner@example.com",
    password: "test-password-only",
  });
});
it("reports failed login and restores the controls", async () => {
  client.signIn.email.mockResolvedValue({
    error: {
      code: "INVALID_EMAIL_OR_PASSWORD",
      message: "Invalid email or password",
    },
  });
  render(<AuthForm initialView="sign-in" />);
  email();
  password();
  submit("Sign in");
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Account not found or password is incorrect.",
  );
  expect(replace).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
});
it("handles the rejected AuthApiError produced by the live Neon SDK", async () => {
  client.signIn.email.mockRejectedValue(
    new AuthApiError("Invalid email or password", 401, "invalid_credentials"),
  );
  render(<AuthForm initialView="sign-in" />);
  email();
  password();
  submit("Sign in");
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Account not found or password is incorrect.",
  );
  expect(replace).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
});
it("creates a fresh Neon account with no legacy identity supplied", async () => {
  client.signUp.email.mockResolvedValue({ error: null });
  render(<AuthForm initialView="sign-up" />);
  email();
  password();
  fireEvent.change(screen.getByLabelText("Name", { exact: true }), {
    target: { value: "Learner" },
  });
  submit("Create account");
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  expect(client.signUp.email).toHaveBeenCalledWith({
    name: "Learner",
    email: "learner@example.com",
    password: "test-password-only",
  });
});
it("uses email codes for password recovery and returns to sign in", async () => {
  client.emailOtp.requestPasswordReset.mockResolvedValue({ error: null });
  client.emailOtp.resetPassword.mockResolvedValue({ error: null });
  render(<AuthForm initialView="forgot-password" />);
  email();
  submit("Send reset code");
  await screen.findByLabelText("Email code");
  fireEvent.change(screen.getByLabelText("Email code"), {
    target: { value: "123456" },
  });
  password("New password");
  submit("Reset password");
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Password updated",
  );
  expect(client.emailOtp.resetPassword).toHaveBeenCalledWith({
    email: "learner@example.com",
    otp: "123456",
    password: "test-password-only",
  });
  expect(replace).not.toHaveBeenCalled();
});
it("keeps Google callbacks on the application dashboard", async () => {
  client.signIn.social.mockResolvedValue({ error: null });
  render(<AuthForm initialView="sign-in" />);
  submit("Continue with Google");
  await waitFor(() =>
    expect(client.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    }),
  );
});
it("requests verification when sign-up has no session and finishes after the email code", async () => {
  client.signUp.email.mockResolvedValue({ error: null });
  client.getSession
    .mockResolvedValueOnce({ data: null })
    .mockResolvedValueOnce({ data: { user: { id: "verified-user" } } });
  client.emailOtp.sendVerificationOtp.mockResolvedValue({ error: null });
  client.emailOtp.verifyEmail.mockResolvedValue({ error: null });
  render(<AuthForm initialView="sign-up" />);
  email();
  password();
  fireEvent.change(screen.getByLabelText("Name", { exact: true }), {
    target: { value: "Learner" },
  });
  submit("Create account");
  await screen.findByLabelText("Email code");
  expect(replace).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Email code"), {
    target: { value: "123456" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Verify email" }));
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  expect(client.emailOtp.verifyEmail).toHaveBeenCalledWith({
    email: "learner@example.com",
    otp: "123456",
  });
});
it("recovers from a network failure without leaving the form pending", async () => {
  client.signIn.email.mockRejectedValue(new Error("offline"));
  render(<AuthForm initialView="sign-in" />);
  email();
  password();
  submit("Sign in");
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "temporarily unavailable",
  );
  expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  expect(replace).not.toHaveBeenCalled();
});
