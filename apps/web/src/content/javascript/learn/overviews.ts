import type { ComponentType } from "react";

export const moduleOverviews: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  closures: () => import("./closures/overview.mdx"),
  "event-loop": () => import("./event-loop/overview.mdx"),
  generators: () => import("./generators/overview.mdx"),
  "heap-stack": () => import("./heap-stack/overview.mdx"),
  "sliding-window": () => import("./sliding-window/overview.mdx"),
  "two-pointers": () => import("./two-pointers/overview.mdx"),
};
