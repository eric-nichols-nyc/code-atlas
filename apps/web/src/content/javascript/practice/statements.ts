import type { ComponentType } from "react";

export const problemStatements: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  sleep: () => import("./sleep/problem.mdx"),
  counter: () => import("./counter/problem.mdx"),
  debounce: () => import("./debounce/problem.mdx"),
  "filter-elements-from-array": () =>
    import("./filter-elements-from-array/problem.mdx"),
};
