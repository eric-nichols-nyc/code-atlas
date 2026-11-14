import type { ComponentType } from "react";
export const problemStatements: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "valid-anagram": () => import("./valid-anagram/problem.mdx"),
};
