"use client";
import dynamic from "next/dynamic";

const Sandbox = dynamic(
  () => import("./sandbox").then((module) => module.ReactSandbox),
  {
    ssr: false,
    loading: () => (
      <p role="status" className="p-6 text-muted-foreground">
        Loading React sandbox…
      </p>
    ),
  },
);
export function ReactSandboxPrototype() {
  return <Sandbox />;
}
