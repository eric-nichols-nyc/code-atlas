import { fileURLToPath } from "node:url";
import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["@workspace/ui"],
  serverExternalPackages: ["@workspace/db"],
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
  outputFileTracingIncludes: {
    "/api/problems/**/*": [
      "./src/content/javascript/practice/*/problem.mdx",
      "./.workers/**/*",
      "./node_modules/quickjs-emscripten/**/*",
      "../../node_modules/.pnpm/quickjs-emscripten@*/**/*",
      "../../node_modules/.pnpm/quickjs-emscripten-core@*/**/*",
      "../../node_modules/.pnpm/@jitl+quickjs*/**/*",
    ],
  },
  async redirects() {
    return [
      {
        source: "/learn/javascript",
        destination: "/javascript/practice",
        permanent: true,
      },
      {
        source: "/learn/javascript/:problemSlug",
        destination: "/javascript/practice/:problemSlug",
        permanent: true,
      },
    ];
  },
};

export default bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
})(createMDX()(nextConfig));
