"use client";
import dynamic from "next/dynamic";

const Sandbox = dynamic(
  () => import("./react-workspace").then((module) => module.ReactWorkspace),
  {
    ssr: false,
    loading: () => (
      <p role="status" className="p-6 text-muted-foreground">
        Loading React sandbox…
      </p>
    ),
  },
);
export function ReactWorkspaceClient() {
  return <Sandbox />;
}
