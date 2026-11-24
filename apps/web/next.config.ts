import { fileURLToPath } from "node:url";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const quickJsAssets = [
  "./node_modules/quickjs-emscripten/**/*",
  "../../node_modules/.pnpm/quickjs-emscripten@*/**/*",
  "../../node_modules/.pnpm/quickjs-emscripten-core@*/**/*",
  "../../node_modules/.pnpm/@jitl+quickjs*/**/*",
];

const nextConfig: NextConfig = {
  distDir: process.env.CODE_ATLAS_DIST_DIR ?? ".next",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["@workspace/ui"],
  serverExternalPackages: ["@workspace/db"],
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
  outputFileTracingIncludes: {
    "/api/problems/**/*": [
      "./src/content/javascript/practice/*/problem.mdx",
      "./src/content/algorithms/practice/*/problem.mdx",
      "./.workers/**/*",
      ...quickJsAssets,
    ],
    "/api/javascript/playground/run": [
      "./.workers/script-worker.js",
      "./.workers/javascript-guest.js",
      "./.workers/console-harness.js",
      ...quickJsAssets,
    ],
  },
  async redirects() {
    return [
      {
        source: "/react",
        destination: "/react/learn",
        permanent: false,
      },
      {
        source: "/algorithms",
        destination: "/algorithms/practice",
        permanent: false,
      },
      {
        source: "/javascript",
        destination: "/javascript/practice",
        permanent: false,
      },
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

export default createMDX()(nextConfig);
