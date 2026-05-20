import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/merch', destination: '/shop', permanent: true },
      { source: '/merch/:path*', destination: '/shop/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
