import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Django API routes keep a trailing slash. In local dev, Next rewrites /api
  // and /media to the API, so it must not strip that slash.
  skipTrailingSlashRedirect: isDev,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    if (!isDev) {
      return [];
    }

    return [
      {
        source: "/api/:path*/",
        destination: "http://127.0.0.1:8000/api/:path*/",
      },
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      {
        source: "/media/:path*/",
        destination: "http://127.0.0.1:8000/media/:path*/",
      },
      {
        source: "/media/:path*",
        destination: "http://127.0.0.1:8000/media/:path*",
      },
    ];
  },
};

export default nextConfig;
