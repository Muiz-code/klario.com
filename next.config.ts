import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/marketing", destination: "/admin" },
      { source: "/marketing/:path*", destination: "/admin/:path*" },
    ];
  },
};

export default nextConfig;
