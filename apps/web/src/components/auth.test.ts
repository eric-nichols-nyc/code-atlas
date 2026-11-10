import { createElement } from "react";
import { vi } from "vitest";
import { defineAuthContract } from "../../../../tests/auth-contract";
import RootLayout from "../app/layout";
import { AuthScreen } from "./auth-screen";
import { NavAuth } from "./nav-auth";

const state = vi.hoisted(() => ({
  configured: true,
  isLoaded: true,
  isSignedIn: false,
  userId: null as string | null,
}));

vi.mock("@/lib/auth", () => ({
  isAuthConfigured: () => state.configured,
}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: state.userId }),
}));
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: () => null,
  UserButton: () => createElement("button", { type: "button" }, "Account menu"),
  useAuth: () => {
    if (!state.configured) throw new Error("Clerk is not configured");
    return state;
  },
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

defineAuthContract({ state, AuthScreen, NavAuth, RootLayout });
