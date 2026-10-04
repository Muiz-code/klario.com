import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The investor brief PDF is rendered on the server (app/Klario-Investor-Brief.pdf).
  serverExternalPackages: ["@react-pdf/renderer"],
  async rewrites() {
    return [
      { source: "/marketing", destination: "/admin" },
      { source: "/marketing/:path*", destination: "/admin/:path*" },
    ];
  },
};

export default nextConfig;
