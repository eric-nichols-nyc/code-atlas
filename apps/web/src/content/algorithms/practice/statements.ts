import type { ComponentType } from "react";
export const problemStatements: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "most-frequent-character": () =>
    import("./most-frequent-character/problem.mdx"),
  "valid-anagram": () => import("./valid-anagram/problem.mdx"),
  "longest-substring-two-distinct": () =>
    import("./longest-substring-two-distinct/problem.mdx"),
  "move-zeroes": () => import("./move-zeroes/problem.mdx"),
  "max-consecutive-ones": () => import("./max-consecutive-ones/problem.mdx"),
};
