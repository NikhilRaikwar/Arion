import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Enable standalone for Docker, but works with Vercel too
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
};

export default nextConfig;