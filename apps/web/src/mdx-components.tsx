import type { MDXComponents } from "mdx/types";
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => (
      <h2
        className="mt-7 mb-3 text-base leading-6 font-bold first:mt-0"
        {...props}
      />
    ),
    p: (props) => (
      <p
        className="mb-4 text-sm leading-[23px] text-muted-foreground"
        {...props}
      />
    ),
    strong: (props) => (
      <strong className="font-semibold text-foreground" {...props} />
    ),
    code: (props) => (
      <code
        className="rounded bg-muted px-1 py-0.5 font-mono text-[13px] text-foreground [overflow-wrap:anywhere]"
        {...props}
      />
    ),
    ...components,
  };
}
