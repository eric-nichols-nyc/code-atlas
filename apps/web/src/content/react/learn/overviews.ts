import type { ComponentType } from "react";

export const moduleOverviews: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "use-effect-lifecycle": () => import("./use-effect-lifecycle/overview.mdx"),
};
