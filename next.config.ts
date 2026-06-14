import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/p@ss1", destination: "/admin" },
      { source: "/p@ss1/:path*", destination: "/admin/:path*" },
    ];
  },
};

export default nextConfig;
