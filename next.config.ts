import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Above our 1 MB upload limit, so oversized files get our error, not Next's 500.
    serverActions: { bodySizeLimit: "2mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
