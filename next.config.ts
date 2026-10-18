import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The investor brief PDF is rendered on the server (app/Klario-Investor-Brief.pdf).
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    // Unsplash photography used by blog posts (lib/blog.ts).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async rewrites() {
    return [
      { source: "/marketing", destination: "/admin" },
      { source: "/marketing/:path*", destination: "/admin/:path*" },
    ];
  },
};

export default nextConfig;
