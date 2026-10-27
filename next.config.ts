import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Next.js development badge ("N") in the corner: not part of the game, and it sat where controls go.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Avatars are capped at 2 MB; artwork uploads on Admin at 15 MB. Leave room for multipart overhead.
      bodySizeLimit: "16mb",
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
