import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AuthScreen } from "./auth-screen";
import { NavAuth } from "./nav-auth";

const state = vi.hoisted(() => ({
  configured: true,
  isPending: false,
  userId: null as string | null,
  error: null as Error | null,
}));
const signOut = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => state.userId,
}));
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: () => ({
      data: state.userId
        ? {
            user: {
              id: state.userId,
              name: "Test Learner",
              email: "test@example.com",
            },
          }
        : null,
      isPending: state.isPending,
      error: state.error,
      refetch: vi.fn(),
    }),
    signOut,
  },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
beforeEach(() => {
  Object.assign(state, {
    configured: true,
    isPending: false,
    userId: null,
    error: null,
  });
  vi.clearAllMocks();
  signOut.mockResolvedValue({ error: null });
});

it("withholds auth content until configured and redirects verified users", async () => {
  state.configured = false;
  const view = render(await AuthScreen({ children: "Auth form" }));
  expect(screen.getByText("Authentication setup")).toBeVisible();
  expect(screen.queryByText("Auth form")).toBeNull();
  view.unmount();
  state.configured = true;
  render(await AuthScreen({ children: "Auth form" }));
  expect(screen.getByRole("main")).toHaveTextContent("Auth form");
  state.userId = "neon-learner";
  await expect(AuthScreen({ children: "Auth form" })).rejects.toThrow(
    "redirect:/dashboard",
  );
});
it.each([false, true])(
  "links signed-out users to local forms (configured=%s)",
  (configured) => {
    render(<NavAuth configured={configured} />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
  },
);
it("shows pending and failed session states instead of account actions", () => {
  state.isPending = true;
  const view = render(<NavAuth configured />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading account");
  state.isPending = false;
  state.error = new Error("unavailable");
  view.rerender(<NavAuth configured />);
  expect(screen.getByRole("button", { name: "Retry account" })).toBeVisible();
});
it("signs out through Neon and returns to the public landing", async () => {
  state.userId = "neon-learner";
  render(<NavAuth configured />);
  fireEvent.keyDown(screen.getByRole("button", { name: "Open user menu" }), {
    key: "Enter",
  });
  fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  expect(signOut).toHaveBeenCalledOnce();
  expect(refresh).toHaveBeenCalledOnce();
});
it("reports a failed sign-out without navigating away", async () => {
  state.userId = "neon-learner";
  signOut.mockResolvedValue({ error: { message: "unavailable" } });
  render(<NavAuth configured />);
  fireEvent.keyDown(screen.getByRole("button", { name: "Open user menu" }), {
    key: "Enter",
  });
  fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Sign out failed");
  expect(push).not.toHaveBeenCalled();
});
