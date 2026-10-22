import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Next.js development badge ("N") in the corner: not part of the game, and it sat where controls go.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Avatars are capped at 2 MB; leave room for multipart overhead.
      bodySizeLimit: "3mb",
    },
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
