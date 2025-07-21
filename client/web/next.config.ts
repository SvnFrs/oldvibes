import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // This is crucial for the Docker build

  // Environment variables
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  },
  allowedDevOrigins: ["*"],

  // Image optimization
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
