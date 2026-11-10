import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

type AuthState = {
  configured: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
};

export function defineAuthContract({
  state,
  AuthScreen,
  NavAuth,
  RootLayout,
}: {
  state: AuthState;
  AuthScreen: (props: { children: ReactNode }) => Promise<ReactElement>;
  NavAuth: (props: { configured: boolean }) => ReactElement;
  RootLayout: (props: { children: ReactNode }) => ReactElement;
}) {
  beforeEach(() => {
    Object.assign(state, {
      configured: true,
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    });
  });

  describe("authentication screens", () => {
    it("shows setup information before credentials and withholds auth content", async () => {
      state.configured = false;
      render(await AuthScreen({ children: "Clerk form" }));
      expect(screen.getByText(/^(Authentication|Admin) setup$/)).toBeVisible();
      expect(screen.queryByText("Clerk form")).toBeNull();
    });

    it("allows signed-out users to reach the authentication form", async () => {
      render(await AuthScreen({ children: "Clerk form" }));
      expect(screen.getByRole("main")).toHaveTextContent("Clerk form");
    });

    it("sends users with an active session directly to the dashboard", async () => {
      state.userId = "user_learner";
      await expect(AuthScreen({ children: "Clerk form" })).rejects.toThrow(
        "redirect:/dashboard",
      );
    });

    it("sets both authentication flows to finish at the dashboard", () => {
      const layout = RootLayout({ children: "Page content" });
      expect(layout.props).toMatchObject({
        signInUrl: "/sign-in",
        signUpUrl: "/sign-up",
        signInForceRedirectUrl: "/dashboard",
        signUpForceRedirectUrl: "/dashboard",
        afterSignOutUrl: "/",
      });
    });
  });

  describe("navigation account controls", () => {
    it.each([false, true])(
      "links to the local auth pages when signed out (configured: %s)",
      (configured) => {
        state.configured = configured;
        render(createElement(NavAuth, { configured }));
        expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
          "href",
          "/sign-in",
        );
        expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
          "href",
          "/sign-up",
        );
        expect(
          screen.queryByRole("button", { name: "Account menu" }),
        ).toBeNull();
      },
    );

    it("waits for the session before showing account actions", () => {
      state.isLoaded = false;
      render(createElement(NavAuth, { configured: true }));
      expect(screen.getByRole("status")).toHaveTextContent("Loading account");
      expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
    });

    it("shows the Clerk avatar menu for a signed-in user", () => {
      state.isSignedIn = true;
      render(createElement(NavAuth, { configured: true }));
      expect(
        screen.getByRole("button", { name: "Account menu" }),
      ).toBeVisible();
      expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Sign up" })).toBeNull();
    });
  });
}
