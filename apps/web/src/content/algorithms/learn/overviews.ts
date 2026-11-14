import type { ComponentType } from "react";

export const moduleOverviews: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "two-pointers": () => import("./two-pointers/overview.mdx"),
};
