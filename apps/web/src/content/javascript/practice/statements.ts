import type { ComponentType } from "react";

export const problemStatements: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "map-array": () => import("./map-array/problem.mdx"),
  "reduce-array": () => import("./reduce-array/problem.mdx"),
  "chunk-array": () => import("./chunk-array/problem.mdx"),
  "function-composition": () => import("./function-composition/problem.mdx"),
  memoize: () => import("./memoize/problem.mdx"),
  sleep: () => import("./sleep/problem.mdx"),
  counter: () => import("./counter/problem.mdx"),
  curry: () => import("./curry/problem.mdx"),
  debounce: () => import("./debounce/problem.mdx"),
  "delay-the-resolution-of-each-promise": () =>
    import("./delay-the-resolution-of-each-promise/problem.mdx"),
  "fibonacci-generator": () => import("./fibonacci-generator/problem.mdx"),
  "filter-elements-from-array": () =>
    import("./filter-elements-from-array/problem.mdx"),
  "flatten-nested-array": () => import("./flatten-nested-array/problem.mdx"),
};
