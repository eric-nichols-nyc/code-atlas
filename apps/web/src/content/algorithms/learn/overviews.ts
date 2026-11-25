import type { ComponentType } from "react";

export const moduleOverviews: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "sliding-window": () => import("./sliding-window/overview.mdx"),
  "two-pointers": () => import("./two-pointers/overview.mdx"),
};
