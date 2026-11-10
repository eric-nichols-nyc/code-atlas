import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["@workspace/ui"],
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
